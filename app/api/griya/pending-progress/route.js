import { executeQuery } from "@/lib/oracle";
import { readFileSync } from "fs";
import path from "path";

const getTodayJakarta = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  return formatter.format(new Date());
};

const sanitizeDate = (value) => {
  if (!value) return null;
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const REGION_AREA_FILTER = `
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

const RAW_QUERY = readFileSync(
  path.join(process.cwd(), "lib/sql/griya_pending_progress_grafik.sql"),
  "utf8",
);

const DASHBOARD_QUERY = RAW_QUERY.split("__FILTER__").join(REGION_AREA_FILTER);

export async function GET(req) {
  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area") || "All";
    const kodeRegion = req.nextUrl.searchParams.get("kode_region") || "All";
    const endDateInput = sanitizeDate(req.nextUrl.searchParams.get("endDate"));

    const todayJakarta = getTodayJakarta();
    const targetDate = endDateInput || todayJakarta;

    const data = await executeQuery(DASHBOARD_QUERY, {
      p_tgll: targetDate,
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
