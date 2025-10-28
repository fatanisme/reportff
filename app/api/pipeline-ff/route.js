import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

const QUERY = `
WITH cancel_apps AS (
  SELECT NO_APLIKASI, COUNT(*) AS CNT
  FROM ILOS.TBL_CANCEL_APLIKASI
  GROUP BY NO_APLIKASI
),
base AS (
  SELECT
    app.NO_APLIKASI,
    REPLACE(REPLACE(REPLACE(app.NAMA_CUSTOMER, '{value=', ''), ', storeType=javapp.lang.String}', ''), ', storeType=java.lang.String}', '') AS NAMA_NASABAH,
    REPLACE(REPLACE(REPLACE(app.JENIS_PRODUK, '{value=', ''), ', storeType=javapp.lang.String}', ''), ', storeType=java.lang.String}', '') AS JENIS_PRODUK,
    REPLACE(REPLACE(app.TIPE_PRODUK, '{value=', ''), ', storeType=java.lang.String}', '') AS TIPE_PRODUK_KODE,
    TO_NUMBER(NULLIF(ILOS.f_get_value_clob(app.DATA, 'jumlahPengajuan'), '')) AS PLAFOND,
    TO_NUMBER(NULLIF(ILOS.f_get_value_clob(app.DATA, 'maxLimit'), '')) AS PLAFOND_LIMIT,
    TO_NUMBER(NULLIF(ILOS.f_get_value_clob(app.DATA, 'maxTenor'), '')) AS TENOR,
    ILOS.f_get_value_clob(app.DATA, 'kodeProgram') AS KODE_PROGRAM,
    app.FLOW_CODE,
    app.BRANCH_CODE,
    app.CREATE_DATE
  FROM ILOS.TBL_APLIKASI app
  WHERE app.NO_APLIKASI > '20190615'
    AND (LOWER(app.JENIS_PRODUK) LIKE '%mitraguna%' OR LOWER(app.JENIS_PRODUK) LIKE '%pensiun%')
    AND app.FLOW_CODE NOT LIKE '%_HOLD%'
)
SELECT
  base.NO_APLIKASI,
  base.NAMA_NASABAH,
  base.JENIS_PRODUK,
  b.BRANCH_CODE || ' - ' || b.NAME AS CABANG,
  CASE
    WHEN b.LVL = '2' THEN b.BRANCH_CODE || ' - ' || b.NAME
    WHEN b.LVL = '3' THEN (
      SELECT c.BRANCH_CODE || ' - ' || c.NAME
      FROM ILOS.TBL_BRANCH c
      WHERE c.BRANCH_CODE = b.PARENT_ID
    )
    ELSE NULL
  END AS AREA,
  CASE
    WHEN b.LVL = '2' THEN (
      SELECT c.BRANCH_CODE || ' - ' || c.NAME
      FROM ILOS.TBL_BRANCH c
      WHERE c.BRANCH_CODE = b.PARENT_ID
    )
    WHEN b.LVL = '3' THEN (
      SELECT c.BRANCH_CODE || ' - ' || c.NAME
      FROM ILOS.TBL_BRANCH c
      WHERE c.BRANCH_CODE = b.PARENT_ADMINISTRASI
    )
    ELSE NULL
  END AS REGION,
  base.PLAFOND,
  base.PLAFOND_LIMIT,
  base.TENOR,
  CASE
    WHEN base.FLOW_CODE LIKE '%REJECT%' THEN
      CASE
        WHEN NVL(cancel_apps.CNT, 0) > 0 THEN '88 - CANCEL'
        ELSE '99 - REJECT'
      END
    ELSE
      CASE
        WHEN base.FLOW_CODE LIKE '%IDE%' THEN '10 - IDE'
        WHEN base.FLOW_CODE LIKE '%DEDUPE%' THEN '11 - DEDUPE'
        WHEN base.FLOW_CODE LIKE '%BI-CHECKING%' THEN '12 - iDEB'
        WHEN base.FLOW_CODE LIKE '%UPLOAD-DOC%' THEN '13 - UPLOAD DOC'
        WHEN base.FLOW_CODE LIKE '%DDE%' THEN '14 - DDE'
        WHEN base.FLOW_CODE LIKE '%OTORISASI-VERIN%' THEN '15 - VERIN'
        WHEN base.FLOW_CODE LIKE '%VERIN%' THEN '15 - VERIN'
        WHEN base.FLOW_CODE LIKE '%APPROVAL%' THEN '16 - APPROVAL'
        WHEN base.FLOW_CODE LIKE '%SP3%' THEN '17 - SP3'
        WHEN base.FLOW_CODE LIKE '%ORDER-AKAD%' THEN '17 - SP3'
        WHEN base.FLOW_CODE LIKE '%REVIEW-AKAD%' THEN '17 - SP3'
        WHEN base.FLOW_CODE LIKE '%AKAD-DAN-PENCAIRAN%' THEN '18 - AKAD'
        WHEN base.FLOW_CODE LIKE '%OTORISASI-AKAD-DAN-PENCAIRAN%' THEN '18 - AKAD'
        WHEN base.FLOW_CODE LIKE '%REVIEW-DAN-PENCAIRAN%' THEN '19 - REVIEW'
        WHEN base.FLOW_CODE LIKE '%OTORISASI-REVIEW-DAN-PENCAIRAN%' THEN '19 - REVIEW'
        WHEN base.FLOW_CODE LIKE '%LIVE%' THEN '20 - LIVE'
        ELSE REPLACE(REPLACE(REPLACE(REPLACE(base.FLOW_CODE, 'STAGE-', ''), '-PENSIUN', ''), '-IMPLAN', ''), '-', ' ')
      END
  END AS LAST_POSISI,
  COALESCE(p.NAMA_PRODUCT, '-') AS TIPE_PRODUK,
  CASE
    WHEN LOWER(base.JENIS_PRODUK) LIKE '%pensiun%' THEN (
      SELECT MAX(ev.EVENT_NO || ' - ' || ev.EVENT_NAME)
      FROM ILOS.TBL_EVENT_PENSIUN ev
      WHERE ev.EVENT_NO = base.KODE_PROGRAM
    )
    WHEN LOWER(base.JENIS_PRODUK) LIKE '%mitraguna%' THEN (
      SELECT MAX(ev.EVENT_NO || ' - ' || ev.EVENT_NAME)
      FROM ILOS.TBL_EVENT_IMPLAN ev
      WHERE ev.EVENT_NO = base.KODE_PROGRAM
    )
    ELSE (
      SELECT MAX(ev.EVENT_NO || ' - ' || ev.EVENT_NAME)
      FROM ILOS.TBL_EVENT ev
      WHERE ev.EVENT_NO = base.KODE_PROGRAM
    )
  END AS PROGRAM_EVENT
FROM base
LEFT JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = base.BRANCH_CODE
LEFT JOIN ILOS.TBL_PRODUCT p ON p.KODE_PRODUCT = base.TIPE_PRODUK_KODE
LEFT JOIN cancel_apps ON cancel_apps.NO_APLIKASI = base.NO_APLIKASI
ORDER BY base.CREATE_DATE DESC, base.NO_APLIKASI DESC
`;

export async function GET() {
  try {
    const rows = await executeQuery(QUERY, {}, { autoCommit: false });
    return NextResponse.json({
      success: true,
      data: Array.isArray(rows) ? rows : [],
    });
  } catch (error) {
    console.error("Error fetch pipeline FF:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data Pipeline FF" },
      { status: 500 }
    );
  }
}
