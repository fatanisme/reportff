import { executeQuery } from "@/lib/oracle";
import oracledb from "oracledb";

export async function GET(req) {
    try {
        const kodeArea = req.nextUrl.searchParams.get("kode_area") || 'All';
        const kodeRegion = req.nextUrl.searchParams.get("kode_region") || 'All';

        //real
        // const tgll = new Date().toISOString().slice(0, 10);

        // dummy
        const tgll = '2024-05-02';

        let ro_se = kodeRegion === 'All' ? 'All' : kodeRegion;
        let ar_se = kodeArea === 'All' ? 'All' : kodeArea;

        const query = `
            BEGIN
            griya_pending_progress_grafik(
                :p_tgll,
                :p_kode_region,
                :p_kode_area,
                :p_cursor
            );
            END;
        `;

        const binds = {
            p_tgll: tgll,
            p_kode_region: ro_se,
            p_kode_area: ar_se,
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
