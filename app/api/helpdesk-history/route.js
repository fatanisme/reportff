import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET() {
  const query = `
    SELECT
      NO_APP,
      DBMS_LOB.SUBSTR(ACTION_DESC, 4000, 1) AS ACTION_DESC,
      ACTION_BY,
      IP_ADDRESS,
      TO_CHAR(ACTION_DATE, 'YYYY-MM-DD HH24:MI:SS') AS ACTION_DATE
    FROM REPORTFF.HISTORY_HELPDESK
    ORDER BY ACTION_DATE DESC
  `;

  try {
    const rows = await executeQuery(query);
    const data = Array.isArray(rows)
      ? rows.map((row) => ({
          NO_APP: row.NO_APP ?? "",
          ACTION_DESC: row.ACTION_DESC ?? "",
          ACTION_BY: row.ACTION_BY ?? "",
          IP_ADDRESS: row.IP_ADDRESS ?? "",
          ACTION_DATE: row.ACTION_DATE ?? "",
        }))
      : [];
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetch helpdesk history:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data history helpdesk" },
      { status: 500 }
    );
  }
}
