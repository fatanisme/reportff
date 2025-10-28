"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const DivisisTableContent = () => {
  const [divisis, setDivisis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const searchParams = useSearchParams();
  const rawFlowCode = searchParams.get("flow_code");
  const flowCode = rawFlowCode ? rawFlowCode.toUpperCase() : "";
  const mode = searchParams.get("mode") ?? "";

  useEffect(() => {
    if (!flowCode || !mode) {
      return;
    }

    const fetchDivisis = async () => {
      try {
        const res = await fetch(
          `/api/grafik/detail-wise?flow_code=${flowCode}&mode=${mode}`
        );
        const result = await res.json();
        console.log("Data dari API:", result);
        setDivisis(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Gagal ambil data realisisasi:", err);
      }
    };
    fetchDivisis();
  }, [flowCode, mode]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const filteredDivisis = useMemo(() => {
    return divisis.filter((d) =>
      `${d.NO_APLIKASI} ${d.FLOW_CODE} ${d.BRANCH_CODE}${d.NAMA_CUSTOMER}`
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
    { key: "CREATE_DATE", label: "Tanggal Input" },
    { key: "NO_APLIKASI", label: "No Aplikasi" },
    { key: "BRANCH_NAME", label: "Cabang" },
    { key: "NAMA_CUSTOMER", label: "NAMA" },
    { key: "FLOW_CODE", label: "LAST POSISI" },
    { key: "UPDATE_BY", label: "Update By" },
    { key: "UPDATE_DATE", label: "Last Update" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-gray-400">⇅</span>;
    return sortConfig.direction === "asc" ? "🔼" : "🔽";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Detail Aplikasi: {flowCode} - {mode}
          </h2>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <input
              type="text"
              className="p-2 border rounded w-full md:w-auto"
              placeholder="Cari realisasi..."
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
            </tr>
          </thead>
          <tbody>
            {paginatedDivisis.map((realisisasi, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(realisisasi.CREATE_DATE).toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-2 border">{realisisasi.NO_APLIKASI}</td>
                <td className="px-4 py-2 border">
                  {realisisasi.BRANCH_CODE} - {realisisasi.BRANCH_NAME}
                </td>
                <td className="px-4 py-2 border">
                  {realisisasi.NAMA_CUSTOMER}
                </td>
                <td className="px-4 py-2 border">{realisisasi.FLOW_CODE}</td>
                <td className="px-4 py-2 border">{realisisasi.UPDATE_BY}</td>
                <td className="px-4 py-2 border">
                  {new Date(realisisasi.UPDATE_DATE).toISOString().slice(0, 10)}
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

const LoadingFallback = () => (
  <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
    <div className="rounded bg-white px-6 py-4 shadow">Memuat detail aplikasi...</div>
  </div>
);

const DivisisTable = () => (
  <Suspense fallback={<LoadingFallback />}>
    <DivisisTableContent />
  </Suspense>
);

export default DivisisTable;
