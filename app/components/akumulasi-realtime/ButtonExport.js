"use client";

import React from 'react';
import Button from '../ui/Button';
import {
    fetchExcelExport,
    fetchChartData
} from './getData';

import {
    createExportExcel,
    createSummaryExcelFile
} from '../utils/exportExcel'
import { useNotification } from '@/app/components/ui/NotificationProvider';

export default function ButtonExport({ startDate, endDate, region, area }) {
    // const [dataExport, setDataExport] = useState([]);
    // const [dataChart, setDataChart] = useState([]);

    const params = { startDate, endDate };
    const { warning: notifyWarning, error: notifyError, success: notifySuccess } = useNotification();

    const getExport = async() => {
        try {
            const res = await fetchExcelExport(params);
            return res || [];
        } catch (error) {
            console.error("Error in getExport:", error);
            notifyError(error.message || "Terjadi kesalahan saat mengambil data export");
            return [];
        }
    }

    const getChart = async () => {
        const res = await fetchChartData();
        return res || [];
    }

    const handleButtonClick = async () => {
        try {
            const dataExport = await getExport();
            if (!Array.isArray(dataExport) || dataExport.length === 0) {
                notifyWarning("Data Excel export Detail Wise tidak ada atau kosong");
                return;
            }

            const dataChart = await getChart();
            if (!Array.isArray(dataChart) || dataChart.length === 0) {
                notifyWarning("Data Excel export Chart Wise tidak ada atau kosong");
                return;
            }

            const formattedDataExport = dataExport.map((item) => ({
                "TGL INPUT": item.TGL_INPUT || "",
                "NO APLIKASI": item.NO_APLIKASI || "",
                "NAMA NASABAH": item.NAMA_NASABAH || "",
                "JENIS PRODUK": item.JENIS_PRODUK || "",
                "KODE PROGRAM": item.EVENT || "",
                "PLAFOND": item.PLAFOND || "",
                "CABANG": item.NAMA_CABANG || "",
                "AREA": item.NAMA_AREA || "",
                "REGION": item.REGION || "",
                "LAST POSISI": item.LAST_POSISI || "",
                "LAST READ BY": item.LAST_READ_BY + " - " + item.LAST_READ_BY_NAME || "",
                "LAST UPDATE": item.LAST_UPDATE || "",
                "JUMLAH RETURN": item.JUM_RETURN || 0,
                "BRANCH DDE": item.BRANCH_DDE || "",
                "ALASAN CANCEL": item.ALASAN_CANCEL || "",
                "ALASAN REJECT": item.ALASAN_REJECT || "",
            }));

            const formattedDataChart = dataChart.map((item, index) => ({
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
                CAIR: item.LIVE || 0,
                CANCEL: item.CANCEL || 0,
                REJECT: item.REJECT || 0,
            }));

            formattedDataChart.push({
                NO: "Total",
                REGION: "",
                "NAMA AREA": "",
                "TOTAL APLIKASI": dataChart[0].SUM_TOTAL || 0,
                IDE: dataChart[0].SUM_IDE || 0,
                DEDUPE: dataChart[0].SUM_DEDUPE || 0,
                IDEB: dataChart[0].SUM_DEDUPE || 0,
                "UPLOAD DOC": dataChart[0].SUM_UPLOAD || 0,
                DDE: dataChart[0].SUM_DDE || 0,
                VERIN: dataChart[0].SUM_VERIN || 0,
                "OTOR VERIN": dataChart[0].SUM_OTOR_VERIN || 0,
                VALID: dataChart[0].SUM_VALID || 0,
                APPROVAL: dataChart[0].SUM_APPROVAL || 0,
                SP3: dataChart[0].SUM_SP3 || 0,
                AKAD: dataChart[0].SUM_AKAD || 0,
                "OTOR AKAD": dataChart[0].SUM_OTOR_AKAD || 0,
                REVIEW: dataChart[0].SUM_REVIEW || 0,
                "OTOR REVIEW": dataChart[0].SUM_OTOR_REVIEW || 0,
                CAIR: dataChart[0].SUM_LIVE || 0,
                CANCEL: dataChart[0].SUM_CANCEL || 0,
                REJECT: dataChart[0].SUM_REJECT || 0,
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
                "ALASAN CANCEL",
                "ALASAN REJECT",
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
                "Cair",
                "Cancel",
                "Reject",
            ];

            const safeStartDate = startDate || "ALL";
            const safeEndDate = endDate || "ALL";

            createExportExcel(
                formattedDataExport,
                headers,
                "REALTIME SLA WISE",
                `${safeStartDate}_${safeEndDate}_REALTIME_SLA_WISE.xlsx`
            );
            createSummaryExcelFile(
                formattedDataChart,
                headers1,
                "REALTIME_SUMMARY_WISE",
                "REALTIME SUMMARY",
                "REALTIME_SUMMARY_WISE.xlsx"
            );
            notifySuccess("Data realtime berhasil diekspor");
        } catch (error) {
            console.error("Gagal mengekspor data realtime:", error);
            notifyError("Terjadi kesalahan saat mengekspor data realtime");
        }
    };

    return (
        <Button
            className="bg-green-500 text-white px-2 text-sm py-[10px] rounded hover:bg-green-600 w-1/2"
            onClick={handleButtonClick}
        >
            Download Data WISE
        </Button>
    );
}
