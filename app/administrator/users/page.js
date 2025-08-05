"use client";

import React, { useEffect, useState } from "react";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchUsers = async () => {
    try {
      const url = "http://localhost:3000/api/users";
      const res = await fetch(url);
      const result = await res.json();
      setUsers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Gagal ambil data users:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus user ini?")) return;
    try {
      await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((u) => u.ID !== id));
    } catch (err) {
      console.error("Gagal hapus user:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sorted = [...users];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [users, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tabel Data Users</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              (window.location.href = "/administrator/users/create")
            }
          >
            + Create User
          </button>
        </div>

        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              {[
                { key: "ID", label: "ID" },
                { key: "NAME", label: "Nama" },
                { key: "EMAIL", label: "Email" },
                { key: "ROLE", label: "Role" },
              ].map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-2 border cursor-pointer select-none"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    {column.label}
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">{user.ID}</td>
                <td className="px-4 py-2 border">{user.NAME}</td>
                <td className="px-4 py-2 border">{user.EMAIL}</td>
                <td className="px-4 py-2 border">{user.ROLE}</td>
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
            {sortedUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
