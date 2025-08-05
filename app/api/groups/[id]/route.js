import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

// GET group by ID (tambahkan ROLE ke SELECT)
export async function GET(request, { params }) {
  const { id } = await params;

  const query = `
    SELECT ID, NAME, DESCRIPTION
    FROM REPORTFF.GROUPS
    WHERE ID = :id
  `;

  try {
    const rows = await executeQuery(query, { id });

    if (rows.length === 0) {
      return NextResponse.json({ data: null }); // Atau return 404
    }

    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error("Gagal ambil data group:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT update group (tambahkan ROLE ke query dan body)
export async function PUT(request, context) {
  const { params } = context;
  const { name, description } = await request.json();
  const id = params.id;

  const query = `
    UPDATE REPORTFF.GROUPS
    SET NAME = :name,
        DESCRIPTION = :description
    WHERE ID = :id
  `;

  try {
    await executeQuery(query, { id, name, email, role });
    return NextResponse.json({ message: "Group berhasil diupdate" });
  } catch (error) {
    console.error("Gagal update group:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE tetap sama (tidak perlu ubah)
export async function DELETE(request, context) {
  const { params } = context;
  const id = params.id;

  const query = `DELETE FROM REPORTFF.GROUPS WHERE ID = :id`;

  try {
    await executeQuery(query, { id });
    return NextResponse.json({ message: "Group berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus group:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}
