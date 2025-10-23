import { executeQuery } from "@/lib/oracle";
import { NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET(req) {
  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area") || "All";
    const kodeRegion = req.nextUrl.searchParams.get("kode_region") || "All";
    const currentYear = new Date().getFullYear();
    const defaultStart = `${currentYear}-01-01`;

    const startDate = req.nextUrl.searchParams.get("startDate") || defaultStart;
    const endDate =
      req.nextUrl.searchParams.get("endDate") ||
      new Date().toISOString().slice(0, 10);

    const tgl_awal = startDate.replace(/-/g, "");
    const tgl_akhir = endDate.replace(/-/g, "");

    let ro_se = kodeRegion == "All" ? "All" : kodeRegion;
    let ar_se = kodeArea == "All" ? "All" : kodeArea;

    const query = `
            BEGIN
            ILOS.pending_progress_detail(
                :p_tglawal,
                :p_tglakhir,
                :p_kode_region,
                :p_kode_area,
                :p_cursor
            );
            END;
        `;

    const binds = {
      p_tglawal: tgl_awal,
      p_tglakhir: tgl_akhir,
      p_kode_region: ro_se,
      p_kode_area: ar_se,
      p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const datas = await executeQuery(query, binds);
    // const datas = [kodeArea,kodeRegion,tgl_awal,tgl_akhir]
    return NextResponse.json({
      success: true,
      data: datas,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
