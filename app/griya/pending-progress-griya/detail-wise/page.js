"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";
import { createExportExcel } from "@/app/components/utils/exportExcel";

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];
const NUMERIC_COLUMNS = new Set(["plafon", "jumlahReturn"]);
const DATE_COLUMNS = new Set(["tglInput", "lastUpdate"]);

const parseDateValue = (value) => {
  if (!value) return 0;
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const time = Date.parse(normalized);
  return Number.isNaN(time) ? 0 : time;
};

const formatCurrency = (value) => {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
};

const formatNumber = (value) => {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";
  return new Intl.NumberFormat("id-ID").format(numberValue);
};

const combineLastReadBy = (id, name) => {
  if (id && name) return `${id} - ${name}`;
  if (id) return id;
  if (name) return name;
  return "-";
};

const normalizeRow = (row) => ({
  tglInput: row.TGL_INPUT || "",
  noAplikasi: row.NO_APLIKASI || "",
  namaNasabah: row.NAMA_NASABAH || "-",
  produk: row.JENIS_PRODUK || "-",
  program: row.KODE_PROGRAM || "-",
  plafon: row.PLAFOND ?? 0,
  cabang: row.NAMA_CABANG || "-",
  area: row.NAMA_AREA || "-",
  region: row.REGION || "-",
  lastPosisi: row.LAST_POSISI || "-",
  lastReadBy: combineLastReadBy(row.LAST_READ_BY, row.LAST_READ_BY_NAME),
  lastUpdate: row.LAST_UPDATE || "",
  jumlahReturn: row.JUM_RETURN ?? 0,
  branchDde: row.BRANCH_DDE || "-",
});

