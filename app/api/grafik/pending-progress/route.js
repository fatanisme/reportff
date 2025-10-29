import { executeQuery } from "@/lib/oracle";
import oracledb from "oracledb";

const sanitizeDate = (value) => {
  if (!value) return null;
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

export async function GET(req) {
  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area") || "All";
    const kodeRegion = req.nextUrl.searchParams.get("kode_region") || "All";
    const endDateInput = sanitizeDate(req.nextUrl.searchParams.get("endDate"));
    const today = new Date();
    const fallback = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, "0")}-${`${today.getDate()}`.padStart(2, "0")}`;
    const targetDate = endDateInput || fallback;

    const query = `
      BEGIN
        ILOS.pending_progress_grafik(
          :p_tgll,
          :p_kode_region,
          :p_kode_area,
          :p_cursor
        );
      END;
    `;

    const binds = {
      p_tgll: targetDate,
      p_kode_region: kodeRegion === "All" ? "All" : kodeRegion,
      p_kode_area: kodeArea === "All" ? "All" : kodeArea,
      p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const datas = await executeQuery(query, binds);

    return Response.json({ success: true, data: datas });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
