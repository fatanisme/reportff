"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/app/components/ui/DataTable";
import Button from "@/app/components/ui/Button";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import { useNotification } from "@/app/components/ui/NotificationProvider";

export default function MasterPksGriyaPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error: notifyError } = useNotification();

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/realisasi-sla-ff");
      const result = await res.json();
      setRows(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
      notifyError("Gagal mengambil data Master PKS Griya");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const columns = useMemo(
    () => [
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
    ],
    []
  );

  return (
    <TablePageLayout
      title="Master PKS Griya"
      description="Daftar PKS Griya berdasarkan data WISE."
      actions={
        <Button onClick={fetchRows} disabled={loading}>
          {loading ? "Memuat..." : "Muat Ulang"}
        </Button>
      }
    >
      <DataTable
        title="Master PKS Griya"
        data={rows}
        columns={columns}
        searchableKeys={["NO_APLIKASI", "FLOW_CODE", "DIVISION_CODE", "DIVISION_NAME"]}
        isLoading={loading}
        searchPlaceholder="Cari..."
      />
    </TablePageLayout>
  );
}
