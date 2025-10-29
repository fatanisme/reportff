import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

const FLOW_CODE_PATTERNS = {
  IDE: ["%IDE%"],
  DEDUPE: ["%DEDUPE%"],
  IDEB: ["%BI-CHECKING%"],
  UPLOAD_DOC: ["%UPLOAD-DOC%"],
  DDE: ["%STAGE-DDE%"],
  VERIN: ["%STAGE-VERIFIKASI%", "%STAGE-VERIN%"],
  OTOR_VERIN: ["%STAGE-OTORISASI-VERIFIKASI%"],
  VALID: ["%VALID%"],
  APPROVAL: ["%APPROVAL%"],
  SP3: ["%STAGE-SP-3%", "%STAGE-SP3%"],
  AKAD: ["%STAGE-AKAD%", "%STAGE-AKAD-DAN-PENCAIRAN%"],
  OTOR_AKAD: ["%STAGE-OTORISASI-AKAD%", "%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%"],
  REVIEW: ["%STAGE-REVIEW-DAN-PENCAIRAN%"],
  OTOR_REVIEW: ["%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%"],
  CAIR: [
    "%LIVE%",
    "%STAGE-AKAD-DAN-PENCAIRAN%",
    "%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%",
    "%STAGE-REVIEW-DAN-PENCAIRAN%",
  ],
  CANCEL: ["%CANCEL%"],
  REJECT: ["%REJECT%"],
  HOLD: ["%_HOLD%"],
};

const sanitizeDate = (value) => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const compactDate = (value) => (value ? value.replace(/-/g, "") : null);

