import { executeQuery } from "@/lib/oracle";
import { NextResponse } from 'next/server';
import oracledb from "oracledb";

export async function GET(req) {

  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area");
    const kodeRegion = req.nextUrl.searchParams.get("kode_region");
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    const tgl_awal = startDate.replace(/-/g, '');
    const tgl_akhir = endDate.replace(/-/g, '');


    let ro_se = kodeRegion == 'All' ? 'All' : kodeRegion;
    let ar_se = kodeArea == 'All' ? 'All' : kodeArea;

    const query = `
        BEGIN
        griya_pending_progress_export(
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
      p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    };

    const datas = await executeQuery(query, binds);

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
