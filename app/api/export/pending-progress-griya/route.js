import { executeQuery } from "@/lib/oracle";
import { NextResponse } from 'next/server';
import oracledb from "oracledb";

export async function GET(req) {

  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area") || "All";
    const kodeRegion = req.nextUrl.searchParams.get("kode_region") || "All";
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    const tgl_awal = startDate ? startDate.replace(/-/g, '') : null;
    const tgl_akhir = endDate ? endDate.replace(/-/g, '') : null;


    let ro_se = kodeRegion == 'All' ? 'All' : kodeRegion;
    let ar_se = kodeArea == 'All' ? 'All' : kodeArea;

    const query = `
        BEGIN
        ILOS.griya_pending_progress_export(
            :p_tglawal,
            :p_tglakhir,
            :p_kode_region,
            :p_kode_area,
            :p_cursor
        );
        END;
    `;

    const binds = {
      p_tglawal: { val: tgl_awal, type: oracledb.STRING },
      p_tglakhir: { val: tgl_akhir, type: oracledb.STRING },
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

export const dynamic = 'force-dynamic';
