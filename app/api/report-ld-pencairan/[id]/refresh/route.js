import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import { getTableColumns } from "@/lib/oracle-metadata";
import { LD_TABLE_INFO, getLdSelectColumns } from "../../shared";

const cleanValue = (value) => {
  if (value == null) return null;
  return String(value)
    .replace(/{value=/gi, "")
    .replace(/, storeType=java\.lang\.String}/gi, "")
    .trim();
};

export async function POST(request, { params }) {
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

  const noAplikasi = (payload.noAplikasi || "").trim();
  if (!noAplikasi) {
    return NextResponse.json(
      { success: false, message: "Nomor aplikasi wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const aplikasiRows = await executeQuery(
      `
        SELECT
          REPLACE(REPLACE(REPLACE(a.NAMA_CUSTOMER, '{value=', ''), ', storeType=javapp.lang.String}', ''), ', storeType=java.lang.String}', '') AS NAMA_NASABAH,
          a.BRANCH_CODE,
          b.NAME AS BRANCH_NAME,
          REPLACE(REPLACE(REPLACE(a.JENIS_PRODUK, '{value=', ''), ', storeType=javapp.lang.String}', ''), ', storeType=java.lang.String}', '') AS PRODUK
        FROM ILOS.TBL_APLIKASI a
        LEFT JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE a.NO_APLIKASI = :noAplikasi
      `,
      { noAplikasi }
    );

    if (!aplikasiRows || aplikasiRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data aplikasi tidak ditemukan di WISE.",
        },
        { status: 404 }
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
    const detail = aplikasiRows[0];

    const updateClauses = [];
    const updateBinds = { id };

    if (availableColumns.has("NAMA_NASABAH")) {
      updateClauses.push("NAMA_NASABAH = :namaNasabah");
      updateBinds.namaNasabah = cleanValue(detail.NAMA_NASABAH) ?? null;
    }

    if (availableColumns.has("BRANCH_CODE")) {
      updateClauses.push("BRANCH_CODE = :branchCode");
      updateBinds.branchCode = detail.BRANCH_CODE ?? null;
    }

    if (availableColumns.has("BRANCH_NAME")) {
      updateClauses.push("BRANCH_NAME = :branchName");
      updateBinds.branchName = detail.BRANCH_NAME ?? null;
    }

    if (availableColumns.has("PRODUK")) {
      updateClauses.push("PRODUK = :produk");
      updateBinds.produk = cleanValue(detail.PRODUK) ?? null;
    }

    if (updateClauses.length > 0) {
      await executeQuery(
        `
          UPDATE REPORTFF.LOGS_LD
          SET
            ${updateClauses.join(",\n            ")}
          WHERE ID = :id
        `,
        updateBinds,
        { autoCommit: true }
      );
    }

    const selectColumns = getLdSelectColumns(availableColumns).join(",\n          ");
    const updated = await executeQuery(
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
      message: "Data nasabah berhasil diperbarui dari WISE.",
      data: Array.isArray(updated) ? updated[0] ?? null : null,
    });
  } catch (error) {
    console.error("Error refresh report-ld-pencairan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui data nasabah dari WISE.",
      },
      { status: 500 }
    );
  }
}
