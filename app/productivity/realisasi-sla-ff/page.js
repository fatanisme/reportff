"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DataTable from "@/app/components/ui/DataTable";
import DateInput from "@/app/components/ui/DateInput";
import Button from "@/app/components/ui/Button";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import axios from "@/lib/axios";
import { createExportExcel } from "@/app/components/utils/exportExcel";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const formatDateInput = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sanitizeString = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  const lower = str.toLowerCase();
  if (lower === "null" || lower === "undefined") return null;
  return str;
};

const pickValue = (source = {}, keys = []) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      if (value === null || value === undefined) continue;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (lower === "null" || lower === "undefined") continue;
        return trimmed;
      }
      return value;
    }
  }
  return null;
};

const normalizeDurationValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const str = String(value).trim();
  if (!str) return null;
  const lower = str.toLowerCase();
  if (lower === "null" || lower === "undefined") return null;
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    const numeric = Number(str);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return str;
};

const toSecondsFromTimeString = (value) => {
  const normalized = value.replace(/\s+/g, ":");
  if (!/^\d+(?::\d{1,2}){1,3}$/.test(normalized)) return null;
  const parts = normalized.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 2) {
    const [hours, minutes] = parts;
    return hours * 3600 + minutes * 60;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 4) {
    const [days, hours, minutes, seconds] = parts;
    return ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
  }
  return null;
};

const formatDurationFromSeconds = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined) return "-";
  const safeTotal = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safeTotal / 86400);
  const hours = Math.floor((safeTotal % 86400) / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = safeTotal % 60;
  return `${days}h ${hours}j ${minutes}m ${seconds}d`;
};

const formatDuration = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number" && !Number.isNaN(value)) {
    return formatDurationFromSeconds(value);
  }
  const str = String(value).trim();
  if (!str) return "-";
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return formatDurationFromSeconds(Number(str));
  }
  if (/^\d+h \d+j \d+m \d+d$/.test(str)) {
    return str;
  }
  const seconds = toSecondsFromTimeString(str);
  if (seconds !== null) {
    return formatDurationFromSeconds(seconds);
  }
  return str;
};

const displayText = (value) => {
  if (value === null || value === undefined) return "-";
  const str = String(value).trim();
  return str.length === 0 ? "-" : str;
};

const normalizeRow = (item = {}) => ({
  noAplikasi: sanitizeString(pickValue(item, ["NO_APLIKASI", "NOAPLIKASI", "NO_APL"])),
  jenisProduk: sanitizeString(pickValue(item, ["JENIS_PRODUK", "JENISPRODUK"])),
  cabang: sanitizeString(pickValue(item, ["CABANG", "NAMA_CABANG", "CABANG_NAME"])),
  area: sanitizeString(pickValue(item, ["AREA", "NAMA_AREA"])),
  region: sanitizeString(pickValue(item, ["REGION"])),
  inDde: sanitizeString(pickValue(item, ["IN_DDE", "IN_DDE_DATE", "TGL_IN_DDE"])),
  outDde: sanitizeString(pickValue(item, ["OUT_DDE", "OUT_DDE_DATE", "TGL_OUT_DDE"])),
  slaDde: normalizeDurationValue(pickValue(item, ["SLA_DDE", "SLA_DDE_SEC", "SLA_DDE_SECONDS"])),
  inVerin: sanitizeString(pickValue(item, ["IN_VERIN", "IN_VERIFIKASI", "TGL_IN_VERIN"])),
  outVerin: sanitizeString(pickValue(item, ["OUT_VERIN", "OUT_VERIFIKASI", "TGL_OUT_VERIN"])),
  slaVerin: normalizeDurationValue(pickValue(item, ["SLA_VERIN", "SLA_VERIN_SEC", "SLA_VERIN_SECONDS"])),
  inApproval: sanitizeString(pickValue(item, ["IN_APPROVAL", "TGL_IN_APPROVAL"])),
  outApproval: sanitizeString(pickValue(item, ["OUT_APPROVAL", "TGL_OUT_APPROVAL"])),
  slaApproval: normalizeDurationValue(
    pickValue(item, ["SLA_APPROVAL", "SLA_APPROVAL_SEC", "SLA_APPROVAL_SECONDS"])
  ),
  realisasiSla: normalizeDurationValue(
    pickValue(item, ["REALISASI_SLA", "TOTAL_SLA", "TOTAL_SLA_SEC", "TOTAL_REALISASI_SLA"])
  ),
  lastPosisi: sanitizeString(pickValue(item, ["LAST_POSISI", "LASTPOSISI", "LAST_POSITION"])),
  branchDde: sanitizeString(pickValue(item, ["BRANCH_DDE"])),
  branchVerin: sanitizeString(pickValue(item, ["BRANCH_VERIN"])),
  branchApproval: sanitizeString(pickValue(item, ["BRANCH_APPROVAL"])),
});

