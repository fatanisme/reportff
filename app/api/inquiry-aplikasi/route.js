
import { executeQuery } from "@/lib/oracle";
import { NextResponse } from 'next/server';
import oracledb from "oracledb";


export async function GET(req) {
    try {
        //'20170427100030017',
        const p_no_apl = req.nextUrl.searchParams.get("no_apl") ;
        const query1 = `
            BEGIN
            ILOS.inquiry_aplikasi(:no_apl, :p_cursor);
            END;
        `;
        const query2 = `
            BEGIN
            ILOS.inquiry_aplikasi_memo(:no_apl, :p_cursor);
            END;
        `;
        const binds = {
            no_apl: p_no_apl,
            p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        };


        const rows1 = await executeQuery(query1, binds);
        const rows2 = await executeQuery(query2, binds);


        return NextResponse.json({
            success: true,
            data: [rows1,rows2],
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
