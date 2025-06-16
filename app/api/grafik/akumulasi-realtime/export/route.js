import { executeQuery } from "@/lib/oracle";
import oracledb from "oracledb";

export async function GET(req) {
    try {
        const startDate = req.nextUrl.searchParams.get("startDate");
        const endDate = req.nextUrl.searchParams.get("endDate");

        const tgl_awal = startDate.replace(/-/g, '');
        const tgl_akhir = endDate.replace(/-/g, '');

        const query = `
            BEGIN
            akumulasi_realtime_export(
                :p_tglawal,
                :p_tglakhir,
                :p_cursor
            );
            END;
        `;

        const binds = {
            p_tglawal: tgl_awal,
            p_tglakhir: tgl_akhir,
            p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
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
