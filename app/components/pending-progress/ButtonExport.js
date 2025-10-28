"use client";

import React from "react";
import Button from "../ui/Button";
import {
  fetchExcelDetail,
  fetchExcelProgress,
  fetchExcelPending,
} from "./getData";

import {
  createExportExcel,
  createSummaryExcelFile,
} from "../utils/exportExcel";
import { useNotification } from "@/app/components/ui/NotificationProvider";

export default function ButtonExport({ startDate, endDate, region, area, disabled = false }) {
  const { warning: notifyWarning, error: notifyError, success: notifySuccess } = useNotification();
  const handleButtonClick = async () => {
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        region,
        area,
      };

      const detailRes = await fetchExcelDetail(params);
      const progressRes = await fetchExcelProgress({ region, area });
      const pendingRes = await fetchExcelPending({ region, area });

      if (!detailRes || detailRes.length === 0) {
        notifyWarning("Data Excel export Detail Wise tidak ada atau kosong");
        return;
      }
      if (!progressRes || progressRes.length === 0) {
        notifyWarning("Data Excel export Inprogress Wise tidak ada atau kosong");
        return;
      }
      if (!pendingRes || pendingRes.length === 0) {
        notifyWarning("Data Excel export Pending Wise tidak ada atau kosong");
        return;
      }

      const formattedDataDetail = detailRes.map((item) => {
        const newItem = {
          "TGL INPUT": item.TGL_INPUT || "",
          "NO APLIKASI": item.NO_APLIKASI || "",
          "NAMA NASABAH": item.NAMA_NASABAH || "",
          "JENIS PRODUK": item.JENIS_PRODUK || "",
          "KODE PROGRAM": item.EVENT || "",
          PLAFOND: item.PLAFOND || "",
          CABANG: item.NAMA_CABANG || "",
          AREA: item.NAMA_AREA || "",
          REGION: item.REGION || "",
          "LAST POSISI": item.LAST_POSISI || "",
          "LAST READ BY":
            item.LAST_READ_BY && item.LAST_READ_BY_NAME
              ? `${item.LAST_READ_BY} - ${item.LAST_READ_BY_NAME}`
              : item.LAST_READ_BY || item.LAST_READ_BY_NAME || "",
          "LAST UPDATE": item.LAST_UPDATE || "",
          "JUMLAH RETURN": item.JUM_RETURN || 0,
          "BRANCH DDE": item.BRANCH_DDE || "",
        };

        return newItem;
      });

      const formattedDataProgress = progressRes.map((item, index) => {
        const newItem = {
          NO: index + 1,
          REGION: item.REGION || "",
          "NAMA AREA": `${item.NAMA_AREA}` || "",
          "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
          IDE: item.IDE || 0,
          DEDUPE: item.DEDUPE || 0,
          IDEB: item.IDEB || 0,
          "UPLOAD DOC": item.UPLOAD_DOC || 0,
          DDE: item.DDE || 0,
          VERIN: item.VERIN || 0,
          "OTOR VERIN": item.OTOR_VERIN || 0,
          VALID: item.VALID || 0,
          APPROVAL: item.APPROVAL || 0,
          SP3: item.SP3 || 0,
          AKAD: item.AKAD || 0,
          "OTOR AKAD": item.OTOR_AKAD || 0,
          REVIEW: item.REVIEW || 0,
          "OTOR REVIEW": item.OTOR_REVIEW || 0,
          LIVE: item.LIVE || 0,
          CANCEL: item.CANCEL || 0,
          REJECT: item.REJECT || 0,
        };

        return newItem;
      });
      formattedDataProgress.push({
        NO: "Total",
        REGION: "",
        "NAMA AREA": "",
        "TOTAL APLIKASI": progressRes[0].SUM_TOTAL || 0,
        IDE: progressRes[0].SUM_IDE || 0,
        DEDUPE: progressRes[0].SUM_DEDUPE || 0,
        IDEB: progressRes[0].SUM_DEDUPE || 0,
        "UPLOAD DOC": progressRes[0].SUM_UPLOAD || 0,
        DDE: progressRes[0].SUM_DDE || 0,
        VERIN: progressRes[0].SUM_VERIN || 0,
        "OTOR VERIN": progressRes[0].SUM_OTOR_VERIN || 0,
        VALID: progressRes[0].SUM_VALID || 0,
        APPROVAL: progressRes[0].SUM_APPROVAL || 0,
        SP3: progressRes[0].SUM_SP3 || 0,
        AKAD: progressRes[0].SUM_AKAD || 0,
        "OTOR AKAD": progressRes[0].SUM_OTOR_AKAD || 0,
        REVIEW: progressRes[0].SUM_REVIEW || 0,
        "OTOR REVIEW": progressRes[0].SUM_OTOR_REVIEW || 0,
        LIVE: progressRes[0].SUM_LIVE || 0,
        CANCEL: progressRes[0].SUM_CANCEL || 0,
        REJECT: progressRes[0].SUM_REJECT || 0,
      });

      const formattedDataPending = pendingRes.map((item, index) => {
        const newItem = {
          NO: index + 1,
          REGION: item.REGION || "",
          "NAMA AREA": `${item.NAMA_AREA}` || "",
          "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
          IDE: item.IDE || 0,
          DEDUPE: item.DEDUPE || 0,
          IDEB: item.IDEB || 0,
          "UPLOAD DOC": item.UPLOAD_DOC || 0,
          DDE: item.DDE || 0,
          VERIN: item.VERIN || 0,
          "OTOR VERIN": item.OTOR_VERIN || 0,
          VALID: item.VALID || 0,
          APPROVAL: item.APPROVAL || 0,
          SP3: item.SP3 || 0,
          AKAD: item.AKAD || 0,
          "OTOR AKAD": item.OTOR_AKAD || 0,
          REVIEW: item.REVIEW || 0,
          "OTOR REVIEW": item.OTOR_REVIEW || 0,
          LIVE: item.LIVE || 0,
          CANCEL: item.CANCEL || 0,
          REJECT: item.REJECT || 0,
        };

        return newItem;
      });
      formattedDataPending.push({
        NO: "Total",
        REGION: "",
        "NAMA AREA": "",
        "TOTAL APLIKASI": pendingRes[0].SUM_TOTAL || 0,
        IDE: pendingRes[0].SUM_IDE || 0,
        DEDUPE: pendingRes[0].SUM_DEDUPE || 0,
        IDEB: pendingRes[0].SUM_DEDUPE || 0,
        "UPLOAD DOC": pendingRes[0].SUM_UPLOAD || 0,
        DDE: pendingRes[0].SUM_DDE || 0,
        VERIN: pendingRes[0].SUM_VERIN || 0,
        "OTOR VERIN": pendingRes[0].SUM_OTOR_VERIN || 0,
        VALID: pendingRes[0].SUM_VALID || 0,
        APPROVAL: pendingRes[0].SUM_APPROVAL || 0,
        SP3: pendingRes[0].SUM_SP3 || 0,
        AKAD: pendingRes[0].SUM_AKAD || 0,
        "OTOR AKAD": pendingRes[0].SUM_OTOR_AKAD || 0,
        REVIEW: pendingRes[0].SUM_REVIEW || 0,
        "OTOR REVIEW": pendingRes[0].SUM_OTOR_REVIEW || 0,
        LIVE: pendingRes[0].SUM_LIVE || 0,
        CANCEL: pendingRes[0].SUM_CANCEL || 0,
        REJECT: pendingRes[0].SUM_REJECT || 0,
      });

      const headers = [
        "TGL INPUT",
        "NO APLIKASI",
        "NAMA NASABAH",
        "JENIS PRODUK",
        "KODE PROGRAM",
        "PLAFOND",
        "CABANG",
        "AREA",
        "REGION",
        "LAST POSISI",
        "LAST READ BY",
        "LAST UPDATE",
        "JUMLAH RETURN",
        "BRANCH DDE",
      ];
      const headers1 = [
        "No",
        "Region",
        "Nama Area",
        "Total Aplikasi",
        "IDE",
        "Dedupe",
        "iDEB",
        "Upload Doc",
        "DDE",
        "Verin",
        "Otor Verin",
        "Valid",
        "Approval",
        "SP3",
        "Akad",
        "Otor Akad",
        "Review",
        "Otor Review",
        "Live",
        "Cancel",
        "Reject",
      ];

      const today = new Date();
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const formattedDate = today.toLocaleDateString("id-ID", options);

      const safeStartDate = startDate || "TANGGAL";
      const safeEndDate = endDate || "TANGGAL";
      const safeFileName = `${safeStartDate}_${safeEndDate}_PENDING_PROGRESS_DETAIL_WISE.xlsx`;
      const safeProgressFileName = `${formattedDate}_INPROGRESS_SUMMARY_WISE.xlsx`;
      const safePendingFileName = `${formattedDate}_PENDING_SUMMARY_WISE.xlsx`;

      createExportExcel(formattedDataDetail, headers, "Detail Data", safeFileName);
      createSummaryExcelFile(
        formattedDataProgress,
        headers1,
        `${formattedDate} DATA IN PROGRESS SUMARY WISE`,
        "In Progress Summary",
        safeProgressFileName
      );
      createSummaryExcelFile(
        formattedDataPending,
        headers1,
        `${formattedDate} DATA PENDING SUMARY WISE`,
        "Pending Summary",
        safePendingFileName
      );
      notifySuccess("Data pending berhasil diekspor");
    } catch (error) {
      console.error("Gagal mengekspor data pending:", error);
      notifyError("Terjadi kesalahan saat mengekspor data pending");
    }
  };

  return (
    <Button
      className="bg-green-500 text-white px-2 text-sm py-[10px] rounded hover:bg-green-600 w-1/2"
      onClick={handleButtonClick}
      disabled={disabled}
    >
      Download Data WISE
    </Button>
  );
}