const firstDayOfMonth = (value) => {
  const date = sanitizeDate(value);
  if (!date) return null;
  const [year, month] = date.split("-");
  return `${year}-${month}-01`;
};

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const rawFlow = searchParams.get("flow_code") || searchParams.get("stage");
  const flowCode = rawFlow ? rawFlow.toUpperCase() : null;
  const rawMode = searchParams.get("mode") || "";
  const mode = rawMode.toUpperCase();

  if (!flowCode || !mode) {
    return NextResponse.json(
      { success: false, message: "Parameter flow_code dan mode wajib diisi" },
      { status: 400 }
    );
  }

  if (mode !== "IN" && mode !== "LAST") {
    return NextResponse.json(
      { success: false, message: "Mode harus bernilai IN atau LAST" },
      { status: 400 }
    );
  }

  const refDate =
    sanitizeDate(searchParams.get("refDate")) ||
    new Date().toISOString().slice(0, 10);

  const patterns = FLOW_CODE_PATTERNS[flowCode] || [`%${flowCode}%`];

  const usesUpdateDate = ["CAIR", "CANCEL", "REJECT", "HOLD"].includes(flowCode);
  const dateColumn = usesUpdateDate ? "a.UPDATE_DATE" : "a.CREATE_DATE";

  const where = [
    "a.JENIS_PRODUK LIKE '%GRIYA%'",
    "a.NO_APLIKASI > '20190615'",
  ];

  if (flowCode !== "REJECT") {
    where.push("a.FLOW_CODE NOT LIKE '%REJECT%'");
  }

  if (flowCode !== "HOLD") {
    where.push("a.FLOW_CODE NOT LIKE '%_HOLD%'");
  }

  const binds = {};

  const stageConditions = patterns.map((_, index) => {
    const key = `stagePattern${index}`;
    binds[key] = patterns[index];
    return `a.FLOW_CODE LIKE :${key}`;
  });

  where.push(`(${stageConditions.join(" OR ")})`);

  const rangeMode = (searchParams.get("range") || "").toLowerCase();
  const rangeStartParam = sanitizeDate(searchParams.get("rangeStart"));
  const rangeEndParam = sanitizeDate(searchParams.get("rangeEnd"));
  const effectiveRangeEnd = rangeEndParam || refDate;
  const defaultRangeStart =
    firstDayOfMonth(effectiveRangeEnd) || refDate;
  const effectiveRangeStart = rangeStartParam || defaultRangeStart;

  if (rangeMode === "month" || rangeMode === "bounded") {
    binds.rangeStart = effectiveRangeStart;
    binds.rangeEnd = effectiveRangeEnd;
    where.push(
      `TRUNC(${dateColumn}) BETWEEN TO_DATE(:rangeStart, 'YYYY-MM-DD') AND TO_DATE(:rangeEnd, 'YYYY-MM-DD')`
    );
  } else if (mode === "IN") {
    binds.refDate = refDate;
    where.push(`TRUNC(${dateColumn}) = TO_DATE(:refDate, 'YYYY-MM-DD')`);
  } else {
    binds.refDate = refDate;
    where.push(`TRUNC(${dateColumn}) < TO_DATE(:refDate, 'YYYY-MM-DD')`);
  }

  const kodeRegion = searchParams.get("kode_region") || searchParams.get("region");
  if (kodeRegion && kodeRegion !== "All") {
    where.push(`(
      CASE
        WHEN b.LVL = '2' THEN (
          SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
        )
        WHEN b.LVL = '3' THEN (
          SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ADMINISTRASI
        )
        ELSE NULL
      END
    ) = :kodeRegion`);
    binds.kodeRegion = kodeRegion;
  }

  const kodeArea = searchParams.get("kode_area") || searchParams.get("area");
  if (kodeArea && kodeArea !== "All") {
    where.push(`(
      CASE
        WHEN b.LVL = '2' THEN b.BRANCH_CODE
        WHEN b.LVL = '3' THEN (
          SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
        )
        ELSE NULL
      END
    ) = :kodeArea`);
    binds.kodeArea = kodeArea;
  }

  const startDate = sanitizeDate(searchParams.get("startDate"));
  const endDate = sanitizeDate(searchParams.get("endDate"));

  if (startDate) {
    binds.startNoAplikasi = compactDate(startDate);
    where.push("a.NO_APLIKASI >= :startNoAplikasi");
  }

  if (endDate) {
    binds.endNoAplikasi = compactDate(endDate);
    where.push("a.NO_APLIKASI <= :endNoAplikasi");
  }

  const selectClause = `
    TO_CHAR((
      SELECT h.CREATE_DATE
      FROM ILOS.TBL_APLIKASI_HIST h
      WHERE h.NO_APLIKASI = a.NO_APLIKASI
        AND h.FLOW_CODE LIKE '%STAGE-IDE%'
      ORDER BY h.CREATE_DATE DESC
      FETCH FIRST 1 ROWS ONLY
    ), 'YYYY-MM-DD') AS TGL_INPUT,
    a.NO_APLIKASI,
    REPLACE(REPLACE(a.NAMA_CUSTOMER, '{value=', ''), ', storeType=java.lang.String}', '') AS NAMA_NASABAH,
    REPLACE(REPLACE(a.JENIS_PRODUK, '{value=', ''), ', storeType=java.lang.String}', '') AS JENIS_PRODUK,
    CASE
      WHEN a.JENIS_PRODUK LIKE '%PENSIUN%' THEN (
        SELECT c.EVENT_NO || ' - ' || c.EVENT_NAME
        FROM ILOS.TBL_EVENT_PENSIUN c
        WHERE c.EVENT_NO = ILOS.f_get_value_clob(a.DATA, 'kodeProgram')
      )
      WHEN a.JENIS_PRODUK LIKE '%MITRAGUNA%' THEN (
        SELECT c.EVENT_NO || ' - ' || c.EVENT_NAME
        FROM ILOS.TBL_EVENT_IMPLAN c
        WHERE c.EVENT_NO = ILOS.f_get_value_clob(a.DATA, 'kodeProgram')
      )
      WHEN a.JENIS_PRODUK LIKE '%GRIYA%' THEN (
        SELECT c.EVENT_NO || ' - ' || c.EVENT_NAME
        FROM ILOS.TBL_EVENT c
        WHERE c.EVENT_NO = ILOS.f_get_value_clob(a.DATA, 'kodeProgram')
      )
      ELSE NULL
    END AS KODE_PROGRAM,
    TO_NUMBER(ILOS.f_get_value_clob(a.DATA, 'jumlahPengajuan')) AS PLAFOND,
    b.BRANCH_CODE || ' - ' || b.NAME AS NAMA_CABANG,
    CASE
      WHEN b.LVL = '2' THEN b.BRANCH_CODE || ' - ' || b.NAME
      WHEN b.LVL = '3' THEN (
        SELECT c.BRANCH_CODE || ' - ' || c.NAME
        FROM ILOS.TBL_BRANCH c
        WHERE c.BRANCH_CODE = b.PARENT_ID
      )
      ELSE ''
    END AS NAMA_AREA,
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
      ELSE ''
    END AS REGION,
    CASE
      WHEN a.FLOW_CODE LIKE '%REJECT%' THEN (
        CASE
          WHEN (
            SELECT COUNT(*)
            FROM ILOS.TBL_CANCEL_APLIKASI c
            WHERE c.NO_APLIKASI = a.NO_APLIKASI
          ) > 0 THEN '88 - CANCEL'
          ELSE '99 - REJECT'
        END
      )
      ELSE CASE
        WHEN a.FLOW_CODE LIKE '%IDE%' THEN '10 - IDE'
        WHEN a.FLOW_CODE LIKE '%DEDUPE%' THEN '11 - DEDUPE'
        WHEN a.FLOW_CODE LIKE '%BI-CHECKING%' THEN '12 - iDEB'
        WHEN a.FLOW_CODE LIKE '%UPLOAD-DOC%' THEN '13 - UPLOAD DOC'
        WHEN a.FLOW_CODE LIKE '%STAGE-DDE%' THEN '14 - DDE'
        WHEN a.FLOW_CODE LIKE '%STAGE-VERIN%' THEN '15 - VERIN'
        WHEN a.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' THEN '151 - OTOR VERIN'
        WHEN a.FLOW_CODE LIKE '%APPROVAL%' THEN '16 - APPROVAL'
        WHEN a.FLOW_CODE LIKE '%STAGE-SP-3%' THEN '17 - SP3'
        WHEN a.FLOW_CODE LIKE '%ORDER-AKAD%' THEN '17 - SP3'
        WHEN a.FLOW_CODE LIKE '%REVIEW-AKAD%' THEN '17 - SP3'
        WHEN a.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' THEN '18 - AKAD'
        WHEN a.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' THEN '181 - OTOR AKAD'
        WHEN a.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' THEN '19 - REVIEW'
        WHEN a.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' THEN '191 - OTOR REVIEW'
        WHEN a.FLOW_CODE LIKE '%LIVE%' THEN '20 - LIVE'
        ELSE REPLACE(REPLACE(REPLACE(REPLACE(a.FLOW_CODE, 'STAGE-', ''), '-PENSIUN', ''), '-IMPLAN', ''), '-', ' ')
      END
    END AS LAST_POSISI,
    a.CREATE_BY AS LAST_READ_BY,
    usr.NAME AS LAST_READ_BY_NAME,
    TO_CHAR(a.UPDATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS LAST_UPDATE,
    CASE
      WHEN (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI_HIST h
        WHERE h.NO_APLIKASI = a.NO_APLIKASI
          AND h.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%'
      ) = 0 THEN 0
      ELSE (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI_HIST h
        WHERE h.NO_APLIKASI = a.NO_APLIKASI
          AND h.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%'
      ) - 1
    END AS JUM_RETURN,
    (
      SELECT us.BRANCH_CODE
      FROM ILOS.TBL_APLIKASI_HIST h
      INNER JOIN ILOS.TBL_USER us ON us.USER_ID = h.UPDATE_BY
      WHERE h.NO_APLIKASI = a.NO_APLIKASI
        AND h.FLOW_CODE LIKE '%STAGE-DDE%'
      ORDER BY h.CREATE_DATE DESC
      FETCH FIRST 1 ROWS ONLY
    ) AS BRANCH_DDE
  `;

  const query = `
    SELECT ${selectClause}
    FROM ILOS.TBL_APLIKASI a
    INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    LEFT JOIN ILOS.TBL_USER usr ON usr.USER_ID = a.CREATE_BY
    WHERE ${where.join(" AND ")}
    ORDER BY a.UPDATE_DATE DESC NULLS LAST
  `;

  try {
    const rows = await executeQuery(query, binds);
    return NextResponse.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error("Error fetch grafik detail-wise griya:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
