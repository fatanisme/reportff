import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET() {
  const query =
    "SELECT ID, DIVISION_CODE, DIVISION_NAME, DESCRIPTION FROM REPORTFF.DIVISION";

  try {
    const rows = await executeQuery(query);
    console.log("Data :", rows);
    return NextResponse.json({ data: Array.isArray(rows) ? rows : [] });
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
    const query = `
      INSERT INTO REPORTFF.DIVISION (DIVISION_CODE, DIVISION_NAME, DESCRIPTION)
      VALUES (:code,:name, :description)
    `;

    await executeQuery(query, {
      code,
      name,
      description,
    });

    return NextResponse.json({ message: "Group berhasil ditambahkan" });
  } catch (error) {
    console.error("Gagal tambah group:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}
