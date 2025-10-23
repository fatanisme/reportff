import React, { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import { fetchExcelData } from "./getData";
import { createExportExcel } from "../utils/exportExcel";

const headers = [
  "TGL INPUT",
  "NO APLIKASI",
  "NAMA NASABAH",
  "JENIS PRODUK",
  "PLAFOND",
  "CABANG",
  "AREA",
  "REGION",
  "LAST POSISI",
  "LAST READ BY",
  "FLOW CODE HIST",
  "LAST READ HIST",
  "LAST UPDATE",
  "JUMLAH RETURN",
  "PIC IDE",
  "IN IDE",
  "OUT IDE",
  "SLA IDE",
  "PIC DEDUPE",
  "IN DEDUPE",
  "OUT DEDUPE",
  "SLA DEDUPE",
  "PIC iDEB",
  "IN iDEB",
  "OUT iDEB",
  "SLA iDEB",
  "PIC UPLOAD DOC",
  "IN UPLOAD DOC",
  "OUT UPLOAD DOC",
  "SLA UPLOAD DOC",
  "BRANCH DDE",
  "PIC DDE",
  "IN DDE",
  "OUT DDE",
  "SLA DDE",
  "PIC VERIN",
  "IN VERIN",
  "OUT VERIN",
  "SLA VERIN",
  "PIC APPROVAL",
  "IN APPROVAL",
  "OUT APPROVAL",
  "SLA APPROVAL",
  "PIC SP3",
  "IN SP3",
  "OUT SP3",
  "SLA SP3",
  "PIC AKAD",
  "IN AKAD",
  "OUT AKAD",
  "SLA AKAD",
  "PIC REVIEW",
  "IN REVIEW",
  "OUT REVIEW",
  "SLA REVIEW",
  "TOTAL SLA LIVE",
];

const safeNumberText = (value) => (value ?? "").toString();
const withLeadingApostrophe = (value) => {
  if (!value) return "";
  const text = value.toString();
  return text.startsWith("'") ? text : `'${text}`;
};

const buildTimestampFileName = () => {
  const now = new Date();
  const pad = (val) => `${val}`.padStart(2, "0");
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}${month}${day}${hours}${minutes}${seconds}_DAILY_PROCEED_WISE.xlsx`;
};

export default function ButtonExport() {
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const showFeedback = (text, variant = "info") => {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    setFeedback({ text, variant });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const handleButtonClick = async () => {
    const { rows, meta } = await fetchExcelData();
    const data = Array.isArray(rows) ? rows : [];
    const exportDate = meta?.exportDate;

    if (data.length === 0) {
      const dateInfo = exportDate ? ` untuk tanggal ${exportDate}` : "";
      showFeedback(`Data Daily Proceed belum tersedia${dateInfo}.`, "warning");
      return;
    }

    const formattedDataDetail = data.map((item) => ({
      "TGL INPUT": item.TGL_INPUT || "",
      "NO APLIKASI": withLeadingApostrophe(item.NO_APLIKASI),
      "NAMA NASABAH": item.NAMA_NASABAH || "",
      "JENIS PRODUK": item.JENIS_PRODUK || "",
      "PLAFOND": safeNumberText(item.PLAFOND || 0),
      "CABANG": item.NAMA_CABANG || "",
      "AREA": item.NAMA_AREA || "",
      "REGION": item.REGION || "",
      "LAST POSISI": item.LAST_POSISI || "",
      "LAST READ BY": item.LAST_READ_BY || "",
      "FLOW CODE HIST": item.FLOW_CODE_HIST || "",
      "LAST READ HIST": item.LAST_READ_HIST || "",
      "LAST UPDATE": item.LAST_UPDATE || "",
      "JUMLAH RETURN": safeNumberText(item.JUM_RETURN || 0),
      "PIC IDE": item.PIC_IDE || "",
      "IN IDE": item.IN_IDE || "",
      "OUT IDE": item.OUT_IDE || "",
      "SLA IDE": item.SLA_IDE || "",
      "PIC DEDUPE": item.PIC_DEDUPE || "",
      "IN DEDUPE": item.IN_DEDUPE || "",
      "OUT DEDUPE": item.OUT_DEDUPE || "",
      "SLA DEDUPE": item.SLA_DEDUPE || "",
      "PIC iDEB": item.PIC_IDEB || "",
      "IN iDEB": item.IN_IDEB || "",
      "OUT iDEB": item.OUT_IDEB || "",
      "SLA iDEB": item.SLA_IDEB || "",
      "PIC UPLOAD DOC": item.PIC_UPLOAD || "",
      "IN UPLOAD DOC": item.IN_UPLOAD || "",
      "OUT UPLOAD DOC": item.OUT_UPLOAD || "",
      "SLA UPLOAD DOC": item.SLA_UPLOAD || "",
      "BRANCH DDE": item.BRANCH_DDE || "",
      "PIC DDE": item.PIC_DDE || "",
      "IN DDE": item.IN_DDE || "",
      "OUT DDE": item.OUT_DDE || "",
      "SLA DDE": item.SLA_DDE || "",
      "PIC VERIN": item.PIC_VERIN || "",
      "IN VERIN": item.IN_VERIN || "",
      "OUT VERIN": item.OUT_VERIN || "",
      "SLA VERIN": item.SLA_VERIN || "",
      "PIC APPROVAL": item.PIC_APPROVAL || "",
      "IN APPROVAL": item.IN_APPROVAL || "",
      "OUT APPROVAL": item.OUT_APPROVAL || "",
      "SLA APPROVAL": item.SLA_APPROVAL || "",
      "PIC SP3": item.PIC_SP3 || "",
      "IN SP3": item.IN_SP3 || "",
      "OUT SP3": item.OUT_SP3 || "",
      "SLA SP3": item.SLA_SP3 || "",
      "PIC AKAD": item.PIC_AKAD || "",
      "IN AKAD": item.IN_AKAD || "",
      "OUT AKAD": item.OUT_AKAD || "",
      "SLA AKAD": item.SLA_AKAD || "",
      "PIC REVIEW": item.PIC_REVIEW || "",
      "IN REVIEW": item.IN_REVIEW || "",
      "OUT REVIEW": item.OUT_REVIEW || "",
      "SLA REVIEW": item.SLA_REVIEW || "",
      "TOTAL SLA LIVE": item.TOTAL_SLA_LIVE || "",
    }));

    createExportExcel(
      formattedDataDetail,
      headers,
      "DATA SLA",
      buildTimestampFileName(),
    );

    const dateInfo = exportDate ? ` (tanggal data ${exportDate})` : "";
    showFeedback(`File DAILY_PROCEED_WISE berhasil dibuat${dateInfo}.`, "success");
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="bg-green-500 text-white px-2 text-sm py-[10px] rounded hover:bg-green-600 w-1/2"
        onClick={handleButtonClick}
      >
        Download Data WISE
      </Button>
      {feedback && (
        <div
          className={`w-full max-w-sm rounded-lg border px-3 py-2 text-sm shadow-sm transition-all ${
            feedback.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : feedback.variant === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
