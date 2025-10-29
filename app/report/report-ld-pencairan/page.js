"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "@/lib/axios";
import Button from "@/app/components/ui/Button";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import DateInput from "@/app/components/ui/DateInput";
import Modal from "@/app/components/ui/Modal";
import { useNotification } from "@/app/components/ui/NotificationProvider";
import { createExportExcel } from "@/app/components/utils/exportExcel";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "SUKSES", label: "Sukses" },
  { value: "GAGAL", label: "Gagal" },
];

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

const formatDateValue = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
};

const mapStatusClass = (status) => {
  const normalized = (status || "").toUpperCase();
  if (normalized === "SUKSES") {
    return "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700";
  }
  if (normalized === "GAGAL") {
    return "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700";
  }
  return "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700";
};

const buildExcelRows = (rows) =>
  rows.map((row) => ({
    "TANGGAL CAIR": row.tanggalCair,
    "NO APLIKASI": row.noAplikasi ? `'${row.noAplikasi}` : "-",
    "NAMA NASABAH": row.namaNasabah || "-",
    "BRANCH CODE": row.branchCode || "-",
    "BRANCH NAME": row.branchName || "-",
    PRODUK: row.produk || "-",
    STATUS: row.status || "-",
    "LD / KETERANGAN": row.keterangan || "-",
    "SEQUENCE CAIR": row.sequenceCair || "-",
  }));

const EXCEL_HEADERS = [
  "TANGGAL CAIR",
  "NO APLIKASI",
  "NAMA NASABAH",
  "BRANCH CODE",
  "BRANCH NAME",
  "PRODUK",
  "STATUS",
  "LD / KETERANGAN",
  "SEQUENCE CAIR",
];

const normalizeRow = (row) => ({
  id: row.ID ?? row.id,
  tanggalCair: row.TGL_CAIR ?? row.tanggalCair,
  noAplikasi: row.NO_APLIKASI ?? row.noAplikasi,
  namaNasabah: row.NAMA_NASABAH ?? row.namaNasabah,
  branchCode: row.BRANCH_CODE ?? row.branchCode,
  branchName: row.BRANCH_NAME ?? row.branchName,
  produk: row.PRODUK ?? row.produk,
  status: row.STATUS ?? row.status,
  keterangan: row.KET_PENCAIRAN ?? row.keterangan,
  sequenceCair: row.SEQ_CAIR ?? row.sequenceCair,
  createdAt: row.CREATED_AT ?? row.createdAt,
  updatedAt: row.UPDATED_AT ?? row.updatedAt,
});

const normalizeExportRow = (row) => ({
  tanggalCair: row.TGL_CAIR ?? row.tanggalCair,
  noAplikasi: row.NO_APLIKASI ?? row.noAplikasi,
  namaNasabah: row.NAMA_NASABAH ?? row.namaNasabah,
  branchCode: row.BRANCH_CODE ?? row.branchCode,
  branchName: row.BRANCH_NAME ?? row.branchName,
  produk: row.PRODUK ?? row.produk,
  status: row.STATUS ?? row.status,
  keterangan: row.KET_PENCAIRAN ?? row.keterangan,
  sequenceCair: row.SEQ_CAIR ?? row.sequenceCair,
});

