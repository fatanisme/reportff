import { executeQuery } from "@/lib/oracle";
import { NextResponse } from 'next/server';
import oracledb from "oracledb";

export async function GET(req) {

  try {
   
    //real
    // const tgll = new Date().toISOString().slice(0, 10);

    // dummy
    const tgll = '2023-05-02';


    const query = `
        BEGIN
        dashboard_daily_export(
            :p_tgl,
            :p_cursor
        );
        END;
    `;

    const binds = {
        p_tgl: tgll,
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
