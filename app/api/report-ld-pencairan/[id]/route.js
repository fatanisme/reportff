import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import { getTableColumns } from "@/lib/oracle-metadata";
import { LD_TABLE_INFO, getLdSelectColumns } from "../shared";

export async function PATCH(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Parameter id wajib diisi" },
      { status: 400 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const status = (payload.status || "").trim();
  const note = (payload.note || "").trim();

  if (!status) {
    return NextResponse.json(
      { success: false, message: "Status wajib diisi" },
      { status: 400 }
    );
  }

  const availableColumns = await getTableColumns(LD_TABLE_INFO);

  if (!availableColumns.has("ID")) {
    return NextResponse.json(
      {
        success: false,
        message: "Kolom ID tidak tersedia pada tabel LOGS_LD.",
      },
      { status: 500 }
    );
  }

  if (!availableColumns.has("STATUS")) {
    return NextResponse.json(
      {
        success: false,
        message: "Kolom STATUS tidak tersedia pada tabel LOGS_LD.",
      },
      { status: 400 }
    );
  }

  const binds = {
    status: status.toUpperCase(),
    id,
  };

  const setClauses = ["STATUS = :status"];

  if (availableColumns.has("KET_PENCAIRAN")) {
    binds.note = note || null;
    setClauses.push("KET_PENCAIRAN = :note");
  }

  const updateQuery = `
    UPDATE REPORTFF.LOGS_LD
    SET
      ${setClauses.join(",\n      ")}
    WHERE ID = :id
  `;

  try {
    await executeQuery(updateQuery, binds, { autoCommit: true });

    const selectColumns = getLdSelectColumns(availableColumns).join(",\n          ");
    const updatedRows = await executeQuery(
      `
        SELECT
          ${selectColumns}
        FROM REPORTFF.LOGS_LD
        WHERE ID = :id
      `,
      { id }
    );

    return NextResponse.json({
      success: true,
      data: Array.isArray(updatedRows) ? updatedRows[0] ?? null : null,
      message: "Data LD pencairan berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error update report-ld-pencairan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data LD pencairan" },
      { status: 500 }
    );
  }
}
