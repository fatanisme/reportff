import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

// GET maintenance by ID
export async function GET(request, { params }) {
  const { id } = await params;

  const query = `
    SELECT ID, KODE_AREA, AREA, KODE_REGION,REGION,REGION_ALIAS
    FROM REPORTFF.REGION_MAPPING
    WHERE ID = :id
  `;

  try {
    const rows = await executeQuery(query, { id });

    if (rows.length === 0) {
      return NextResponse.json({ data: null }); // Atau return 404
    }

    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error("Gagal ambil data maintenance:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  const { params } = context;
  const { code_area, area, code_region, region, region_alias } =
    await request.json();
  const id = params.id;

  const query = `
    UPDATE REPORTFF.REGION_MAPPING
    SET KODE_AREA = :code_area, 
        AREA = :area,
        KODE_REGION = :code_region,
        REGION = :region,
        REGION_ALIAS = :region_alias
    WHERE ID = :id
  `;

  try {
    await executeQuery(query, {
      id,
      code_area,
      area,
      code_region,
      region,
      region_alias,
    });
    return NextResponse.json({ message: "Maintenance berhasil diupdate" });
  } catch (error) {
    console.error("Gagal update maintenance:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE tetap sama (tidak perlu ubah)
export async function DELETE(request, context) {
  const { params } = context;
  const id = params.id;

  const query = `DELETE FROM REPORTFF.REGION_MAPPING WHERE ID = :id`;

  try {
    await executeQuery(query, { id });
    return NextResponse.json({ message: "Maintenance berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus maintenance:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}
