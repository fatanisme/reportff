import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET() {
  const query = `SELECT ID_DIVISI,KODE_DIVISI, NAMA_DIVISI, DESKRIPSI FROM REPORTFF.TB_DIVISI`;

  try {
    const rows = await executeQuery(query);
    const plainRows = rows.map(row => {
      return JSON.parse(JSON.stringify(row));
    });
    return NextResponse.json({ data: plainRows });
    
  } catch (error) {
    console.error("Error fetch divisi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { code, name, description } = await request.json();

  try {
    if (!code?.trim() || !name?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Kode, nama, dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const sanitizedCode = code.trim();
    const sanitizedName = name.trim();
    const sanitizedDescription = description.trim();

    const query = `
      INSERT INTO REPORTFF.TB_DIVISI (KODE_DIVISI,NAMA_DIVISI, DESKRIPSI)
      VALUES (:code,:name, :description)
    `;

    await executeQuery(query, {
      code: sanitizedCode,
      name: sanitizedName,
      description: sanitizedDescription,
    });

    return NextResponse.json({ message: "Divisi berhasil ditambahkan" });
  } catch (error) {
    console.error("Gagal tambah divisi:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}
