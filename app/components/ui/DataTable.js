"use client";

import React, { useMemo, useState } from "react";

export default function DataTable({
  title,
  data = [],
  columns = [], // [{ label, key?, sortable?, render? }]
  searchableKeys = [],
  initialSort = { key: null, direction: "asc" },
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize = 10,
  searchPlaceholder = "Cari...",
  isLoading = false,
  emptyMessage = "Data tidak ditemukan",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);

  const handleSort = (key, sortable) => {
    if (!key || sortable === false) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) => {
      if (searchableKeys.length === 0) return true;
      return searchableKeys.some((key) => `${row[key] ?? ""}`.toLowerCase().includes(lower));
    });
  }, [data, searchTerm, searchableKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const key = sortConfig.key;
    const direction = sortConfig.direction;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const aVal = `${a[key] ?? ""}`.toLowerCase();
      const bVal = `${b[key] ?? ""}`.toLowerCase();
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return copy;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageEnd = currentPage * itemsPerPage;
  const paginated = sortedData.slice(pageStart, pageEnd);

  const renderSortIcon = (col) => {
    if (!col.key || col.sortable === false) {
      return <span className="ml-2 text-xs text-slate-400">⇅</span>;
    }
    if (sortConfig.key !== col.key) {
      return <span className="ml-2 text-xs text-slate-400">⇅</span>;
    }
    return (
      <span className="ml-2 text-xs font-semibold text-blue-500">
        {sortConfig.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 md:w-32"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / halaman
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`relative overflow-x-auto ${isLoading ? "pointer-events-none" : ""}`}>
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-100/80">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                No.
              </th>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 ${col.key && col.sortable !== false ? "cursor-pointer select-none" : ""}`}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <span className="flex items-center">
                    {col.label}
                    {renderSortIcon(col)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginated.map((row, index) => (
              <tr key={index} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {pageStart + index + 1}
                </td>
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="whitespace-nowrap px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {paginated.length === 0 && !isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <span>
          Halaman <strong className="text-slate-900">{currentPage}</strong> dari {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            ← Prev
          </button>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}


