import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

const TABLE_NAME = "REPORTFF.TB_MST_PARAM";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim();

  const baseQuery = `
    SELECT ID, PARAM_NAME, PARAM_VALUE, DESCRIPTION
    FROM ${TABLE_NAME}
  `;

  const whereClause = search
    ? "WHERE LOWER(PARAM_NAME) LIKE :search OR LOWER(PARAM_VALUE) LIKE :search OR LOWER(DESCRIPTION) LIKE :search"
    : "";

  const orderClause = "ORDER BY ID DESC";

  try {
    const rows = await executeQuery(
      `${baseQuery} ${whereClause} ${orderClause}`,
      search
        ? {
            search: `%${search.toLowerCase()}%`,
          }
        : undefined
    );

    const normalized = Array.isArray(rows)
      ? rows.map((row) => JSON.parse(JSON.stringify(row)))
      : [];

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("Error fetching master parameter:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data parameter" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { paramName, paramValue, description } = await request.json();

    if (!paramName?.trim() || !paramValue?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama, nilai, dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO ${TABLE_NAME} (PARAM_NAME, PARAM_VALUE, DESCRIPTION)
      VALUES (:paramName, :paramValue, :description)
    `;

    await executeQuery(query, {
      paramName: paramName.trim(),
      paramValue: paramValue.trim(),
      description: description.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Parameter berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error creating master parameter:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah parameter" },
      { status: 500 }
    );
  }
}
