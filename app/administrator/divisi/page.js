"use client";

import React, { useEffect, useState, useMemo } from "react";

const DivisisTable = () => {
  const [divisis, setDivisis] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchDivisis = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/divisi");
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
    if (!confirm("Yakin mau hapus divisi ini?")) return;
    try {
      await fetch(`http://localhost:3000/api/divisi/${id}`, {
        method: "DELETE",
      });
      setDivisis((prev) => prev.filter((g) => g.ID !== id));
    } catch (err) {
      console.error("Gagal hapus divisi:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedDivisis = useMemo(() => {
    let sorted = [...divisis];
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
  }, [divisis, sortConfig]);

  const columns = [
    { key: "", label: "No." },
    { key: "DIVISION_CODE", label: "Kode Divisi" },
    { key: "DIVISION_NAME", label: "Nama Divisi" },
    { key: "DESCRIPTION", label: "Deskripsi" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tabel Data Divisi</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              (window.location.href = "/administrator/divisi/create")
            }
          >
            + Create Divisi
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
            {sortedDivisis.map((divisi, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{divisi.DIVISION_CODE}</td>
                <td className="px-4 py-2 border">{divisi.DIVISION_NAME}</td>
                <td className="px-4 py-2 border">{divisi.DESCRIPTION}</td>
                <td className="px-4 py-2 border flex items-center space-x-2">
                  <button
                    className="p-2 bg-yellow-500 rounded hover:bg-yellow-600 text-white"
                    onClick={() =>
                      (window.location.href = `/administrator/divisi/edit/${divisi.ID}`)
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="p-2 bg-red-500 rounded hover:bg-red-600 text-white"
                    onClick={() => handleDelete(divisi.ID)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {sortedDivisis.length === 0 && (
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

export default DivisisTable;
