"use client";

import React, { useEffect, useMemo, useState } from "react";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";
import ButtonExport from "../components/dedupe-aplikasi/ButtonExport";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const DedupeAplikasi = () => {
  const [nomorAplikasi, setNomorAplikasi] = useState("");
  const [data, setData] = useState([]);
  const [memo, setMemo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memoSort, setMemoSort] = useState({ key: "tanggal", direction: "desc" });
  const [platform, setPlatform] = useState("WISE");
  const [statusMessage, setStatusMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { warning, error: showError } = useNotification();

  const isBusy = useMemo(() => Boolean(loading), [loading]);

  const handleSearch = async () => {
    if (!nomorAplikasi.trim()) {
      warning("Nomor aplikasi belum diisi atau hanya berisi spasi");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setStatusMessage("");
    setData([]);
    setMemo([]);

    try {
      const response = await fetch(
        `/api/dedupe-aplikasi?no_apl=${encodeURIComponent(nomorAplikasi)}&platform=${encodeURIComponent(platform)}`
      );
      const result = await response.json();

      if (result.success) {
        const detailRows = Array.isArray(result.data?.[0]) ? result.data[0] : [];
        const memoRows = Array.isArray(result.data?.[1]) ? result.data[1] : [];

        setData(detailRows);
        setMemo(memoRows);
        setMemoSort({ key: "tanggal", direction: "desc" });

        if (detailRows.length === 0 && memoRows.length === 0) {
          setStatusMessage(result.message || `DATA ${platform} TIDAK DITEMUKAN`);
        } else {
          setStatusMessage("");
        }
      } else {
        console.error("Error fetching dedupe data:", result.message);
        showError(result.message || "Gagal mengambil data dedupe aplikasi");
        setData([]);
        setMemo([]);
        setMemoSort({ key: "tanggal", direction: "desc" });
        setStatusMessage(result.message || `DATA ${platform} TIDAK DITEMUKAN`);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      showError("Terjadi kesalahan saat mengambil data dedupe aplikasi");
      setData([]);
      setMemo([]);
      setMemoSort({ key: "tanggal", direction: "desc" });
      setStatusMessage("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!hasSearched) {
      return (
        <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Masukkan nomor aplikasi dan pilih platform untuk memulai pencarian.
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {statusMessage || `DATA ${platform} TIDAK DITEMUKAN`}
        </div>
      );
    }

    return (
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-slate-200 text-sm">
          <thead>
            <tr>
              <th className="border px-4 py-2">TGL INPUT</th>
              <th className="border px-4 py-2">NO APLIKASI</th>
              <th className="border px-4 py-2">NAMA NASABAH</th>
              <th className="border px-4 py-2">JENIS PRODUK</th>
              <th className="border px-4 py-2">KODE PROGRAM</th>
              <th className="border px-4 py-2">TIPE PRODUK</th>
              <th className="border px-4 py-2">PLAFOND</th>
              <th className="border px-4 py-2">CABANG</th>
              <th className="border px-4 py-2">AREA</th>
              <th className="border px-4 py-2">REGION</th>
              <th className="border px-4 py-2">LAST POSISI</th>
              <th className="border px-4 py-2">LAST READ BY</th>
              <th className="border px-4 py-2">LAST UPDATE</th>
              <th className="border px-4 py-2">JUMLAH RETURN</th>
              <th className="border px-4 py-2">PIC IDE</th>
              <th className="border px-4 py-2">IN IDE</th>
              <th className="border px-4 py-2">OUT IDE</th>
              <th className="border px-4 py-2">SLA IDE</th>
              <th className="border px-4 py-2">PIC DEDUPE</th>
              <th className="border px-4 py-2">IN DEDUPE</th>
              <th className="border px-4 py-2">OUT DEDUPE</th>
              <th className="border px-4 py-2">SLA DEDUPE</th>
              <th className="border px-4 py-2">PIC iDEB</th>
              <th className="border px-4 py-2">IN iDEB</th>
              <th className="border px-4 py-2">OUT iDEB</th>
              <th className="border px-4 py-2">SLA iDEB</th>
              <th className="border px-4 py-2">PIC UPLOAD DOC</th>
              <th className="border px-4 py-2">IN UPLOAD DOC</th>
              <th className="border px-4 py-2">OUT UPLOAD DOC</th>
              <th className="border px-4 py-2">SLA UPLOAD DOC</th>
              <th className="border px-4 py-2">BRANCH DDE</th>
              <th className="border px-4 py-2">PIC DDE</th>
              <th className="border px-4 py-2">IN DDE</th>
              <th className="border px-4 py-2">OUT DDE</th>
              <th className="border px-4 py-2">SLA DDE</th>
              <th className="border px-4 py-2">PIC VERIN</th>
              <th className="border px-4 py-2">IN VERIN</th>
              <th className="border px-4 py-2">OUT VERIN</th>
              <th className="border px-4 py-2">SLA VERIN</th>
              <th className="border px-4 py-2">PIC APPROVAL</th>
              <th className="border px-4 py-2">IN APPROVAL</th>
              <th className="border px-4 py-2">OUT APPROVAL</th>
              <th className="border px-4 py-2">SLA APPROVAL</th>
              <th className="border px-4 py-2">PIC SP3</th>
              <th className="border px-4 py-2">IN SP3</th>
              <th className="border px-4 py-2">OUT SP3</th>
              <th className="border px-4 py-2">SLA SP3</th>
              <th className="border px-4 py-2">PIC AKAD</th>
              <th className="border px-4 py-2">IN AKAD</th>
              <th className="border px-4 py-2">OUT AKAD</th>
              <th className="border px-4 py-2">SLA AKAD</th>
              <th className="border px-4 py-2">PIC REVIEW</th>
              <th className="border px-4 py-2">IN REVIEW</th>
              <th className="border px-4 py-2">OUT REVIEW</th>
              <th className="border px-4 py-2">SLA REVIEW</th>
              <th className="border px-4 py-2">
                <center>TOTAL SLA LIVE</center>
              </th>
              <th className="border px-4 py-2">ALASAN CANCEL</th>
              <th className="border px-4 py-2">ALASAN REJECT</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx + 1}>
                <td className="border px-4 py-2">{item.TGL_INPUT}</td>
                <td className="border px-4 py-2">{item.NO_APLIKASI}</td>
                <td className="border px-4 py-2">{item.NAMA_NASABAH}</td>
                <td className="border px-4 py-2">{item.JENIS_PRODUK}</td>
                <td className="border px-4 py-2">{item.EVENT}</td>
                <td className="border px-4 py-2">{item.TIPE_PRODUK}</td>
                <td className="border px-4 py-2">{item.PLAFOND}</td>
                <td className="border px-4 py-2">{item.NAMA_CABANG}</td>
                <td className="border px-4 py-2">{item.NAMA_AREA}</td>
                <td className="border px-4 py-2">{item.REGION}</td>
                <td className="border px-4 py-2">{item.LAST_POSISI}</td>
                <td className="border px-4 py-2">{item.LAST_READ_BY}</td>
                <td className="border px-4 py-2">{item.LAST_UPDATE}</td>
                <td className="border px-4 py-2">{item.JUM_RETURN}</td>
                <td className="border px-4 py-2">{item.PIC_IDE}</td>
                <td className="border px-4 py-2">{item.IN_IDE}</td>
                <td className="border px-4 py-2">{item.OUT_IDE}</td>
                <td className="border px-4 py-2">{item.SLA_IDE}</td>
                <td className="border px-4 py-2">{item.PIC_DEDUPE}</td>
                <td className="border px-4 py-2">{item.IN_DEDUPE}</td>
                <td className="border px-4 py-2">{item.OUT_DEDUPE}</td>
                <td className="border px-4 py-2">{item.SLA_DEDUPE}</td>
                <td className="border px-4 py-2">{item.PIC_IDEB}</td>
                <td className="border px-4 py-2">{item.IN_IDEB}</td>
                <td className="border px-4 py-2">{item.OUT_IDEB}</td>
                <td className="border px-4 py-2">{item.SLA_IDEB}</td>
                <td className="border px-4 py-2">{item.PIC_UPLOAD}</td>
                <td className="border px-4 py-2">{item.IN_UPLOAD}</td>
                <td className="border px-4 py-2">{item.OUT_UPLOAD}</td>
                <td className="border px-4 py-2">{item.SLA_UPLOAD}</td>
                <td className="border px-4 py-2">{item.PIC_DDE}</td>
                <td className="border px-4 py-2">{item.BRANCH_DDE}</td>
                <td className="border px-4 py-2">{item.IN_DDE}</td>
                <td className="border px-4 py-2">{item.OUT_DDE}</td>
                <td className="border px-4 py-2">{item.SLA_DDE}</td>
                <td className="border px-4 py-2">{item.PIC_VERIN}</td>
                <td className="border px-4 py-2">{item.IN_VERIN}</td>
                <td className="border px-4 py-2">{item.OUT_VERIN}</td>
                <td className="border px-4 py-2">{item.SLA_VERIN}</td>
                <td className="border px-4 py-2">{item.PIC_APPROVAL}</td>
                <td className="border px-4 py-2">{item.IN_APPROVAL}</td>
                <td className="border px-4 py-2">{item.OUT_APPROVAL}</td>
                <td className="border px-4 py-2">{item.SLA_APPROVAL}</td>
                <td className="border px-4 py-2">{item.PIC_SP3}</td>
                <td className="border px-4 py-2">{item.IN_SP3}</td>
                <td className="border px-4 py-2">{item.OUT_SP3}</td>
                <td className="border px-4 py-2">{item.SLA_SP3}</td>
                <td className="border px-4 py-2">{item.PIC_AKAD}</td>
                <td className="border px-4 py-2">{item.IN_AKAD}</td>
                <td className="border px-4 py-2">{item.OUT_AKAD}</td>
                <td className="border px-4 py-2">{item.SLA_AKAD}</td>
                <td className="border px-4 py-2">{item.PIC_REVIEW}</td>
                <td className="border px-4 py-2">{item.IN_REVIEW}</td>
                <td className="border px-4 py-2">{item.OUT_REVIEW}</td>
                <td className="border px-4 py-2">{item.SLA_REVIEW}</td>
                <td className="border px-4 py-2">{item.TOTAL_SLA_LIVE}</td>
                <td className="border px-4 py-2">{item.ALASAN_CANCEL}</td>
                <td className="border px-4 py-2">{item.ALASAN_REJECT}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const normalizedMemo = useMemo(() => {
    if (!Array.isArray(memo)) return [];
    return memo.map((item) => ({
      stageLabel:
        item?.stageLabel ||
        item?.STAGE_LABEL ||
        item?.stage ||
        item?.STAGE ||
        "",
      stageCode: item?.stageCode || item?.STAGE_CODE || item?.STAGE_RAW || "",
      picId: item?.picId || item?.PIC_ID || "",
      picName: item?.picName || item?.PIC_NAME || "",
      tanggalRaw: item?.tanggal || item?.TANGGAL || item?.TANGGAL_RAW || "",
      memoText: item?.memo || item?.MEMO || item?.MEMO_RAW || "",
    }));
  }, [memo]);

  const sortedMemo = useMemo(() => {
    const { key, direction } = memoSort;
    const factor = direction === "asc" ? 1 : -1;
    const clone = [...normalizedMemo];

    clone.sort((a, b) => {
      const getComparable = (item) => {
        switch (key) {
          case "stage":
            return (item.stageLabel || item.stageCode || "").toLowerCase();
          case "pic":
            return (item.picName || item.picId || "").toLowerCase();
          case "tanggal": {
            const value = item.tanggalRaw;
            const time = value ? Date.parse(value.replace(" ", "T")) : 0;
            return Number.isNaN(time) ? 0 : time;
          }
          case "memo":
            return (item.memoText || "").toLowerCase();
          default:
            return "";
        }
      };

      const valueA = getComparable(a);
      const valueB = getComparable(b);
      if (valueA === valueB) return 0;
      return valueA > valueB ? factor : -factor;
    });

    return clone;
  }, [normalizedMemo, memoSort]);

  const handleMemoSort = (key) => {
    setMemoSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  useEffect(() => {
    setData([]);
    setMemo([]);
    setHasSearched(false);
    setStatusMessage("");
    setMemoSort({ key: "tanggal", direction: "desc" });
  }, [platform]);

  const renderMemoSortIndicator = (key) => {
    if (memoSort.key !== key) return <span className="text-xs text-slate-400">⇅</span>;
    return (
      <span className="text-xs font-semibold text-blue-600">
        {memoSort.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const renderTableMemo = () => {
    if (sortedMemo.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-slate-200 text-sm">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">No</th>
              <th
                className="cursor-pointer border px-4 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => handleMemoSort("stage")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Stage</span>
                  {renderMemoSortIndicator("stage")}
                </div>
              </th>
              <th
                className="cursor-pointer border px-4 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => handleMemoSort("pic")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>PIC</span>
                  {renderMemoSortIndicator("pic")}
                </div>
              </th>
              <th
                className="cursor-pointer border px-4 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => handleMemoSort("tanggal")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Tanggal</span>
                  {renderMemoSortIndicator("tanggal")}
                </div>
              </th>
              <th
                className="cursor-pointer border px-4 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => handleMemoSort("memo")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>Isi Memo</span>
                  {renderMemoSortIndicator("memo")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMemo.map((row, index) => (
              <tr key={index}>
                <td className="border px-4 py-2 font-semibold text-slate-700">
                  {index + 1}
                </td>
                <td className="border px-4 py-2 text-slate-700">
                  {row.stageLabel || row.stageCode || "-"}
                </td>
                <td className="border px-4 py-2 text-slate-700">
                  {row.picName || row.picId || "-"}
                </td>
                <td className="border px-4 py-2 text-slate-700">
                  {row.tanggalRaw || "-"}
                </td>
                <td className="border px-4 py-2 text-slate-700">
                  {row.memoText || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

  return (
    <TablePageLayout
      title="Dedupe Aplikasi"
      description="Masukkan nomor aplikasi untuk melihat detail proses dedupe dan memo pending."
      actionsPlacement="bottom"
      actions={
        <div className="flex w-full flex-col gap-3 md:w-1/2 md:flex-row md:items-center md:gap-3">
          <select
            className={`${inputClass} w-full`}
            value={platform}
            onChange={(event) => setPlatform(event.target.value.toUpperCase())}
            aria-label="Pilih Platform"
          >
            <option value="WISE">WISE</option>
            <option value="FOS" disabled>
              FOS (Coming Soon)
            </option>
            <option value="FAS" disabled>
              FAS (Coming Soon)
            </option>
          </select>
          <input
            type="text"
            className={`${inputClass} w-full`}
            value={nomorAplikasi}
            onChange={(event) => setNomorAplikasi(event.target.value)}
            placeholder="Masukkan Nomor Aplikasi"
            aria-label="Masukkan Nomor Aplikasi"
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Mencari..." : "Cari"}
          </Button>
        </div>
      }
    >
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoadingOverlay show={isBusy} />
        {hasSearched && statusMessage && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {statusMessage}
          </div>
        )}

        <div
          className={
            isBusy ? "pointer-events-none select-none opacity-60 transition" : "transition"
          }
        >
          {platform === "WISE" && data.length !== 0 && (
            <div className="mb-4">
              <ButtonExport
                no_apl={nomorAplikasi}
                platform={platform}
                type="1"
              />
            </div>
          )}

          {loading ? <div>Loading...</div> : renderTable()}

          {platform === "WISE" && memo.length !== 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  MEMO (Pending)
                </h3>
                <ButtonExport
                  no_apl={nomorAplikasi}
                  platform={platform}
                  type="2"
                />
              </div>
              {renderTableMemo()}
            </div>
          )}

          {platform === "WISE" && memo.length === 0 && !statusMessage && (
            <div className="mt-6 text-sm text-slate-500">
              Tidak ada memo pending.
            </div>
          )}

          {platform !== "WISE" && hasSearched && (
            <div className="mt-6 text-sm text-slate-500">
              Pilih platform WISE untuk melihat detail lintas tahap.
            </div>
          )}
        </div>
      </div>
    </TablePageLayout>
  );
};

export default DedupeAplikasi;
