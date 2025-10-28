"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/app/components/ui/DataTable";
import Button from "@/app/components/ui/Button";
import axios from "@/lib/axios";
import { createExportExcel } from "@/app/components/utils/exportExcel";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const sanitizeString = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") return null;
  return str;
};

const displayText = (value) => {
  const sanitized = sanitizeString(value);
  return sanitized ?? "-";
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return displayText(value);
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(number);
};

const normalizeRow = (item = {}) => ({
  noAplikasi: sanitizeString(item.NO_APLIKASI),
  namaNasabah: sanitizeString(item.NAMA_NASABAH),
  jenisProduk: sanitizeString(item.JENIS_PRODUK),
  cabang: sanitizeString(item.CABANG),
  area: sanitizeString(item.AREA),
  region: sanitizeString(item.REGION),
  plafon: item.PLAFOND ?? null,
  plafonLimit: item.PLAFOND_LIMIT ?? null,
  tenor: item.TENOR ?? null,
  lastPosisi: sanitizeString(item.LAST_POSISI),
  tipeProduk: sanitizeString(item.TIPE_PRODUK),
  programEvent: sanitizeString(item.PROGRAM_EVENT),
});

const EXPORT_HEADERS = [
  "NO APLIKASI",
  "NAMA NASABAH",
  "CABANG",
  "AREA",
  "REGION",
  "JENIS PRODUK",
  "PLAFOND",
  "PLAFOND LIMIT",
  "TENOR",
  "LAST POSISI",
  "TIPE PRODUK",
  "PROGRAM / EVENT",
];

export default function PipelineFFPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error: notifyError, warning: notifyWarning } = useNotification();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/pipeline-ff");
      if (response.data?.success === false) {
        notifyError(response.data?.message || "Gagal mengambil data Pipeline FF");
        setRows([]);
        return;
      }
      const rawRows = Array.isArray(response.data?.data) ? response.data.data : [];
      setRows(rawRows.map((item) => normalizeRow(item)));
    } catch (error) {
      console.error("Gagal ambil data pipeline:", error);
      notifyError("Gagal mengambil data Pipeline FF");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = useCallback(() => {
    if (!rows.length) {
      notifyWarning("Belum ada data yang bisa diunduh");
      return;
    }

    const formatted = rows.map((row) => ({
      "NO APLIKASI": row.noAplikasi ? `'${row.noAplikasi}` : "-",
      "NAMA NASABAH": displayText(row.namaNasabah),
      CABANG: displayText(row.cabang),
      AREA: displayText(row.area),
      REGION: displayText(row.region),
      "JENIS PRODUK": displayText(row.jenisProduk),
      PLAFOND: formatCurrency(row.plafon),
      "PLAFOND LIMIT": formatCurrency(row.plafonLimit),
      TENOR: row.tenor !== null && row.tenor !== undefined ? `${row.tenor}` : "-",
      "LAST POSISI": displayText(row.lastPosisi),
      "TIPE PRODUK": displayText(row.tipeProduk),
      "PROGRAM / EVENT": displayText(row.programEvent),
    }));

    createExportExcel(formatted, EXPORT_HEADERS, "Detail Pipeline WISE", "Detail PIPELINE WISE.xlsx");
  }, [notifyWarning, rows]);

  const columns = useMemo(
    () => [
      {
        key: "noAplikasi",
        label: "NO APLIKASI",
        sortable: true,
        render: (row) => (row.noAplikasi ? `'${row.noAplikasi}` : "-"),
      },
      {
        key: "namaNasabah",
        label: "NAMA NASABAH",
        sortable: true,
        render: (row) => displayText(row.namaNasabah),
      },
      {
        key: "cabang",
        label: "CABANG",
        sortable: true,
        render: (row) => displayText(row.cabang),
      },
      {
        key: "area",
        label: "AREA",
        sortable: true,
        render: (row) => displayText(row.area),
      },
      {
        key: "region",
        label: "REGION",
        sortable: true,
        render: (row) => displayText(row.region),
      },
      {
        key: "jenisProduk",
        label: "JENIS PRODUK",
        sortable: true,
        render: (row) => displayText(row.jenisProduk),
      },
      {
        key: "plafon",
        label: "PLAFOND",
        sortable: true,
        render: (row) => formatCurrency(row.plafon),
      },
      {
        key: "plafonLimit",
        label: "PLAFOND LIMIT",
        sortable: true,
        render: (row) => formatCurrency(row.plafonLimit),
      },
      {
        key: "tenor",
        label: "TENOR",
        sortable: true,
        render: (row) =>
          row.tenor !== null && row.tenor !== undefined ? `${row.tenor}` : "-",
      },
      {
        key: "lastPosisi",
        label: "LAST POSISI",
        sortable: true,
        render: (row) => displayText(row.lastPosisi),
      },
      {
        key: "tipeProduk",
        label: "TIPE PRODUK",
        sortable: true,
        render: (row) => displayText(row.tipeProduk),
      },
      {
        key: "programEvent",
        label: "PROGRAM / EVENT",
        sortable: true,
        render: (row) => displayText(row.programEvent),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pipeline FF</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan aplikasi FF Mitraguna &amp; Pensiun lengkap dengan status pipeline terbaru.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "Memuat..." : "Muat Ulang"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!rows.length}
            className="bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Download
          </Button>
        </div>
      </div>

      <DataTable
        title="Pipeline FF"
        data={rows}
        columns={columns}
        searchableKeys={[
          "noAplikasi",
          "namaNasabah",
          "cabang",
          "area",
          "region",
          "jenisProduk",
          "lastPosisi",
          "tipeProduk",
          "programEvent",
        ]}
        isLoading={loading}
        searchPlaceholder="Cari nomor aplikasi, cabang, atau status..."
        initialSort={{ key: "noAplikasi", direction: "asc" }}
      />
    </div>
  );
}
