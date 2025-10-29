"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";

const DivisisTable = () => {
  const [maintenances, setDivisis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { success: notifySuccess, error: notifyError, confirm: confirmDialog } =
    useNotification();

  useEffect(() => {
    const fetchDivisis = async () => {
      try {
        const res = await fetch("/api/maintenance");
        const result = await res.json();
        setDivisis(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Gagal ambil data maintenance:", err);
      }
    };
    fetchDivisis();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: "Hapus Maintenance",
      message: "Yakin mau hapus maintenance ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result?.error || "Gagal menghapus maintenance");
      }
      setDivisis((prev) => prev.filter((g) => g.ID !== id));
      notifySuccess("Maintenance berhasil dihapus");
    } catch (err) {
      console.error("Gagal hapus maintenance:", err);
      notifyError(err.message || "Gagal menghapus maintenance");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredDivisis = useMemo(() => {
    return maintenances.filter((d) =>
      `${d.DIVISION_CODE} ${d.DIVISION_NAME} ${d.DESCRIPTION}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [maintenances, searchTerm]);

  const sortedDivisis = useMemo(() => {
    let sorted = [...filteredDivisis];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    return sorted;
  }, [filteredDivisis, sortConfig]);

  const totalPages = Math.ceil(sortedDivisis.length / itemsPerPage);
  const paginatedDivisis = sortedDivisis.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: "", label: "No." },
    { key: "KODE_AREA", label: "Kode Area" },
    { key: "AREA", label: "Area" },
    { key: "KODE_REGION", label: "Kode Region" },
    { key: "REGION", label: "REGION" },
    { key: "REGION_ALIAS", label: "Region Alias" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";
  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 md:w-auto";

  return (
    <TablePageLayout
      title="Tabel Data Maintenance"
      description="Kelola mapping maintenance RO (Area)."
      actions={
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <input
            type="text"
            className={inputClass}
            placeholder="Cari maintenance..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className={selectClass}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 / halaman</option>
            <option value={10}>10 / halaman</option>
            <option value={25}>25 / halaman</option>
            <option value={50}>50 / halaman</option>
          </select>
          <Button
            onClick={() =>
              (window.location.href =
                "/administrator/maintenance-ro-(area)/create")
            }
          >
            + Create Maintenance
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <table className="min-w-full table-auto border border-slate-200">
          <thead className="bg-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-2 border ${
                    col.key ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  <div className="flex justify-between items-center">
                    {col.label}
                    {col.key && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDivisis.map((maintenance, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-2 border">{maintenance.KODE_AREA}</td>
                <td className="px-4 py-2 border">{maintenance.AREA}</td>
                <td className="px-4 py-2 border">{maintenance.KODE_REGION}</td>
                <td className="px-4 py-2 border">{maintenance.REGION}</td>
                <td className="px-4 py-2 border">{maintenance.REGION_ALIAS}</td>
                <td className="flex items-center gap-2 px-4 py-2 border">
                  <button
                    className="rounded-lg border border-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                    onClick={() =>
                      (window.location.href = `/administrator/maintenance-ro-(area)/edit/${maintenance.ID}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg border border-red-400 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(maintenance.ID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedDivisis.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-gray-500"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <span>
            Halaman {currentPage} dari {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </TablePageLayout>
  );
};

export default DivisisTable;