const DetailWiseContent = () => {
  const searchParams = useSearchParams();
  const flowCode = (searchParams.get("flow_code") || "").toUpperCase();
  const mode = (searchParams.get("mode") || "").toUpperCase();
  const region = searchParams.get("region") || searchParams.get("kode_region") || "";
  const area = searchParams.get("area") || searchParams.get("kode_area") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const refDate = searchParams.get("refDate") || "";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "tglInput", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);

  const stageLabel = flowCode || "-";
  const modeLabel = mode || "-";

  useEffect(() => {
    if (!flowCode || !mode) {
      return;
    }

    const fetchRows = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        params.set("flow_code", flowCode);
        params.set("mode", mode);
        if (region) params.set("region", region);
        if (area) params.set("area", area);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (refDate) params.set("refDate", refDate);

        const response = await fetch(`/api/griya/detail-wise?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data detail WISE Griya");
        }
        const payload = await response.json();
        if (!payload?.success) {
          throw new Error(payload?.message || "Gagal memuat detail WISE Griya");
        }
        const data = Array.isArray(payload.data) ? payload.data.map(normalizeRow) : [];
        setRows(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetch detail-wise Griya:", err);
        setRows([]);
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchRows();
  }, [flowCode, mode, region, area, startDate, endDate, refDate]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.tglInput,
        row.noAplikasi,
        row.namaNasabah,
        row.produk,
        row.program,
        row.cabang,
        row.area,
        row.region,
        row.lastPosisi,
        row.lastReadBy,
        row.branchDde,
        String(row.plafon ?? ""),
        String(row.jumlahReturn ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === "asc" ? 1 : -1;

      if (NUMERIC_COLUMNS.has(key)) {
        const aVal = Number(a[key] ?? 0);
        const bVal = Number(b[key] ?? 0);
        return aVal === bVal ? 0 : aVal > bVal ? direction : -direction;
      }

      if (DATE_COLUMNS.has(key)) {
        const aTime = parseDateValue(a[key]);
        const bTime = parseDateValue(b[key]);
        return aTime === bTime ? 0 : aTime > bTime ? direction : -direction;
      }

      const aVal = (a[key] || "").toString().toLowerCase();
      const bVal = (b[key] || "").toString().toLowerCase();
      if (aVal === bVal) return 0;
      return aVal > bVal ? direction : -direction;
    });
    return sorted;
  }, [filteredRows, sortConfig]);

  const totalPages = Math.max(Math.ceil(sortedRows.length / itemsPerPage), 1);
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedRows = sortedRows.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const fromRow = sortedRows.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const toRow = sortedRows.length === 0 ? 0 : Math.min(safePage * itemsPerPage, sortedRows.length);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleDownload = () => {
    if (!rows.length) return;

    const exportRows = sortedRows.map((row) => ({
      "TGL INPUT": row.tglInput || "",
      "NO APLIKASI": row.noAplikasi || "",
      "NAMA NASABAH": row.namaNasabah || "",
      "JENIS PRODUK": row.produk || "",
      "KODE PROGRAM": row.program || "",
      PLAFOND: Number(row.plafon ?? 0),
      CABANG: row.cabang || "",
      AREA: row.area || "",
      REGION: row.region || "",
      "LAST POSISI": row.lastPosisi || "",
      "LAST READ BY": row.lastReadBy || "",
      "LAST UPDATE": row.lastUpdate || "",
      "JUMLAH RETURN": Number(row.jumlahReturn ?? 0),
      "BRANCH DDE": row.branchDde || "",
    }));

    const fileNameParts = [
      flowCode || "DETAIL",
      mode || "WISE",
      "GRIYA",
      (refDate || endDate || startDate || new Date().toISOString().slice(0, 10)).replace(/\s+/g, ""),
      "DETAIL_WISE_GRIYA_PENDING_PROGRESS.xlsx",
    ];

    createExportExcel(
      exportRows,
      [
        "TGL INPUT",
        "NO APLIKASI",
        "NAMA NASABAH",
        "JENIS PRODUK",
        "KODE PROGRAM",
        "PLAFOND",
        "CABANG",
        "AREA",
        "REGION",
        "LAST POSISI",
        "LAST READ BY",
        "LAST UPDATE",
        "JUMLAH RETURN",
        "BRANCH DDE",
      ],
      "Detail WISE - Pending & Progress Griya",
      fileNameParts.filter(Boolean).join("_")
    );
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <span className="ml-2 text-xs text-slate-400">⇅</span>;
    }
    return (
      <span className="ml-2 text-xs font-semibold text-blue-600">
        {sortConfig.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <TablePageLayout
      title={`Detail Pending & Progress Griya - ${stageLabel}`}
      description={`Daftar aplikasi WISE Griya untuk stage ${stageLabel} dengan status ${modeLabel}.`}
      actions={
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <input
              type="text"
              className={`md:w-72 ${inputClass}`}
              placeholder="Cari nomor aplikasi, nasabah, cabang..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              value={itemsPerPage}
              onChange={(event) => {
                setItemsPerPage(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / halaman
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleDownload}
            disabled={!rows.length}
            className="bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Download
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="border px-4 py-3 text-left">No.</th>
                {[
                  { key: "tglInput", label: "TGL INPUT" },
                  { key: "noAplikasi", label: "NO APLIKASI" },
                  { key: "namaNasabah", label: "NAMA NASABAH" },
                  { key: "produk", label: "JENIS PRODUK" },
                  { key: "program", label: "KODE PROGRAM" },
                  { key: "plafon", label: "PLAFOND" },
                  { key: "cabang", label: "CABANG" },
                  { key: "area", label: "AREA" },
                  { key: "region", label: "REGION" },
                  { key: "lastPosisi", label: "LAST POSISI" },
                  { key: "lastReadBy", label: "LAST READ BY" },
                  { key: "lastUpdate", label: "LAST UPDATE" },
                  { key: "jumlahReturn", label: "JUMLAH RETURN" },
                  { key: "branchDde", label: "BRANCH DDE" },
                ].map((column) => (
                  <th
                    key={column.key}
                    className="select-none border px-4 py-3 text-left"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {column.label}
                      {renderSortIndicator(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRows.map((row, index) => (
                <tr key={`${row.noAplikasi}-${index}`} className="hover:bg-slate-50">
                  <td className="border px-4 py-3 text-sm font-semibold text-slate-900">
                    {(safePage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="border px-4 py-3 text-sm text-slate-700">
                    {row.tglInput || "-"}
                  </td>
                  <td className="border px-4 py-3 font-semibold text-slate-900">
                    {row.noAplikasi || "-"}
                  </td>
                  <td className="border px-4 py-3 text-slate-700">{row.namaNasabah}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.produk}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.program}</td>
                  <td className="border px-4 py-3 text-slate-700">{formatCurrency(row.plafon)}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.cabang}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.area}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.region}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.lastPosisi}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.lastReadBy}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.lastUpdate || "-"}</td>
                  <td className="border px-4 py-3 text-slate-700">{formatNumber(row.jumlahReturn)}</td>
                  <td className="border px-4 py-3 text-slate-700">{row.branchDde || "-"}</td>
                </tr>
              ))}

              {paginatedRows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={15}
                    className="py-6 text-center text-sm font-semibold uppercase tracking-wide text-slate-500"
                  >
                    DATA WISE GRIYA TIDAK TERSEDIA
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <span>
            Menampilkan {fromRow === 0 && toRow === 0 ? 0 : `${fromRow} - ${toRow}`} dari {sortedRows.length} data
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safePage <= 1}
            >
              Prev
            </button>
            <span className="font-medium">
              Halaman {safePage} dari {totalPages}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={safePage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </TablePageLayout>
  );
};

export default function DetailWisePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Memuat detail...</div>}>
      <DetailWiseContent />
    </Suspense>
  );
}
