"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const GroupsTable = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { success: notifySuccess, error: notifyError, confirm: confirmDialog } =
    useNotification();

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const result = await res.json();
      setGroups(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Gagal ambil data groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: "Hapus Group",
      message: "Yakin mau hapus group ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result?.error || "Gagal menghapus group");
      }
      setGroups((prev) => prev.filter((g) => g.ID !== id));
      notifySuccess("Group berhasil dihapus");
    } catch (err) {
      console.error("Gagal hapus group:", err);
      notifyError(err.message || "Gagal menghapus group");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredGroups = useMemo(() => {
    const normalizedTerm = searchTerm.toLowerCase();
    return groups.filter((g) =>
      `${g.NAME || ""} ${g.DESCRIPTION || ""}`
        .toLowerCase()
        .includes(normalizedTerm)
    );
  }, [groups, searchTerm]);

  const sortedGroups = useMemo(() => {
    let sorted = [...filteredGroups];
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
  }, [filteredGroups, sortConfig]);

  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const paginatedGroups = sortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: "", label: "No." },
    { key: "NAME", label: "Name" },
    { key: "DESCRIPTION", label: "Description" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold">Tabel Data Groups</h2>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <input
              type="text"
              className="p-2 border rounded w-full md:w-auto"
              placeholder="Cari grup..."
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
                (window.location.href = "/administrator/groups/create")
              }
            >
              + Create Group
            </button>
          </div>
        </div>

        {/* Table */}
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
            {paginatedGroups.map((group, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>

                <td className="px-4 py-2 border">{group.NAME}</td>
                <td className="px-4 py-2 border">{group.DESCRIPTION}</td>
                <td className="px-4 py-2 border flex items-center space-x-2">
                  <button
                    className="p-2 bg-yellow-500 rounded hover:bg-yellow-600 text-white"
                    onClick={() =>
                      (window.location.href = `/administrator/groups/edit/${group.ID}`)
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="p-2 bg-red-500 rounded hover:bg-red-600 text-white"
                    onClick={() => handleDelete(group.ID)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {paginatedGroups.length === 0 && (
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

        {/* Pagination Controls */}
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

export default GroupsTable;
