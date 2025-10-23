import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
  try {
    // Mengambil kode_region dari query parameter
    const kodeRegion = req.nextUrl.searchParams.get("kode_region");

    // Query SQL untuk mengambil data berdasarkan kode_region
    const query = `
      SELECT *
      FROM REPORTFF.REGION_MAPPING
      WHERE KODE_REGION = :kode_region
      ORDER BY ID
      `;

    // Menjalankan query dengan parameter kode_region
    const datas = await executeQuery(query, { kode_region: kodeRegion });

    // Mengembalikan hasil data
    return Response.json({ success: true, data: datas });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
