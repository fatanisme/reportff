import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

// GET user by ID (tambahkan ROLE ke SELECT)
export async function GET(request, { params }) {
  const { id } = await params;

  const query = `
    SELECT ID, NAME, EMAIL, ROLE
    FROM REPORTFF.USERS
    WHERE ID = :id
  `;

  try {
    const rows = await executeQuery(query, { id });

    if (rows.length === 0) {
      return NextResponse.json({ data: null }); // Atau return 404
    }

    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error("Gagal ambil data user:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT update user (tambahkan ROLE ke query dan body)
export async function PUT(request, context) {
  const { params } = context;
  const { name, email, role } = await request.json();
  const id = params.id;

  const query = `
    UPDATE REPORTFF.USERS
    SET NAME = :name,
        EMAIL = :email,
        ROLE = :role
    WHERE ID = :id
  `;

  try {
    await executeQuery(query, { id, name, email, role });
    return NextResponse.json({ message: "User berhasil diupdate" });
  } catch (error) {
    console.error("Gagal update user:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE tetap sama (tidak perlu ubah)
export async function DELETE(request, context) {
  const { params } = context;
  const id = params.id;

  const query = `DELETE FROM REPORTFF.USERS WHERE ID = :id`;

  try {
    await executeQuery(query, { id });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus user:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}