import { executeQuery } from "@/lib/oracle";

const getTodayJakarta = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  return formatter.format(new Date());
};

const getFirstDayOfMonthJakarta = () => {
  const now = new Date();
  const options = { timeZone: "Asia/Jakarta" };
  const jakartaDate = new Date(now.toLocaleString("en-US", options));
  jakartaDate.setDate(1);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  return formatter.format(jakartaDate);
};

const REGION_FILTER = `
  AND (
    :p_kode_region = 'All'
    OR (
      :p_kode_region <> 'All' AND (
        CASE
          WHEN b.LVL = '2' THEN (
            SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
          )
          WHEN b.LVL = '3' THEN (
            SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ADMINISTRASI
          )
          ELSE NULL
        END
      ) = :p_kode_region
    )
  )
`;

const AREA_FILTER = `
  AND (
    :p_kode_area = 'All'
    OR (
      :p_kode_area <> 'All' AND (
        CASE
          WHEN b.LVL = '2' THEN b.BRANCH_CODE
          WHEN b.LVL = '3' THEN (
            SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
          )
          ELSE NULL
        END
      ) = :p_kode_area
    )
  )
`;

const BASE_JOIN = `
  FROM ILOS.TBL_APLIKASI a
  INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
  WHERE a.JENIS_PRODUK LIKE '%GRIYA%'
    AND a.NO_APLIKASI > '20190615'
    AND a.FLOW_CODE NOT LIKE '%_HOLD%'
`;

const DASHBOARD_QUERY = `
SELECT 'CAIR' AS CATEGORY,
       (
         SELECT COUNT(*)
         ${BASE_JOIN}
           AND a.FLOW_CODE NOT LIKE '%REJECT%'
           AND a.FLOW_CODE LIKE '%LIVE%'
           AND SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN :p_date_first AND :p_tgll
           ${REGION_FILTER}
           ${AREA_FILTER}
       ) AS "LAST",
       (
         SELECT COUNT(*)
         ${BASE_JOIN}
           AND a.FLOW_CODE NOT LIKE '%REJECT%'
           AND a.FLOW_CODE LIKE '%LIVE%'
           AND SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
           ${REGION_FILTER}
           ${AREA_FILTER}
       ) AS "IN"
FROM DUAL
UNION ALL
SELECT 'CANCEL' AS CATEGORY,
       (
         SELECT COUNT(
                  CASE
                    WHEN a.FLOW_CODE LIKE '%REJECT%'
                      AND (
                        SELECT COUNT(*)
                        FROM ILOS.TBL_CANCEL_APLIKASI c
                        WHERE c.NO_APLIKASI = a.NO_APLIKASI
                      ) > 0
                    THEN 1
                  END)
         ${BASE_JOIN}
           AND a.FLOW_CODE LIKE '%REJECT%'
           AND SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN :p_date_first AND :p_tgll
           ${REGION_FILTER}
           ${AREA_FILTER}
       ) AS "LAST",
       (
         SELECT COUNT(
                  CASE
                    WHEN a.FLOW_CODE LIKE '%REJECT%'
                      AND (
                        SELECT COUNT(*)
                        FROM ILOS.TBL_CANCEL_APLIKASI c
                        WHERE c.NO_APLIKASI = a.NO_APLIKASI
                      ) > 0
                    THEN 1
                  END)
         ${BASE_JOIN}
           AND a.FLOW_CODE LIKE '%REJECT%'
           AND SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
           ${REGION_FILTER}
           ${AREA_FILTER}
       ) AS "IN"
FROM DUAL
UNION ALL
SELECT 'REJECT' AS CATEGORY,
       (
         SELECT COUNT(
                  CASE
                    WHEN a.FLOW_CODE LIKE '%REJECT%'
                      AND (
                        SELECT COUNT(*)
                        FROM ILOS.TBL_CANCEL_APLIKASI c
                        WHERE c.NO_APLIKASI = a.NO_APLIKASI
                      ) <= 0
                    THEN 1
                  END)
         ${BASE_JOIN}
           AND a.FLOW_CODE LIKE '%REJECT%'
           AND SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN :p_date_first AND :p_tgll
           ${REGION_FILTER}
           ${AREA_FILTER}
       ) AS "LAST",
       (
         SELECT COUNT(
                  CASE
                    WHEN a.FLOW_CODE LIKE '%REJECT%'
                      AND (
                        SELECT COUNT(*)
                        FROM ILOS.TBL_CANCEL_APLIKASI c
                        WHERE c.NO_APLIKASI = a.NO_APLIKASI
                      ) <= 0
                    THEN 1
                  END)
         ${BASE_JOIN}
           AND a.FLOW_CODE LIKE '%REJECT%'
           AND SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
           ${REGION_FILTER}
           ${AREA_FILTER}
       ) AS "IN"
FROM DUAL
`;

export async function GET(req) {
  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area") || "All";
    const kodeRegion = req.nextUrl.searchParams.get("kode_region") || "All";

    const tanggalAkhir = getTodayJakarta();
    const tanggalAwal = getFirstDayOfMonthJakarta();

    const data = await executeQuery(DASHBOARD_QUERY, {
      p_date_first: tanggalAwal,
      p_tgll: tanggalAkhir,
      p_kode_region: kodeRegion,
      p_kode_area: kodeArea,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
