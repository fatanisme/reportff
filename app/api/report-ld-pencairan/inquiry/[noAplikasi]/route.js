import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import { getTableColumns } from "@/lib/oracle-metadata";
import { LD_TABLE_INFO, getLdSelectColumns } from "../../shared";

export async function GET(_request, { params }) {
  const { noAplikasi } = params;
  if (!noAplikasi) {
    return NextResponse.json(
      { success: false, message: "Nomor aplikasi wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const availableColumns = await getTableColumns(LD_TABLE_INFO);

    if (!availableColumns.has("NO_APLIKASI")) {
      return NextResponse.json(
        {
          success: false,
          message: "Kolom NO_APLIKASI tidak tersedia pada tabel LOGS_LD.",
        },
        { status: 500 }
      );
    }

    if (!availableColumns.has("ID") || !availableColumns.has("TGL_CAIR")) {
      return NextResponse.json(
        {
          success: false,
          message: "Kolom ID atau TGL_CAIR tidak tersedia pada tabel LOGS_LD.",
        },
        { status: 500 }
      );
    }
    const selectColumns = getLdSelectColumns(availableColumns).join(",\n          ");
    const rows = await executeQuery(
      `
        SELECT
          ${selectColumns}
        FROM REPORTFF.LOGS_LD
        WHERE NO_APLIKASI = :noAplikasi
        ORDER BY TGL_CAIR DESC, ID DESC
      `,
      { noAplikasi }
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Data tidak ditemukan",
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Data ditemukan",
      data: rows,
    });
  } catch (error) {
    console.error("Error inquiry report-ld-pencairan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal melakukan pencarian LD pencairan" },
      { status: 500 }
    );
  }
}
