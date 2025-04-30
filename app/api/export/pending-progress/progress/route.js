import { executeQuery } from "@/lib/oracle";
import { NextResponse } from 'next/server';
import oracledb from "oracledb";

export async function GET(req) {

  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area") || 'All';
    const kodeRegion = req.nextUrl.searchParams.get("kode_region") || 'All';
    // const startDate = req.nextUrl.searchParams.get("startDate");
    // const endDate = req.nextUrl.searchParams.get("endDate");

    // const tgl_awal = startDate.replace(/-/g, '');
    // const tgl_akhir = endDate.replace(/-/g, '');

    //realy
    // const tgll = new Date().toISOString().slice(0, 10);
    // const tgl_wise = tgll.replace(/-/g, '');

    // dummy
    const tgll = '2024-05-02';
    const tgl_wise = '20240502';

    // let wheretgl = '';
    // if (tgl_awal === tgl_akhir) {
    // wheretgl = `AND (a.NO_APLIKASI >= '${tgl_awal}')`;
    // } else {
    // wheretgl = `AND (a.NO_APLIKASI >= '${tgl_awal}' AND a.NO_APLIKASI <= '${tgl_akhir}')`;
    // }

    // Dummy kode region/area (nanti bisa diganti dari DB)
    let ro_se = kodeRegion === 'All' ? 'All' : kodeRegion;
    let ar_se = kodeArea === 'All' ? 'All' : kodeArea;

    const query = `
        BEGIN
        pending_progress_progress(
            :p_tgll,
            :p_tgl_wise,
            :p_kode_region,
            :p_kode_area,
            :p_cursor
        );
        END;
    `;

    const binds = {
      p_tgll: tgll,
      p_tgl_wise: tgl_wise,
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
