"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";

const itemsPerPage = 10;

const MonitoringHelpdesk = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "DATE", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/helpdesk-history");
      if (!response.ok) {
        throw new Error("Gagal mengambil data history");
      }
      const payload = await response.json();
      const data = Array.isArray(payload.data) ? payload.data : [];
      setRecords(data);
    } catch (err) {
      console.error("Error fetch helpdesk history:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const normalizedRecords = useMemo(() => {
    return records.map((record) => ({
      APPLICATION_NO: record.NO_APP ?? "",
      DESCRIPTION: record.ACTION_DESC ?? "",
      USER: record.ACTION_BY ?? "",
      IP_ADDRESS: record.IP_ADDRESS ?? "",
      DATE: record.ACTION_DATE ?? "",
    }));
  }, [records]);

  const filteredAndSortedRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = normalizedRecords.filter((record) => {
      if (!term) return true;
      return (
        record.APPLICATION_NO.toLowerCase().includes(term) ||
        record.DESCRIPTION.toLowerCase().includes(term) ||
        record.USER.toLowerCase().includes(term) ||
        record.IP_ADDRESS.toLowerCase().includes(term) ||
        record.DATE.toLowerCase().includes(term)
      );
    });

    if (!sortConfig.key) {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => {
      const aRaw = a[sortConfig.key] ?? "";
      const bRaw = b[sortConfig.key] ?? "";
      const aVal = aRaw.toString().toLowerCase();
      const bVal = bRaw.toString().toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [normalizedRecords, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);
  const effectivePage = totalPages === 0 ? 0 : Math.min(currentPage, totalPages);
  const startIndex = totalPages === 0 ? 0 : (effectivePage - 1) * itemsPerPage;
  const paginatedRecords = filteredAndSortedRecords.slice(
    startIndex,
    totalPages === 0 ? 0 : startIndex + itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-xs font-medium text-slate-400">SORT</span>;
    }
    return (
      <span className="text-xs font-semibold text-blue-600">
        {sortConfig.direction === "asc" ? "ASC" : "DESC"}
      </span>
    );
  };

  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <TablePageLayout
      title="Monitoring Helpdesk"
      description="Lihat riwayat aktivitas user di modul helpdesk."
      actions={
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button onClick={fetchRecords} disabled={loading}>
            {loading ? "Memuat..." : "Refresh"}
          </Button>
          <input
            type="text"
            placeholder="Cari data..."
            className={`md:w-72 ${inputClass}`}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                {[
                  { key: "APPLICATION_NO", label: "No Aplikasi" },
                  { key: "DESCRIPTION", label: "Deskripsi" },
                  { key: "USER", label: "User" },
                  { key: "IP_ADDRESS", label: "IP Address" },
                  { key: "DATE", label: "Tanggal" },
                ].map((column) => (
                  <th
                    key={column.key}
                    className="select-none border px-4 py-2"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      {column.label}
                      <span className="ml-2">{renderSortIcon(column.key)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record, index) => (
                <tr key={`${record.APPLICATION_NO}-${index}`}>
                  <td className="border px-4 py-2">{record.APPLICATION_NO || "-"}</td>
                  <td className="border px-4 py-2">{record.DESCRIPTION || "-"}</td>
                  <td className="border px-4 py-2">{record.USER || "-"}</td>
                  <td className="border px-4 py-2">{record.IP_ADDRESS || "-"}</td>
                  <td className="border px-4 py-2">{record.DATE || "-"}</td>
                </tr>
              ))}
              {paginatedRecords.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span>
            Halaman {effectivePage} dari {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              disabled={effectivePage <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <button
              disabled={totalPages === 0 || effectivePage >= totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              onClick={() => setCurrentPage((prev) => (totalPages === 0 ? 1 : Math.min(totalPages, prev + 1)))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </TablePageLayout>
  );
};

export default MonitoringHelpdesk;
