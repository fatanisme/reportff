import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { executeQuery } from "@/lib/oracle"; // Pastikan file koneksi sudah tersedia

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const divisionCode =
    session?.user?.divisionCodeNormalized ??
    session?.user?.divisionCode?.toString().toLowerCase() ??
    "";

  if (!session || divisionCode !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const query = `SELECT ID, NAME, EMAIL, ID_DIVISI, CREATED_AT FROM USERS ORDER BY CREATED_AT DESC`;
    const users = await executeQuery(query);
    return Response.json(users);
  } catch (err) {
    console.error("Gagal ambil data users:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
