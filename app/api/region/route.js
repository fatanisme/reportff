import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
  try {
    const query = `
    SELECT KODE_REGION, MIN(ID) AS ID, REGION_ALIAS 
    FROM REPORTFF.REGION_MAPPING 
    GROUP BY KODE_REGION, REGION_ALIAS
    ORDER BY REGION_ALIAS ASC
  `;

    const datas = await executeQuery(query);

    return Response.json({ success: true, data: datas });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
