"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const DivisisTable = () => {
  const [divisis, setDivisis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { success: notifySuccess, error: notifyError, confirm: confirmDialog } =
    useNotification();

  const fetchDivisis = async () => {
      try {
        const res = await fetch("/api/divisi");
        const result = await res.json();
        setDivisis(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Gagal ambil data divisi:", err);
      }
    };
  
    useEffect(() => {
      fetchDivisis();
    }, []);

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: "Hapus Divisi",
      message: "Yakin mau hapus divisi ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/divisi/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result?.error || "Gagal menghapus divisi");
      }
      setDivisis((prev) => prev.filter((g) => g.ID_DIVISI !== id));
      notifySuccess("Divisi berhasil dihapus");
    } catch (err) {
      console.error("Gagal hapus divisi:", err);
      notifyError(err.message || "Gagal menghapus divisi");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredDivisis = useMemo(() => {
    return divisis.filter((d) =>
      `${d.KODE_DIVISI} ${d.NAMA_DIVISI} ${d.DESKRIPSI}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [divisis, searchTerm]);

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
    { key: "KODE_DIVISI", label: "Kode Divisi" },
    { key: "NAMA_DIVISI", label: "Nama Divisi" },
    { key: "DESKRIPSI", label: "Deskripsi" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold">Tabel Data Divisi</h2>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <input
              type="text"
              className="p-2 border rounded w-full md:w-auto"
              placeholder="Cari divisi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="p-2 border rounded"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() =>
                (window.location.href = "/administrator/divisi/create")
              }
            >
              + Create Divisi
            </button>
          </div>
        </div>

        <table className="min-w-full table-auto border border-black-300">
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
            {paginatedDivisis.map((divisi, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-2 border">{divisi.KODE_DIVISI}</td>
                <td className="px-4 py-2 border">{divisi.NAMA_DIVISI}</td>
                <td className="px-4 py-2 border">{divisi.DESKRIPSI}</td>
                <td className="px-4 py-2 border flex items-center space-x-2">
                  <button
                    className="p-2 bg-yellow-500 rounded hover:bg-yellow-600 text-white"
                    onClick={() =>
                      (window.location.href = `/administrator/divisi/edit/${divisi.ID_DIVISI}`)
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="p-2 bg-red-500 rounded hover:bg-red-600 text-white"
                    onClick={() => handleDelete(divisi.ID_DIVISI)}
                  >
                    🗑️
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

        <div className="mt-4 flex justify-between items-center text-sm">
          <span>
            Halaman {currentPage} dari {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              ⬅️ Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisisTable;
