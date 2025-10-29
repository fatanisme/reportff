"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";

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

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";
  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 md:w-auto";

  return (
    <TablePageLayout
      title="Tabel Data Groups"
      description="Kelola grouping user untuk kebutuhan otorisasi menu."
      actions={
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <input
            type="text"
            className={inputClass}
            placeholder="Cari group..."
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
              (window.location.href = "/administrator/groups/create")
            }
          >
            + Create Group
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
            {paginatedGroups.map((group, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>

                <td className="px-4 py-2 border">{group.NAME}</td>
                <td className="px-4 py-2 border">{group.DESCRIPTION}</td>
                <td className="flex items-center gap-2 px-4 py-2 border">
                  <button
                    className="rounded-lg border border-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                    onClick={() =>
                      (window.location.href = `/administrator/groups/edit/${group.ID}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg border border-red-400 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(group.ID)}
                  >
                    Delete
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

export default GroupsTable;