export default function ReportLDPencairanPage() {
  const today = useMemo(() => formatDateValue(new Date()), []);
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    status: "ALL",
    search: "",
  });
  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 50,
    totalRows: 0,
    totalPages: 1,
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshingRowId, setRefreshingRowId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", note: "" });
  const [searchDraft, setSearchDraft] = useState("");
  const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotification();

  const fetchData = useCallback(
    async ({ page = pageState.page, pageSize = pageState.pageSize } = {}) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: filters.status,
          page: String(page),
          pageSize: String(pageSize),
        });
        if (filters.search) {
          params.set("search", filters.search);
        }
        const { data } = await axios.get(`/report-ld-pencairan?${params.toString()}`);
        const list = Array.isArray(data?.data) ? data.data.map(normalizeRow) : [];
        setRows(list);
        const pagination = data?.pagination ?? {};
        setPageState({
          page: pagination.page ?? page,
          pageSize: pagination.pageSize ?? pageSize,
          totalRows: pagination.total ?? list.length,
          totalPages: pagination.totalPages ?? 1,
        });
      } catch (error) {
        console.error("Gagal mengambil data LD pencairan:", error);
        notifyError("Gagal mengambil data LD pencairan");
        setRows([]);
        setPageState((prev) => ({ ...prev, totalRows: 0, totalPages: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [
      filters.startDate,
      filters.endDate,
      filters.status,
      filters.search,
      notifyError,
      pageState.page,
      pageState.pageSize,
    ]
  );

  useEffect(() => {
    fetchData({ page: 1, pageSize: pageState.pageSize });
  }, [filters.startDate, filters.endDate, filters.status, fetchData]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchDraft.trim(),
      }));
    }, 400);
    return () => clearTimeout(delay);
  }, [searchDraft]);

  useEffect(() => {
    fetchData({ page: 1, pageSize: pageState.pageSize });
  }, [filters.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (direction) => {
    const nextPage =
      direction === "next"
        ? Math.min(pageState.page + 1, pageState.totalPages)
        : Math.max(pageState.page - 1, 1);
    if (nextPage === pageState.page) return;
    fetchData({ page: nextPage, pageSize: pageState.pageSize });
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    fetchData({ page: 1, pageSize: newSize });
  };

  const handleDateChange = (key, value) => {
    if (!value) return;
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "startDate" && value > prev.endDate) {
        updated.endDate = value;
      }
      if (key === "endDate" && value < prev.startDate) {
        updated.startDate = value;
      }
      return updated;
    });
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const { data } = await axios.post("/report-ld-pencairan/get-wise");
      if (data?.success) {
        notifySuccess(data?.message ?? "Proses LD berhasil dijalankan");
        fetchData({ page: 1, pageSize: pageState.pageSize });
      } else {
        notifyError(data?.message ?? "Proses LD gagal dijalankan");
      }
    } catch (error) {
      console.error("Gagal menjalankan sinkronisasi LD:", error);
      notifyError("Gagal menjalankan proses LD pencairan");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDownload = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        export: "1",
      });
      if (filters.search) params.set("search", filters.search);
      const { data } = await axios.get(`/report-ld-pencairan?${params.toString()}`);
      const exportRows = Array.isArray(data?.data)
        ? data.data.map(normalizeExportRow)
        : [];
      if (exportRows.length === 0) {
        notifyWarning("Tidak ada data untuk diunduh");
        return;
      }
      const excelData = buildExcelRows(exportRows);
      createExportExcel(
        excelData,
        EXCEL_HEADERS,
        "LD Pencairan WISE",
        `${filters.startDate}_${filters.endDate}_LD_PENCAIRAN_WISE.xlsx`
      );
    } catch (error) {
      console.error("Gagal mengunduh data LD:", error);
      notifyError("Gagal mengunduh data LD pencairan");
    } finally {
      setExportLoading(false);
    }
  };

  const openEditModal = (row) => {
    setEditingRow(row);
    setEditForm({
      status: row.status || "",
      note: row.keterangan || "",
    });
  };

  const closeEditModal = () => {
    setEditingRow(null);
    setEditForm({ status: "", note: "" });
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (!editingRow?.id) return;
    if (!editForm.status) {
      notifyWarning("Status wajib diisi");
      return;
    }
    try {
      const { data } = await axios.patch(`/report-ld-pencairan/${editingRow.id}`, {
        status: editForm.status,
        note: editForm.note,
      });
      if (data?.success) {
        notifySuccess(data?.message ?? "Data berhasil diperbarui");
        closeEditModal();
        fetchData({ page: pageState.page, pageSize: pageState.pageSize });
      } else {
        notifyError(data?.message ?? "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Gagal mengedit data LD:", error);
      notifyError("Gagal memperbarui data LD pencairan");
    }
  };

  const handleRefreshRow = async (row) => {
    if (!row?.id || !row?.noAplikasi) {
      notifyWarning("Data LD tidak valid untuk diperbarui");
      return;
    }
    setRefreshingRowId(row.id);
    try {
      const { data } = await axios.post(
        `/report-ld-pencairan/${row.id}/refresh`,
        { noAplikasi: row.noAplikasi }
      );
      if (data?.success) {
        notifySuccess(data?.message ?? "Data nasabah berhasil diperbarui");
        fetchData({ page: pageState.page, pageSize: pageState.pageSize });
      } else {
        notifyError(data?.message ?? "Gagal memperbarui data nasabah");
      }
    } catch (error) {
      console.error("Gagal refresh data LD:", error);
      notifyError("Gagal memperbarui data nasabah dari WISE");
    } finally {
      setRefreshingRowId(null);
    }
  };

  const renderStatus = (status) => (
    <span className={mapStatusClass(status)}>{status || "-"}</span>
  );


  const fromRow = pageState.totalRows === 0
    ? 0
    : (pageState.page - 1) * pageState.pageSize + 1;
  const toRow = pageState.totalRows === 0
    ? 0
    : Math.min(fromRow + rows.length - 1, pageState.totalRows);

  return (
    <>
      <TablePageLayout
        title="Report LD Pencairan WISE"
        description="Daftar laporan LD pencairan, status, serta keterangan proses di sistem WISE."
        actions={
          <div className="flex w-full flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="flex w-full flex-col text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tanggal Mulai
                <DateInput
                  value={filters.startDate}
                  onChange={(value) => handleDateChange("startDate", value)}
                  max={filters.endDate}
                />
              </label>
              <label className="flex w-full flex-col text-xs font-semibold uppercase tracking-wide text-slate-600">
                Tanggal Selesai
                <DateInput
                  value={filters.endDate}
                  onChange={(value) => handleDateChange("endDate", value)}
                  min={filters.startDate}
                />
              </label>
              <label className="flex w-full flex-col text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  value={filters.status}
                  onChange={(event) => handleStatusChange(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex w-full flex-col text-xs font-semibold uppercase tracking-wide text-slate-600">
                Pencarian
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Cari no aplikasi, nasabah, cabang..."
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <Button onClick={() => fetchData({ page: 1, pageSize: pageState.pageSize })} disabled={loading}>
                  {loading ? "Memuat..." : "Muat Ulang"}
                </Button>
                <Button onClick={handleSync} disabled={syncLoading}>
                  {syncLoading ? "Memproses..." : "Get Hasil Pencairan"}
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={exportLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {exportLoading ? "Menyiapkan..." : "Download Data LD"}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Tampilkan</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  value={pageState.pageSize}
                  onChange={handlePageSizeChange}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} / halaman
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">No.</th>
                  <th className="px-4 py-3 text-left">Tanggal Cair</th>
                  <th className="px-4 py-3 text-left">No Aplikasi</th>
                  <th className="px-4 py-3 text-left">Nama Nasabah</th>
                  <th className="px-4 py-3 text-left">Branch</th>
                  <th className="px-4 py-3 text-left">Produk</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">LD / Ket Pencairan</th>
                  <th className="px-4 py-3 text-left">Sequence Cair</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rows.map((row, index) => (
                  <tr key={row.id ?? index} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {(pageState.page - 1) * pageState.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatDisplayDate(row.tanggalCair)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {row.noAplikasi || "-"}
                    </td>
                    <td className="px-4 py-3">{row.namaNasabah || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{row.branchCode || "-"}</span>
                        <span className="text-xs text-slate-500">{row.branchName || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.produk || "-"}</td>
                    <td className="px-4 py-3">{renderStatus(row.status)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.keterangan || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.sequenceCair || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => openEditModal(row)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-blue-400 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
                          onClick={() => handleRefreshRow(row)}
                          disabled={refreshingRowId === row.id}
                        >
                          {refreshingRowId === row.id ? "Memperbarui..." : "Refresh Data"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:flex md:items-center md:justify-between">
            <div className="mb-2 md:mb-0">
              Menampilkan {fromRow} - {toRow} dari {pageState.totalRows} data
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange("prev")}
                disabled={pageState.page <= 1 || loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => handlePageChange("next")}
                disabled={pageState.page >= pageState.totalPages || loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </TablePageLayout>

      <Modal
        isOpen={Boolean(editingRow)}
        onClose={closeEditModal}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Ubah Status LD</h3>
            <p className="text-sm text-slate-500">
              {editingRow?.noAplikasi ? `Nomor aplikasi: ${editingRow.noAplikasi}` : ""}
            </p>
          </div>
          <div className="grid gap-4">
            <label className="flex flex-col text-sm font-medium text-slate-700">
              Status
              <select
                className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <option value="">Pilih status</option>
                <option value="SUKSES">SUKSES</option>
                <option value="GAGAL">GAGAL</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-700">
              Keterangan LD
              <textarea
                className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                rows={4}
                value={editForm.note}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Tambahkan keterangan LD (opsional)"
              />
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              className="bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-300"
              onClick={closeEditModal}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
