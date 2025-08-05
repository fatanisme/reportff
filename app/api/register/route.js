// File: app/api/register/route.js
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, email, password } = await req.json();

  try {
    const existingUser = await executeQuery(
      "SELECT * FROM REPORTFF.USERS WHERE EMAIL = :email",
      { email }
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await executeQuery(
      `INSERT INTO REPORTFF.USERS (NAME, EMAIL, PASSWORD) VALUES (:name, :email, :password)`,
      {
        name,
        email,
        password: hashedPassword,
      }
    );
    console.log("Insert binds:", {
      name,
      email,
      password: hashedPassword,
    });
    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error register:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
