"use client";

import { useState } from "react";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const ItHelpDeskTaskPage = () => {
  const [nomorAplikasi, setNomorAplikasi] = useState("");
  const [tipePencarian, setTipePencarian] = useState("reset");
  const [appliedType, setAppliedType] = useState("reset");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [previousStage, setPreviousStage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canUseTaskForm, setCanUseTaskForm] = useState(false);
  const [oneUpHistory, setOneUpHistory] = useState([]);
  const [resetMemo, setResetMemo] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const {
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    confirm: confirmDialog,
  } = useNotification();

  const memoRequirementMessages = {
    back: "Flow code aplikasi harus dalam status LIVE untuk menggunakan Back to Stage Review.",
    cancel: "Flow code aplikasi harus dalam status -REJECTED untuk menggunakan Cancel Request.",
    hold: "Flow code aplikasi harus dalam status _HOLD untuk menggunakan Buka Hold.",
  };

  const memoInfoLabelMap = {
    back: "Stage Sebelumnya",
    cancel: "Flow Code Tujuan",
    hold: "Flow Code Tujuan",
  };

  const memoButtonClassMap = {
    back: "bg-green-500 hover:bg-green-600 disabled:bg-green-300",
    cancel: "bg-red-500 hover:bg-red-600 disabled:bg-red-300",
    hold: "bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300",
  };

  const handleSearch = async () => {
    const trimmedNoApl = nomorAplikasi.trim();
    if (!trimmedNoApl) {
      notifyWarning("Masukkan nomor aplikasi terlebih dahulu");
      return;
    }

    const normalizedType = (tipePencarian || "").toLowerCase();

    setLoading(true);
    setError("");
    setHasSearched(true);
    setCanUseTaskForm(false);
    setOneUpHistory([]);
    setResetMemo("");
    setMemoText("");

    try {
      const params = new URLSearchParams({ no_apl: trimmedNoApl });
      if (tipePencarian) {
        params.set("type", tipePencarian);
      }

      const response = await fetch(`/api/it-helpdesk-task?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const payload = await response.json();
      const rows = Array.isArray(payload.data) ? payload.data : [];
      const limitedRows = rows.length > 0 ? rows.slice(0, 1) : [];
      const historyRows = Array.isArray(payload.history) ? payload.history : [];

      let memoAllowed = false;
      if (normalizedType === "back") {
        if (limitedRows.length > 0) {
          const firstRow = limitedRows[0] ?? {};
          const rawFlowCode =
            firstRow?.FLOW_CODE ??
            firstRow?.Last_Posisi ??
            firstRow?.LAST_POSISI ??
            "";
          const flowCodeValue = rawFlowCode.toString().toLowerCase();
          memoAllowed = flowCodeValue.includes("live");
        }
      } else if (normalizedType === "cancel") {
        if (limitedRows.length > 0) {
          const firstRow = limitedRows[0] ?? {};
          const rawFlowCode =
            firstRow?.FLOW_CODE ??
            firstRow?.Last_Posisi ??
            firstRow?.LAST_POSISI ??
            "";
          const flowCodeValue = rawFlowCode.toString().toLowerCase();
          memoAllowed =
            flowCodeValue.endsWith("-rejected") ||
            flowCodeValue.endsWith("_rejected");
        }
      } else if (normalizedType === "hold") {
        if (limitedRows.length > 0) {
          const firstRow = limitedRows[0] ?? {};
          const rawFlowCode =
            firstRow?.FLOW_CODE ??
            firstRow?.Last_Posisi ??
            firstRow?.LAST_POSISI ??
            "";
          const flowCodeValue = rawFlowCode.toString().toLowerCase();
          memoAllowed =
            flowCodeValue.endsWith("_hold") || flowCodeValue.endsWith("-hold");
        }
      }

      setData(limitedRows);
      setPreviousStage(payload.previousStage ?? "");
      setAppliedType(normalizedType);
      setCanUseTaskForm(memoAllowed);
      setOneUpHistory(normalizedType === "reset" ? historyRows : []);
    } catch (err) {
      console.error("Error search it helpdesk task:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setData([]);
      setPreviousStage("");
      setAppliedType(normalizedType);
      setCanUseTaskForm(false);
      setOneUpHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMemo = async (event) => {
    event.preventDefault();
    const trimmedMemo = memoText.trim();
    if (!trimmedMemo) {
      notifyWarning("Memo wajib diisi");
      return;
    }
    const trimmedNoApl = nomorAplikasi.trim();
    if (!trimmedNoApl) {
      notifyWarning("Nomor aplikasi wajib diisi");
      return;
    }

    const normalizedType = (appliedType || "").toLowerCase();
    if (!["back", "cancel", "hold"].includes(normalizedType) || !canUseTaskForm) {
      notifyWarning(
        "Pengubahan flow code hanya tersedia untuk Back to Stage Review, Cancel Request, atau Buka Hold"
      );
      return;
    }

    if (normalizedType === "back" && !previousStage) {
      notifyWarning("Stage sebelumnya tidak ditemukan");
      return;
    }

    if (["cancel", "hold"].includes(normalizedType) && !previousStage) {
      notifyWarning("Flow code tujuan tidak ditemukan");
      return;
    }

    const actionLabels = {
      back: "Back to Stage Review",
      cancel: "Cancel Request",
      hold: "Buka Hold",
    };
    const actionLabel = actionLabels[normalizedType] ?? "Aksi";
    const stageLabel = previousStage || "-";
    const confirmationMessage =
      ["cancel", "hold"].includes(normalizedType)
        ? `Flow code aplikasi ${trimmedNoApl} akan diubah menjadi "${stageLabel}" melalui ${actionLabel}. Lanjutkan?`
        : `Flow code aplikasi ${trimmedNoApl} akan diubah ke stage "${stageLabel}" melalui ${actionLabel}. Lanjutkan?`;
    const confirmed = await confirmDialog({
      title: "Konfirmasi Perubahan Flow Code",
      message: confirmationMessage,
      confirmText: "Ya, proses",
      cancelText: "Batalkan",
      variant: ["cancel", "hold"].includes(normalizedType) ? "danger" : "info",
    });
    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/it-helpdesk-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          no_apl: trimmedNoApl,
          memo: trimmedMemo,
          type: normalizedType,
        }),
      });

      const payload = await response
        .json()
        .catch(() => ({ message: "" }));

      if (!response.ok) {
        throw new Error(payload?.error || "Gagal memperbarui flow code");
      }

      notifySuccess(payload?.message || "Flow code berhasil diperbarui");
      setMemoText("");
      await handleSearch();
    } catch (err) {
      console.error("Error submit memo:", err);
      notifyError(err.message || "Terjadi kesalahan saat mengirim memo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReset = async (event) => {
    event.preventDefault();
    const trimmedMemo = resetMemo.trim();
    if (!trimmedMemo) {
      notifyWarning("Memo wajib diisi");
      return;
    }

    const trimmedNoApl = nomorAplikasi.trim();
    if (!trimmedNoApl) {
      notifyWarning("Nomor aplikasi wajib diisi");
      return;
    }

    const confirmed = await confirmDialog({
      title: "Konfirmasi Reset One Up Level",
      message: `Reset One Up Level untuk aplikasi ${trimmedNoApl} akan diproses. Lanjutkan?`,
      confirmText: "Ya, proses",
      cancelText: "Batalkan",
      variant: "danger",
    });
    if (!confirmed) {
      return;
    }

    try {
      setResetSubmitting(true);
      const response = await fetch("/api/it-helpdesk-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          no_apl: trimmedNoApl,
          memo: trimmedMemo,
          type: "reset",
        }),
      });

      const payload = await response
        .json()
        .catch(() => ({ message: "" }));

      if (!response.ok) {
        throw new Error(payload?.error || "Gagal mengirim permintaan reset");
      }

      notifySuccess(payload?.message || "Reset One Up Level berhasil diproses");
      setResetMemo("");
      await handleSearch();
    } catch (err) {
      console.error("Error submit reset memo:", err);
      notifyError(err.message || "Terjadi kesalahan saat mengirim permintaan reset");
    } finally {
      setResetSubmitting(false);
    }
  };

  const renderTable = () => {
    if (loading) {
      return <div className="mt-4 text-sm text-slate-600">Memuat data...</div>;
    }

    if (error) {
      return <div className="mt-4 text-sm text-red-600">{error}</div>;
    }

    if (!data || data.length === 0) {
      return <div className="mt-4 text-sm text-slate-600">Data tidak ditemukan.</div>;
    }

    const normalizedType = (appliedType || "").toLowerCase();

    if (!normalizedType || normalizedType === "reset") {
      return (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full table-auto border border-slate-200 text-sm">
            <caption className="caption-top px-4 py-2 text-left text-base font-semibold text-slate-700">
              DETAIL WISE TBL APLIKASI (CURRENT POSITION)
            </caption>
            <thead className="bg-slate-100">
              <tr>
                <th className="border px-4 py-2 text-left">No. Aplikasi</th>
                <th className="border px-4 py-2 text-left">Flow Code</th>
                <th className="border px-4 py-2 text-left">Create Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{row.NO_APLIKASI ?? "-"}</td>
                  <td className="border px-4 py-2">{row.FLOW_CODE ?? "-"}</td>
                  <td className="border px-4 py-2">{row.CREATE_DATE ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full table-auto border border-slate-200 text-sm">
          <caption className="caption-top px-4 py-2 text-left text-base font-semibold text-slate-700">
            DETAIL WISE TBL APLIKASI (CURRENT POSITION)
          </caption>
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-4 py-2 text-left">Tanggal</th>
              <th className="border px-4 py-2 text-left">No. Aplikasi</th>
              <th className="border px-4 py-2 text-left">Nama Nasabah</th>
              <th className="border px-4 py-2 text-left">Jenis Produk</th>
              <th className="border px-4 py-2 text-left">Last Posisi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{row.CREATE_DATE ?? "-"}</td>
                <td className="border px-4 py-2">{row.NO_APLIKASI ?? "-"}</td>
                <td className="border px-4 py-2">{row.NAMA_NASABAH ?? "-"}</td>
                <td className="border px-4 py-2">{row.JENIS_PRODUK ?? "-"}</td>
                <td className="border px-4 py-2">{row.LAST_POSISI ?? row.FLOW_CODE ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const normalizedAppliedType = (appliedType || "").toLowerCase();
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";
  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 md:w-56";

  return (
    <TablePageLayout
      title="Cari Data IT Helpdesk Task"
      description="Pantau dan kelola task IT Helpdesk untuk nomor aplikasi WISE."
      actions={
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-end md:gap-4">
          <div className="flex w-full flex-col gap-1 md:max-w-md">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">No Aplikasi</label>
            <input
              type="text"
              className={inputClass}
              value={nomorAplikasi}
              onChange={(event) => setNomorAplikasi(event.target.value)}
              placeholder="Masukkan Nomor Aplikasi"
            />
          </div>
          <div className="flex w-full flex-col gap-1 md:w-56">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Task</label>
            <select
              className={selectClass}
              value={tipePencarian}
              onChange={(event) => setTipePencarian(event.target.value)}
            >
              <option value="reset">Reset One Up Level (WISE)</option>
              <option value="otor">Otor Live (WISE)</option>
              <option value="hold">Buka Hold (WISE)</option>
              <option value="back">Back to Stage Review (WISE)</option>
              <option value="cancel">Cancel Request (WISE)</option>
            </select>
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Mencari..." : "Search"}
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!hasSearched && (
          <p className="text-sm text-slate-600">Masukkan nomor aplikasi dan pilih task untuk mulai mencari.</p>
        )}

        {hasSearched && (
          <>
            {renderTable()}

            {(appliedType || "").toLowerCase() === "reset" &&
              oneUpHistory.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full table-auto border border-slate-200 text-sm">
                    <caption className="caption-top px-4 py-2 text-left text-base font-semibold text-slate-700">
                      History One Up Level
                    </caption>
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">Tgl Input</th>
                        <th className="border px-4 py-2 text-left">No. Aplikasi</th>
                        <th className="border px-4 py-2 text-left">Branch Code</th>
                        <th className="border px-4 py-2 text-left">Flow Code</th>
                        <th className="border px-4 py-2 text-left">Create By</th>
                        <th className="border px-4 py-2 text-left">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oneUpHistory.map((row, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">{row.CREATE_DATE ?? "-"}</td>
                          <td className="border px-4 py-2">{row.NO_APLIKASI ?? "-"}</td>
                          <td className="border px-4 py-2">{row.BRANCH_CODE ?? "-"}</td>
                          <td className="border px-4 py-2">{row.FLOW_CODE ?? "-"}</td>
                          <td className="border px-4 py-2">{row.CREATE_BY ?? "-"}</td>
                          <td className="border px-4 py-2">{row.USER_ID ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            {(appliedType || "").toLowerCase() === "reset" &&
              data.length > 0 &&
              oneUpHistory.length > 0 && (
                <form onSubmit={handleSubmitReset} className="mt-6 space-y-2">
                  <h3 className="text-base font-semibold text-slate-800">Reset One Up Level</h3>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="reset-memo">
                    Memo
                  </label>
                  <textarea
                    id="reset-memo"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    rows={4}
                    value={resetMemo}
                    onChange={(event) => setResetMemo(event.target.value)}
                    required
                    placeholder="Tulis memo untuk reset one up level"
                  />
                  <Button
                    type="submit"
                    disabled={resetSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {resetSubmitting ? "Memproses..." : "Submit"}
                  </Button>
                </form>
              )}

            {["back", "cancel", "hold"].includes(normalizedAppliedType) &&
              data.length > 0 && (
                <div className="mt-6">
                  {!canUseTaskForm ? (
                    <p className="text-sm text-red-600">
                      {memoRequirementMessages[normalizedAppliedType] ??
                        "Flow code aplikasi belum memenuhi syarat untuk melakukan aksi ini."}
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitMemo} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Memo</label>
                      <p className="text-xs text-slate-500">
                        {(memoInfoLabelMap[normalizedAppliedType] ?? "Stage Sebelumnya") +
                          ` : ${previousStage || "-"}`}
                      </p>
                      <textarea
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        rows={4}
                        value={memoText}
                        onChange={(event) => setMemoText(event.target.value)}
                        required
                        placeholder="Tulis memo di sini"
                      />
                      <Button
                        type="submit"
                        disabled={submitting}
                        className={`text-white ${
                          memoButtonClassMap[normalizedAppliedType] ??
                          "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
                        }`}
                      >
                        {submitting ? "Memproses..." : "Submit"}
                      </Button>
                    </form>
                  )}
                </div>
              )}
          </>
        )}
      </div>
    </TablePageLayout>
  );
};

export default ItHelpDeskTaskPage;
