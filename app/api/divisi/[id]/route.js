import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

// GET group by ID
export async function GET(request, { params }) {
  const { id } = await params;

  const query = `
    SELECT ID_DIVISI, KODE_DIVISI,NAMA_DIVISI, DESKRIPSI
    FROM REPORTFF.TB_DIVISI
    WHERE ID_DIVISI = :id
  `;

  try {
    const rows = await executeQuery(query, { id });

    if (rows.length === 0) {
      return NextResponse.json({ data: null }); // Atau return 404
    }

    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error("Gagal ambil data divisi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT update group
export async function PUT(request, context) {
  const { params } = context;
  const { code,name, description } = await request.json();
  const id = params.id;

  const query = `
    UPDATE REPORTFF.TB_DIVISI
    SET KODE_DIVISI = :code,
        NAMA_DIVISI = :name,
        DESKRIPSI = :description
    WHERE ID_DIVISI = :id
  `;

  try {
    await executeQuery(query, { id, code, name, description });
    return NextResponse.json({ message: "Divisi berhasil diupdate" });
  } catch (error) {
    console.error("Gagal update group:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE tetap sama (tidak perlu ubah)
export async function DELETE(request, context) {
  const { params } = context;
  const id = params.id;

  const query = `DELETE FROM REPORTFF.TB_DIVISI WHERE ID_DIVISI = :id`;

  try {
    await executeQuery(query, { id });
    return NextResponse.json({ message: "Divisi berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus group:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}