const extractRowsFromResponse = (responseData) => {
  if (!responseData) return [];
  if (responseData.success === false && Array.isArray(responseData.data)) {
    return responseData.data;
  }
  if (Array.isArray(responseData)) return responseData;
  if (responseData.success === false) return [];
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.result)) return responseData.result;
  if (Array.isArray(responseData?.rows)) return responseData.rows;
  if (responseData?.data?.rows && Array.isArray(responseData.data.rows)) {
    return responseData.data.rows;
  }
  return [];
};

const EXPORT_HEADERS = [
  "NO APLIKASI",
  "JENIS PRODUK",
  "CABANG",
  "AREA",
  "REGION",
  "IN DDE",
  "OUT DDE",
  "SLA DDE",
  "IN VERIN",
  "OUT VERIN",
  "SLA VERIN",
  "IN APPROVAL",
  "OUT APPROVAL",
  "SLA APPROVAL",
  "REALISASI SLA",
  "LAST POSISI",
  "BRANCH DDE",
  "BRANCH VERIN",
  "BRANCH APPROVAL",
];

export default function RealisasiSlaFFPage() {
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const initialFetchRef = useRef(false);
  const { error: notifyError, warning: notifyWarning } = useNotification();

  const fetchData = useCallback(
    async (date, { notifyWhenEmpty = false } = {}) => {
      if (!date) {
        notifyError("Tanggal wajib dipilih sebelum menampilkan data");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/realisasi_sla_ff/wise`, {
          params: { tgl: date },
        });

        if (response.data?.success === false) {
          const message =
            response.data?.message || "Gagal mengambil data Realisasi SLA";
          notifyError(message);
          setRows([]);
          return;
        }

        const rawRows = extractRowsFromResponse(response.data);
        const normalized = rawRows.map((item) => normalizeRow(item));

        if (notifyWhenEmpty && normalized.length === 0) {
          notifyWarning("Data tidak ditemukan untuk tanggal tersebut");
        }

        setRows(normalized);
      } catch (error) {
        console.error("Gagal ambil data realisasi SLA FF:", error);
        notifyError("Gagal mengambil data Realisasi SLA");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [notifyError, notifyWarning]
  );

  useEffect(() => {
    if (selectedDate && !initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchData(selectedDate);
    }
  }, [fetchData, selectedDate]);

  const handleShowClick = useCallback(() => {
    fetchData(selectedDate, { notifyWhenEmpty: true });
  }, [fetchData, selectedDate]);

  const handleDownload = useCallback(() => {
    if (!rows.length) {
      notifyWarning("Belum ada data yang bisa diunduh");
      return;
    }

    const formatted = rows.map((row) => {
      const entry = {};
      entry["NO APLIKASI"] = row.noAplikasi ? `'${row.noAplikasi}` : "-";
      entry["JENIS PRODUK"] = displayText(row.jenisProduk);
      entry["CABANG"] = displayText(row.cabang);
      entry["AREA"] = displayText(row.area);
      entry["REGION"] = displayText(row.region);
      entry["IN DDE"] = displayText(row.inDde);
      entry["OUT DDE"] = displayText(row.outDde);
      entry["SLA DDE"] = formatDuration(row.slaDde);
      entry["IN VERIN"] = displayText(row.inVerin);
      entry["OUT VERIN"] = displayText(row.outVerin);
      entry["SLA VERIN"] = formatDuration(row.slaVerin);
      entry["IN APPROVAL"] = displayText(row.inApproval);
      entry["OUT APPROVAL"] = displayText(row.outApproval);
      entry["SLA APPROVAL"] = formatDuration(row.slaApproval);
      entry["REALISASI SLA"] = formatDuration(row.realisasiSla);
      entry["LAST POSISI"] = displayText(row.lastPosisi);
      entry["BRANCH DDE"] = displayText(row.branchDde);
      entry["BRANCH VERIN"] = displayText(row.branchVerin);
      entry["BRANCH APPROVAL"] = displayText(row.branchApproval);
      return entry;
    });

    const fileNameDate = selectedDate || formatDateInput(new Date());
    createExportExcel(
      formatted,
      EXPORT_HEADERS,
      "Realisasi SLA FF",
      `${fileNameDate}_REALISASI_SLA.xlsx`
    );
  }, [notifyWarning, rows, selectedDate]);

  const columns = useMemo(
    () => [
      {
        key: "noAplikasi",
        label: "NO APLIKASI",
        sortable: true,
        render: (row) => {
          const value = row.noAplikasi;
          if (!value) return "-";
          return `'${value}`;
        },
      },
      {
        key: "jenisProduk",
        label: "JENIS PRODUK",
        sortable: true,
        render: (row) => displayText(row.jenisProduk),
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
        key: "inDde",
        label: "IN DDE",
        render: (row) => displayText(row.inDde),
      },
      {
        key: "outDde",
        label: "OUT DDE",
        render: (row) => displayText(row.outDde),
      },
      {
        key: "slaDde",
        label: "SLA DDE",
        render: (row) => formatDuration(row.slaDde),
      },
      {
        key: "inVerin",
        label: "IN VERIN",
        render: (row) => displayText(row.inVerin),
      },
      {
        key: "outVerin",
        label: "OUT VERIN",
        render: (row) => displayText(row.outVerin),
      },
      {
        key: "slaVerin",
        label: "SLA VERIN",
        render: (row) => formatDuration(row.slaVerin),
      },
      {
        key: "inApproval",
        label: "IN APPROVAL",
        render: (row) => displayText(row.inApproval),
      },
      {
        key: "outApproval",
        label: "OUT APPROVAL",
        render: (row) => displayText(row.outApproval),
      },
      {
        key: "slaApproval",
        label: "SLA APPROVAL",
        render: (row) => formatDuration(row.slaApproval),
      },
      {
        key: "realisasiSla",
        label: "REALISASI SLA",
        render: (row) => formatDuration(row.realisasiSla),
      },
      {
        key: "lastPosisi",
        label: "LAST POSISI",
        sortable: true,
        render: (row) => displayText(row.lastPosisi),
      },
      {
        key: "branchDde",
        label: "BRANCH DDE",
        sortable: true,
        render: (row) => displayText(row.branchDde),
      },
      {
        key: "branchVerin",
        label: "BRANCH VERIN",
        sortable: true,
        render: (row) => displayText(row.branchVerin),
      },
      {
        key: "branchApproval",
        label: "BRANCH APPROVAL",
        sortable: true,
        render: (row) => displayText(row.branchApproval),
      },
    ],
    []
  );

  return (
    <TablePageLayout
      title="Realisasi SLA FF"
      description="Pilih tanggal untuk menampilkan realisasi SLA FF pada sistem WISE."
      actions={
        <>
          <div className="md:w-60">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Tanggal
            </label>
            <DateInput
              value={selectedDate}
              onChange={setSelectedDate}
              max={formatDateInput(new Date())}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleShowClick} disabled={loading}>
              {loading ? "Memuat..." : "Tampilkan"}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!rows.length}
              className="bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              Download Data WISE
            </Button>
          </div>
        </>
      }
    >
      <DataTable
        title="Realisasi SLA FF"
        data={rows}
        columns={columns}
        searchableKeys={["noAplikasi", "jenisProduk", "cabang", "area", "region", "lastPosisi"]}
        isLoading={loading}
        searchPlaceholder="Cari nomor aplikasi, cabang, atau region..."
        initialSort={{ key: "noAplikasi", direction: "asc" }}
      />
    </TablePageLayout>
  );
}
