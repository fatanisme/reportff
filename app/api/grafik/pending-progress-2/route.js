import { executeQuery } from "@/lib/oracle";
import oracledb from "oracledb";

export async function GET() {
  try {
    const query = `
        BEGIN
        ILOS.pending_progress_cair(
            :p_cursor
        );
        END;
    `;

    const binds = {
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
