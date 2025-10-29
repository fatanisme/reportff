import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import { getTableColumns } from "@/lib/oracle-metadata";
import { LD_TABLE_INFO, getLdSelectColumns } from "./shared";

const buildFilters = ({ startDate, endDate, status, search }, availableColumns) => {
  const where = [];
  const binds = {};
  const columns = availableColumns instanceof Set ? availableColumns : new Set();
  const has = (column) => columns.has(String(column || "").toUpperCase());

  where.push(
    "TGL_CAIR BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD') AND TO_DATE(:endDate, 'YYYY-MM-DD')"
  );
  binds.startDate = startDate;
  binds.endDate = endDate;

  if (status && status !== "ALL" && has("STATUS")) {
    where.push("UPPER(STATUS) = :status");
    binds.status = status.toUpperCase();
  }

  if (search) {
    const searchableCandidates = [
      "NO_APLIKASI",
      "NAMA_NASABAH",
      "BRANCH_CODE",
      "BRANCH_NAME",
      "PRODUK",
      "STATUS",
    ];

    const searchableColumns = searchableCandidates.filter((column) => has(column));

    if (has("KET_PENCAIRAN")) {
      searchableColumns.push("KET_PENCAIRAN");
    }

    if (searchableColumns.length > 0) {
      const searchExpressions = searchableColumns.map(
        (column) => `UPPER(${column}) LIKE :search`
      );

      where.push(`(${searchExpressions.join(" OR ")})`);
      binds.search = `%${search.toUpperCase()}%`;
    }
  }

  return { whereClause: where.join(" AND "), binds };
};

const mapRow = (row) => ({
  id: row.ID ?? row.id ?? null,
  tanggalCair: row.TGL_CAIR ?? row.tanggalCair ?? null,
  noAplikasi: row.NO_APLIKASI ?? row.noAplikasi ?? null,
  namaNasabah: row.NAMA_NASABAH ?? row.namaNasabah ?? null,
  branchCode: row.BRANCH_CODE ?? row.branchCode ?? null,
  branchName: row.BRANCH_NAME ?? row.branchName ?? null,
  produk: row.PRODUK ?? row.produk ?? null,
  status: row.STATUS ?? row.status ?? null,
  keterangan: row.KET_PENCAIRAN ?? row.KETERANGAN ?? row.keterangan ?? null,
  sequenceCair: row.SEQ_CAIR ?? row.sequenceCair ?? null,
  createdAt: row.CREATED_AT ?? row.createdAt ?? null,
  updatedAt: row.UPDATED_AT ?? row.updatedAt ?? null,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = (searchParams.get("status") || "ALL").toUpperCase();
  const search = (searchParams.get("search") || "").trim();
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "50", 10);
  const exportMode = searchParams.get("export") === "1";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { success: false, message: "Parameter startDate dan endDate wajib diisi" },
      { status: 400 }
    );
  }

  if (Number.isNaN(page) || page < 1) {
    return NextResponse.json(
      { success: false, message: "Parameter page tidak valid" },
      { status: 400 }
    );
  }

  const effectivePageSize = exportMode
    ? Number.parseInt(searchParams.get("exportLimit") || "5000", 10)
    : pageSize;

  if (Number.isNaN(effectivePageSize) || effectivePageSize < 1) {
    return NextResponse.json(
      { success: false, message: "Parameter pageSize tidak valid" },
      { status: 400 }
    );
  }

  const availableColumns = await getTableColumns(LD_TABLE_INFO);

  const requiredColumns = ["ID", "TGL_CAIR"];
  const missingRequiredColumns = requiredColumns.filter(
    (column) => !availableColumns.has(column)
  );

  if (missingRequiredColumns.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Kolom wajib berikut tidak tersedia pada tabel LOGS_LD: ${missingRequiredColumns.join(
          ", "
        )}.`,
      },
      { status: 500 }
    );
  }

  if (status && status !== "ALL" && !availableColumns.has("STATUS")) {
    return NextResponse.json(
      {
        success: false,
        message: "Kolom STATUS tidak tersedia pada tabel LOGS_LD.",
      },
      { status: 400 }
    );
  }

  const { whereClause, binds } = buildFilters({
    startDate,
    endDate,
    status,
    search,
  }, availableColumns);

  const countQuery = `SELECT COUNT(*) AS TOTAL FROM REPORTFF.LOGS_LD WHERE ${whereClause}`;

  const selectColumns = getLdSelectColumns(availableColumns).join(",\n    ");

  const paginatedQuery = `
    SELECT ${selectColumns}
    FROM (
      SELECT
        ${selectColumns},
        ROW_NUMBER() OVER (ORDER BY TGL_CAIR DESC, ID DESC) AS RN
      FROM REPORTFF.LOGS_LD
      WHERE ${whereClause}
    )
    WHERE RN > :offset AND RN <= :limit
  `;

  const exportQuery = `
    SELECT ${selectColumns}
    FROM REPORTFF.LOGS_LD
    WHERE ${whereClause}
    ORDER BY TGL_CAIR DESC, ID DESC
  `;

  try {
    let totalRows = 0;

    if (!exportMode) {
      const totalResult = await executeQuery(countQuery, binds);
      totalRows = Number(totalResult?.[0]?.TOTAL ?? 0);
    }

    const offset = (page - 1) * effectivePageSize;
    const limit = offset + effectivePageSize;

    const dataQuery = exportMode ? exportQuery : paginatedQuery;
    const dataBinds = exportMode
      ? binds
      : { ...binds, offset, limit };

    const rows = await executeQuery(dataQuery, dataBinds);
    const mapped = Array.isArray(rows) ? rows.map(mapRow) : [];

    if (exportMode) {
      return NextResponse.json({
        success: true,
        data: mapped,
      });
    }

    const totalPages = Math.max(Math.ceil(totalRows / effectivePageSize), 1);

    return NextResponse.json({
      success: true,
      data: mapped,
      pagination: {
        page,
        pageSize: effectivePageSize,
        total: totalRows,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetch report-ld-pencairan:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data LD Pencairan" },
      { status: 500 }
    );
  }
}
