import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

const TABLE_NAME = "REPORTFF.TB_MST_PARAM";

export async function GET(request, { params }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Parameter ID tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    const rows = await executeQuery(
      `SELECT ID, PARAM_NAME, PARAM_VALUE, DESCRIPTION FROM ${TABLE_NAME} WHERE ID = :id`,
      { id }
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching master parameter by id:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data parameter" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Parameter ID tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    const { paramValue, description } = await request.json();

    if (!paramValue?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, message: "Nilai dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE ${TABLE_NAME}
      SET PARAM_VALUE = :paramValue,
          DESCRIPTION = :description
      WHERE ID = :id
    `;

    await executeQuery(query, {
      id,
      paramValue: paramValue.trim(),
      description: description.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Parameter berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating master parameter:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui parameter" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Parameter ID tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    await executeQuery(`DELETE FROM ${TABLE_NAME} WHERE ID = :id`, { id });
    return NextResponse.json({
      success: true,
      message: "Parameter berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting master parameter:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus parameter" },
      { status: 500 }
    );
  }
}
