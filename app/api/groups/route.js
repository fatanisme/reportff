import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET() {
  const query = "SELECT ID, NAME, DESCRIPTION FROM REPORTFF.GROUPS";

  try {
    const rows = await executeQuery(query);
    return NextResponse.json({ data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    console.error("Error fetch groups:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { name, description } = await request.json();

  try {
    const query = `
      INSERT INTO REPORTFF.GROUPS (NAME, DESCRIPTION)
      VALUES (:name, :description)
    `;

    await executeQuery(query, {
      name,
      description,
    });

    return NextResponse.json({ message: "Group berhasil ditambahkan" });
  } catch (error) {
    console.error("Gagal tambah group:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}
