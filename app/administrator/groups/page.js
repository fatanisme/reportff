"use client";

import React, { useEffect, useState, useMemo } from "react";

const GroupsTable = () => {
  const [groups, setGroups] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/groups");
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
    if (!confirm("Yakin mau hapus group ini?")) return;
    try {
      await fetch(`http://localhost:3000/api/groups/${id}`, {
        method: "DELETE",
      });
      setGroups((prev) => prev.filter((g) => g.ID !== id));
    } catch (err) {
      console.error("Gagal hapus group:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedGroups = useMemo(() => {
    let sorted = [...groups];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [groups, sortConfig]);

  const columns = [
    { key: "", label: "No." },
    { key: "FIRST_NAME", label: "First Name" },
    { key: "LAST_NAME", label: "Last Name" },
    { key: "USERNAME", label: "Username" },
    { key: "EMAIL", label: "Email" },
    { key: "STATUS", label: "Status" },
    { key: "DIVISI", label: "Divisi" },
    { key: "NAME", label: "Role" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tabel Data Groups</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              (window.location.href = "/administrator/groups/create")
            }
          >
            + Create Group
          </button>
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
            {sortedGroups.map((group, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{group.FIRST_NAME}</td>
                <td className="px-4 py-2 border">{group.LAST_NAME}</td>
                <td className="px-4 py-2 border">{group.USERNAME}</td>
                <td className="px-4 py-2 border">{group.EMAIL}</td>
                <td className="px-4 py-2 border">{group.STATUS}</td>
                <td className="px-4 py-2 border">{group.DIVISI}</td>
                <td className="px-4 py-2 border">{group.NAME}</td>
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
            {sortedGroups.length === 0 && (
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
      </div>
    </div>
  );
};

export default GroupsTable;
