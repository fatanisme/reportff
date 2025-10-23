import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET() {
  const query =
    "SELECT ID, KODE_AREA, AREA, KODE_REGION, REGION, REGION_ALIAS FROM REPORTFF.REGION_MAPPING ORDER BY ID DESC";
  try {
    const rows = await executeQuery(query);
    return NextResponse.json({ data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    console.error("Error fetch maintenance region:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { code_area, area, code_region, region, region_alias } =
    await request.json();

  try {
    const query = `
      INSERT INTO REPORTFF.REGION_MAPPING (KODE_AREA, AREA, KODE_REGION,REGION,REGION_ALIAS)
      VALUES (:code_area,:area,:code_region,:region, :region_alias)
    `;

    await executeQuery(query, {
      code_area,
      area,
      code_region,
      region,
      region_alias,
    });

    return NextResponse.json({ message: "Region berhasil ditambahkan" });
  } catch (error) {
    console.error("Gagal tambah region:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}
