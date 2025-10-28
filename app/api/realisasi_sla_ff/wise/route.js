import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

const QUERY = `
WITH
  hist_dde AS (
    SELECT
      h.NO_APLIKASI,
      h.CREATE_DATE,
      h.UPDATE_DATE,
      h.UPDATE_BY,
      h.CREATE_BY,
      ROW_NUMBER() OVER (PARTITION BY h.NO_APLIKASI ORDER BY h.CREATE_DATE DESC) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
    WHERE h.FLOW_CODE LIKE '%STAGE-DDE%'
  ),
  hist_verin AS (
    SELECT
      h.NO_APLIKASI,
      h.CREATE_DATE,
      h.UPDATE_DATE,
      h.UPDATE_BY,
      ROW_NUMBER() OVER (PARTITION BY h.NO_APLIKASI ORDER BY h.CREATE_DATE DESC) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
    WHERE h.FLOW_CODE LIKE '%STAGE-VERIN%'
  ),
  hist_otor_verin AS (
    SELECT
      h.NO_APLIKASI,
      h.CREATE_DATE,
      h.UPDATE_DATE,
      h.UPDATE_BY,
      ROW_NUMBER() OVER (PARTITION BY h.NO_APLIKASI ORDER BY h.CREATE_DATE DESC) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
    WHERE h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%'
  ),
  hist_approval AS (
    SELECT
      h.NO_APLIKASI,
      h.CREATE_DATE,
      h.UPDATE_DATE,
      h.UPDATE_BY,
      ROW_NUMBER() OVER (PARTITION BY h.NO_APLIKASI ORDER BY h.CREATE_DATE DESC) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
    WHERE h.FLOW_CODE LIKE '%STAGE-APPROVAL%'
  ),
  last_hist AS (
    SELECT
      h.NO_APLIKASI,
      h.FLOW_CODE,
      ROW_NUMBER() OVER (PARTITION BY h.NO_APLIKASI ORDER BY h.CREATE_DATE DESC) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
  ),
  user_branches AS (
    SELECT
      u.USER_ID,
      u.BRANCH_CODE,
      br.NAME AS BRANCH_NAME
    FROM ILOS.TBL_USER u
    LEFT JOIN ILOS.TBL_BRANCH br ON br.BRANCH_CODE = u.BRANCH_CODE
  )
SELECT
  app.NO_APLIKASI,
  REPLACE(REPLACE(REPLACE(app.JENIS_PRODUK, '{value=', ''), ', storeType=javapp.lang.String}', ''), ', storeType=java.lang.String}', '') AS JENIS_PRODUK,
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
  TO_CHAR(dde.CREATE_DATE, 'yyyy-mm-dd HH24:MI:SS') AS IN_DDE,
  TO_CHAR(COALESCE(dde.UPDATE_DATE, dde.CREATE_DATE), 'yyyy-mm-dd HH24:MI:SS') AS OUT_DDE,
  CASE
    WHEN dde.CREATE_DATE IS NOT NULL THEN
      GREATEST(
        ROUND(
          (CAST(COALESCE(dde.UPDATE_DATE, dde.CREATE_DATE) AS DATE) - CAST(dde.CREATE_DATE AS DATE)) *
            86400
        ),
        0
      )
    ELSE NULL
  END AS SLA_DDE_SEC,
  TO_CHAR(verin.CREATE_DATE, 'yyyy-mm-dd HH24:MI:SS') AS IN_VERIN,
  TO_CHAR(COALESCE(verin_otor.UPDATE_DATE, verin.UPDATE_DATE, verin.CREATE_DATE), 'yyyy-mm-dd HH24:MI:SS') AS OUT_VERIN,
  CASE
    WHEN verin.CREATE_DATE IS NOT NULL THEN
      GREATEST(
        ROUND(
          (
            CAST(COALESCE(verin_otor.UPDATE_DATE, verin.UPDATE_DATE, verin.CREATE_DATE) AS DATE) -
            CAST(verin.CREATE_DATE AS DATE)
          ) *
            86400
        ),
        0
      )
    ELSE NULL
  END AS SLA_VERIN_SEC,
  TO_CHAR(approval.CREATE_DATE, 'yyyy-mm-dd HH24:MI:SS') AS IN_APPROVAL,
  TO_CHAR(COALESCE(approval.UPDATE_DATE, approval.CREATE_DATE), 'yyyy-mm-dd HH24:MI:SS') AS OUT_APPROVAL,
  CASE
    WHEN approval.CREATE_DATE IS NOT NULL THEN
      GREATEST(
        ROUND(
          (CAST(COALESCE(approval.UPDATE_DATE, approval.CREATE_DATE) AS DATE) -
            CAST(approval.CREATE_DATE AS DATE)) *
            86400
        ),
        0
      )
    ELSE NULL
  END AS SLA_APPROVAL_SEC,
  CASE
    WHEN dde.CREATE_DATE IS NOT NULL AND COALESCE(approval.UPDATE_DATE, approval.CREATE_DATE) IS NOT NULL THEN
      GREATEST(
        ROUND(
          (
            CAST(COALESCE(approval.UPDATE_DATE, approval.CREATE_DATE) AS DATE) -
            CAST(dde.CREATE_DATE AS DATE)
          ) *
            86400
        ),
        0
      )
    ELSE NULL
  END AS TOTAL_SLA_SEC,
  COALESCE(last_hist.FLOW_CODE, app.FLOW_CODE) AS LAST_POSISI,
  COALESCE(
    ub_dde.BRANCH_CODE || ' - ' || ub_dde.BRANCH_NAME,
    ub_dde.BRANCH_CODE,
    '-'
  ) AS BRANCH_DDE,
  COALESCE(
    ub_verin.BRANCH_CODE || ' - ' || ub_verin.BRANCH_NAME,
    ub_verin.BRANCH_CODE,
    '-'
  ) AS BRANCH_VERIN,
  COALESCE(
    ub_approval.BRANCH_CODE || ' - ' || ub_approval.BRANCH_NAME,
    ub_approval.BRANCH_CODE,
    '-'
  ) AS BRANCH_APPROVAL
FROM ILOS.TBL_APLIKASI app
LEFT JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = app.BRANCH_CODE
LEFT JOIN hist_dde dde ON dde.NO_APLIKASI = app.NO_APLIKASI AND dde.rn = 1
LEFT JOIN hist_verin verin ON verin.NO_APLIKASI = app.NO_APLIKASI AND verin.rn = 1
LEFT JOIN hist_otor_verin verin_otor ON verin_otor.NO_APLIKASI = app.NO_APLIKASI AND verin_otor.rn = 1
LEFT JOIN hist_approval approval ON approval.NO_APLIKASI = app.NO_APLIKASI AND approval.rn = 1
LEFT JOIN last_hist ON last_hist.NO_APLIKASI = app.NO_APLIKASI AND last_hist.rn = 1
LEFT JOIN user_branches ub_dde ON ub_dde.USER_ID = COALESCE(dde.UPDATE_BY, dde.CREATE_BY)
LEFT JOIN user_branches ub_verin ON ub_verin.USER_ID = COALESCE(verin_otor.UPDATE_BY, verin.UPDATE_BY)
LEFT JOIN user_branches ub_approval ON ub_approval.USER_ID = approval.UPDATE_BY
WHERE
  (
    (dde.CREATE_DATE IS NOT NULL AND TRUNC(COALESCE(dde.UPDATE_DATE, dde.CREATE_DATE)) = TO_DATE(:p_tgl, 'YYYY-MM-DD'))
    OR (
      TRUNC(app.CREATE_DATE) = TO_DATE(:p_tgl, 'YYYY-MM-DD')
      AND NOT (
        app.FLOW_CODE LIKE 'STAGE-IDE%'
        OR app.FLOW_CODE LIKE 'STAGE-DEDUPE%'
        OR app.FLOW_CODE LIKE 'STAGE-BI-CHECKING%'
        OR app.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%'
      )
    )
  )
  AND (LOWER(app.JENIS_PRODUK) LIKE '%mitraguna%' OR LOWER(app.JENIS_PRODUK) LIKE '%pensiun%')
  AND app.NO_APLIKASI > '20190615'
  AND app.FLOW_CODE NOT LIKE '%_HOLD%'
ORDER BY app.NO_APLIKASI
`;

export async function GET(request) {
  const url = request.nextUrl;
  const tgl = url.searchParams.get("tgl");

  if (!tgl) {
    return NextResponse.json(
      { success: false, message: "Parameter tgl wajib diisi" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(tgl)) {
    return NextResponse.json(
      { success: false, message: "Format tanggal harus yyyy-mm-dd" },
      { status: 400 }
    );
  }

  try {
    const rows = await executeQuery(
      QUERY,
      { p_tgl: tgl },
      { autoCommit: false }
    );

    return NextResponse.json({
      success: true,
      data: Array.isArray(rows) ? rows : [],
    });
  } catch (error) {
    console.error("Error fetch realisasi SLA FF WISE:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data Realisasi SLA FF" },
      { status: 500 }
    );
  }
}
