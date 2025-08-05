import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import bcrypt from "bcryptjs";

export async function GET() {
  const query = "SELECT ID, NAME, EMAIL, ROLE FROM REPORTFF.USERS";

  try {
    const rows = await executeQuery(query);
    return NextResponse.json({ data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    console.error("Error fetch users:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}


export async function POST(request) {
  const { name, email, password, role } = await request.json();

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO REPORTFF.USERS (NAME, EMAIL, PASSWORD, ROLE)
      VALUES (:name, :email, :password, :role)
    `;

    await executeQuery(query, {
      name,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    console.error("Gagal tambah user:", error);
    return NextResponse.json(
      { error: "Gagal tambah data" },
      { status: 500 }
    );
  }
}