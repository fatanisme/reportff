"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/app/components/ui/DataTable";

export default function ReportLDPencairanPage() {
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
        console.error("Gagal ambil data report LD:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, []);

  const columns = [
    { key: "NO_APLIKASI", label: "Tanggal Cair", sortable: true },
    { key: "FLOW_CODE", label: "No Aplikasi", sortable: true },
    { key: "ReportLdON_CODE", label: "Nama Nasabah", sortable: true },
    { key: "ReportLdON_CODE", label: "Branch Code", sortable: true },
    { key: "ReportLdON_NAME", label: "Produk", sortable: true },
    { key: "ReportLdON_NAME", label: "Status", sortable: true },
    { key: "ReportLdON_NAME", label: "LD / Ket Pencairan", sortable: true },
    { key: "ReportLdON_NAME", label: "Sequence Cair", sortable: true },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        title="REPORT LD PENCAIRAN WISE"
        data={rows}
        columns={columns}
        searchableKeys={["NO_APLIKASI", "FLOW_CODE", "ReportLdON_CODE", "ReportLdON_NAME"]}
        isLoading={loading}
        searchPlaceholder="Cari report LD..."
      />
    </div>
  );
}
