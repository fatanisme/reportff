"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/app/components/ui/DataTable";

export default function PipelineFFPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pipeline-ff");
        const result = await res.json();
        setRows(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Gagal ambil data pipeline:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, []);

  const columns = [
    { key: "NO_APLIKASI", label: "No Aplikasi", sortable: true },
    { key: "FLOW_CODE", label: "Nama Nasabah", sortable: true },
    { key: "DIVISION_CODE", label: "Cabang", sortable: true },
    { key: "DIVISION_CODE", label: "Area", sortable: true },
    { key: "DIVISION_NAME", label: "Region", sortable: true },
    { key: "DIVISION_NAME", label: "Jenis Produk", sortable: true },
    { key: "DIVISION_NAME", label: "Plafond", sortable: true },
    { key: "DIVISION_NAME", label: "Plafond MIT", sortable: true },
    { key: "DIVISION_NAME", label: "TENOR", sortable: true },
    { key: "DIVISION_NAME", label: "LAST POSISI", sortable: true },
    { key: "DIVISION_NAME", label: "TIPE PRODUK", sortable: true },
    { key: "DIVISION_NAME", label: "PROGRAM / EVENT", sortable: true },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        title="PIPELINE FF"
        data={rows}
        columns={columns}
        searchableKeys={["NO_APLIKASI", "FLOW_CODE", "DIVISION_CODE", "DIVISION_NAME"]}
        isLoading={loading}
        searchPlaceholder="Cari pipeline..."
      />
    </div>
  );
}
