"use client";

import React, { useEffect, useState, useMemo } from "react";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const result = await res.json();
        setUsers(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Gagal ambil data users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus user ini?")) return;
    try {
      await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((u) => u.ID !== id));
    } catch (err) {
      console.error("Gagal hapus user:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const columns = [
    { key: "", label: "No." },
    { key: "FIRST_NAME", label: "First Name" },
    { key: "LAST_NAME", label: "Last Name" },
    { key: "EMAIL", label: "Email" },
    { key: "DIVISION_NAME", label: "Divisi" },
    { key: "STATUS", label: "Status" },
    { key: "PHONE", label: "Phone" },
    { key: "IP_ADDRESS", label: "IP Address" },
  ];

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const statusLabel = Number(user.STATUS) === 0 ? "deactive" : "active";
      const divisionLabel =
        user.DIVISION_NAME || user.DIVISION_CODE || user.DIVISION_ID || "";
      return `${user.FIRST_NAME || ""} ${user.LAST_NAME || ""} ${
        user.EMAIL || ""
      } ${divisionLabel} ${statusLabel} ${user.PHONE || ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    let sorted = [...filteredUsers];
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
  }, [filteredUsers, sortConfig]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold">Tabel Data Users</h2>
          <div className="flex gap-4">
            <input
              type="text"
              className="p-2 border rounded w-full md:w-auto"
              placeholder="Cari ..."
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
                (window.location.href = "/administrator/users/create")
              }
            >
              + Create User
            </button>
          </div>
        </div>

        <table className="min-w-full table-auto border border-gray-300">
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
            {paginatedUsers.map((user, index) => (
              <tr key={user.ID ?? index}>
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-2 border">{user.FIRST_NAME}</td>
                <td className="px-4 py-2 border">{user.LAST_NAME}</td>
                <td className="px-4 py-2 border">{user.EMAIL}</td>
                <td className="px-4 py-2 border">
                  {(user.DIVISION_NAME || user.DIVISION_CODE || user.DIVISION_ID || "-")
                    .toString()
                    .toUpperCase()}
                </td>
                <td className="px-4 py-2 border">
                  {Number(user.STATUS) === 0 ? "DEACTIVE" : "ACTIVE"}
                </td>
                <td className="px-4 py-2 border">{user.PHONE || "-"}</td>
                <td className="px-4 py-2 border">{user.IP_ADDRESS || "-"}</td>

                <td className="px-4 py-2 border space-x-2 flex items-center">
                  <button
                    className="p-2 bg-yellow-500 rounded hover:bg-yellow-600 text-white text-sm"
                    onClick={() =>
                      (window.location.href = `/administrator/users/edit/${user.ID}`)
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="p-2 bg-red-500 rounded hover:bg-red-600 text-white text-sm"
                    onClick={() => handleDelete(user.ID)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
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
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ⬅️ Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
