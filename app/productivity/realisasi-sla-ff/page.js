"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/app/components/ui/DataTable";

export default function RealisasiSlaFFPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/realisasi-sla-ff");
        const result = await res.json();
        setRows(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Gagal ambil data realisisasi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, []);

  const columns = [
    { key: "NO_APLIKASI", label: "No Aplikasi", sortable: true },
    { key: "FLOW_CODE", label: "Jenis Produk", sortable: true },
    { key: "DIVISION_CODE", label: "Cabang", sortable: true },
    { key: "DIVISION_CODE", label: "Area", sortable: true },
    { key: "DIVISION_NAME", label: "Region", sortable: true },
    { key: "DESCRIPTION", label: "IN DDE" },
    { key: "DESCRIPTION", label: "OUT DDE" },
    { key: "DESCRIPTION", label: "SLA DDE" },
    { key: "DESCRIPTION", label: "IN VERIN" },
    { key: "DESCRIPTION", label: "OUT VERIN" },
    { key: "DESCRIPTION", label: "IN APPROVAL" },
    { key: "DESCRIPTION", label: "OUT APPROVAL" },
    { key: "DESCRIPTION", label: "SLA APPROVAL" },
    { key: "DESCRIPTION", label: "REALISASI SLA" },
    { key: "DESCRIPTION", label: "LAST POSISI" },
    { key: "DESCRIPTION", label: "BRANCH DDE" },
    { key: "DESCRIPTION", label: "BRANCH VERIN" },
    { key: "DESCRIPTION", label: "BRANCH APPROVAL" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        title="Realisasi SLA FF"
        data={rows}
        columns={columns}
        searchableKeys={["NO_APLIKASI", "FLOW_CODE", "DIVISION_CODE", "DIVISION_NAME"]}
        isLoading={loading}
        searchPlaceholder="Cari realisasi..."
      />
    </div>
  );
}
