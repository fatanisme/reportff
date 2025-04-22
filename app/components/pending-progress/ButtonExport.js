import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import {
    fetchExcelDetail,
    fetchExcelProgress,
    fetchExcelPending
} from './getData';

import {
    createExportExcel,
    createSummaryExcelFile
} from '../utils/exportExcel'

export default function ButtonExport({ startDate, endDate, region, area }) {
    const [dataDetail, setDataDetail] = useState([]);
    const [dataProgress, setDataProgress] = useState([]);
    const [dataPending, setDataPending] = useState([]);

    const params = { startDate, endDate, region, area };

    const getDetail = async () => {
        const res = await fetchExcelDetail(params);
        setDataDetail(res || []);
    }

    const geProgress = async () => {
        const res = await fetchExcelProgress(params);
        setDataProgress(res || []);
    }

    const getPending = async () => {
        const res = await fetchExcelPending(params);
        setDataPending(res || []);
    }

    const handleButtonClick = () => {

        getDetail()
        geProgress()
        getPending()

        if (dataDetail.length === 0) {
            alert("Data Excel export Detail Wise tidak ada / kosong !");
            return;
        }
        if (dataProgress.length === 0) {
            alert("Data Excel export Inprogress Wise tidak ada / kosong !");
            return;
        }
        if (dataPending.length === 0) {
            alert("Data Excel export Pending Wise tidak ada / kosong !");
            return;
        }

        const formattedDataDetail = dataDetail.map((item) => {
            const newItem = {
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
            };

            return newItem;
        });

        const formattedDataProgress = dataProgress.map((item, index) => {
            const newItem = {
                "NO": index + 1,
                "REGION": item.REGION || "",
                "NAMA AREA": `${item.NAMA_AREA}` || "",
                "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
                "IDE": item.IDE || 0,
                "DEDUPE": item.DEDUPE || 0,
                "IDEB": item.IDEB || 0,
                "UPLOAD DOC": item.UPLOAD_DOC || 0,
                "DDE": item.DDE || 0,
                "VERIN": item.VERIN || 0,
                "OTOR VERIN": item.OTOR_VERIN || 0,
                "VALID": item.VALID || 0,
                "APPROVAL": item.APPROVAL || 0,
                "SP3": item.SP3 || 0,
                "AKAD": item.AKAD || 0,
                "OTOR AKAD": item.OTOR_AKAD || 0,
                "REVIEW": item.REVIEW || 0,
                "OTOR REVIEW": item.OTOR_REVIEW || 0,
                "LIVE": item.LIVE || 0,
                "CANCEL": item.CANCEL || 0,
                "REJECT": item.REJECT || 0
            };

            return newItem;
        });
        formattedDataProgress.push({
            "NO": "Total",
            "REGION": "",
            "NAMA AREA": "",
            "TOTAL APLIKASI": dataProgress[0].SUM_TOTAL || 0,
            "IDE": dataProgress[0].SUM_IDE || 0,
            "DEDUPE": dataProgress[0].SUM_DEDUPE || 0,
            "IDEB": dataProgress[0].SUM_DEDUPE || 0,
            "UPLOAD DOC": dataProgress[0].SUM_UPLOAD || 0,
            "DDE": dataProgress[0].SUM_DDE || 0,
            "VERIN": dataProgress[0].SUM_VERIN || 0,
            "OTOR VERIN": dataProgress[0].SUM_OTOR_VERIN || 0,
            "VALID": dataProgress[0].SUM_VALID || 0,
            "APPROVAL": dataProgress[0].SUM_APPROVAL || 0,
            "SP3": dataProgress[0].SUM_SP3 || 0,
            "AKAD": dataProgress[0].SUM_AKAD || 0,
            "OTOR AKAD": dataProgress[0].SUM_OTOR_AKAD || 0,
            "REVIEW": dataProgress[0].SUM_REVIEW || 0,
            "OTOR REVIEW": dataProgress[0].SUM_OTOR_REVIEW || 0,
            "LIVE": dataProgress[0].SUM_LIVE || 0,
            "CANCEL": dataProgress[0].SUM_CANCEL || 0,
            "REJECT": dataProgress[0].SUM_REJECT || 0
        })

        const formattedDataPending = dataPending.map((item, index) => {
            const newItem = {
                "NO": index + 1,
                "REGION": item.REGION || "",
                "NAMA AREA": `${item.NAMA_AREA}` || "",
                "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
                "IDE": item.IDE || 0,
                "DEDUPE": item.DEDUPE || 0,
                "IDEB": item.IDEB || 0,
                "UPLOAD DOC": item.UPLOAD_DOC || 0,
                "DDE": item.DDE || 0,
                "VERIN": item.VERIN || 0,
                "OTOR VERIN": item.OTOR_VERIN || 0,
                "VALID": item.VALID || 0,
                "APPROVAL": item.APPROVAL || 0,
                "SP3": item.SP3 || 0,
                "AKAD": item.AKAD || 0,
                "OTOR AKAD": item.OTOR_AKAD || 0,
                "REVIEW": item.REVIEW || 0,
                "OTOR REVIEW": item.OTOR_REVIEW || 0,
                "LIVE": item.LIVE || 0,
                "CANCEL": item.CANCEL || 0,
                "REJECT": item.REJECT || 0
            };

            return newItem;
        });
        formattedDataPending.push({
            "NO": "Total",
            "REGION": "",
            "NAMA AREA": "",
            "TOTAL APLIKASI": dataPending[0].SUM_TOTAL || 0,
            "IDE": dataPending[0].SUM_IDE || 0,
            "DEDUPE": dataPending[0].SUM_DEDUPE || 0,
            "IDEB": dataPending[0].SUM_DEDUPE || 0,
            "UPLOAD DOC": dataPending[0].SUM_UPLOAD || 0,
            "DDE": dataPending[0].SUM_DDE || 0,
            "VERIN": dataPending[0].SUM_VERIN || 0,
            "OTOR VERIN": dataPending[0].SUM_OTOR_VERIN || 0,
            "VALID": dataPending[0].SUM_VALID || 0,
            "APPROVAL": dataPending[0].SUM_APPROVAL || 0,
            "SP3": dataPending[0].SUM_SP3 || 0,
            "AKAD": dataPending[0].SUM_AKAD || 0,
            "OTOR AKAD": dataPending[0].SUM_OTOR_AKAD || 0,
            "REVIEW": dataPending[0].SUM_REVIEW || 0,
            "OTOR REVIEW": dataPending[0].SUM_OTOR_REVIEW || 0,
            "LIVE": dataPending[0].SUM_LIVE || 0,
            "CANCEL": dataPending[0].SUM_CANCEL || 0,
            "REJECT": dataPending[0].SUM_REJECT || 0
        })

        const headers = ["TGL INPUT", "NO APLIKASI", "NAMA NASABAH", "JENIS PRODUK", "KODE PROGRAM",
            "PLAFOND", "CABANG", "AREA", "REGION", "LAST POSISI", "LAST READ BY", "LAST UPDATE",
            "JUMLAH RETURN", "BRANCH DDE"
        ];
        const headers1 = ["No", "Region", "Nama Area", "Total Aplikasi", "IDE", "Dedupe", "iDEB", "Upload Doc",
            "DDE", "Verin", "Otor Verin", "Valid", "Approval", "SP3", "Akad", "Otor Akad", "Review",
            "Otor Review", "Live", "Cancel", "Reject"
        ]

        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('id-ID', options);

        createExportExcel(
            formattedDataDetail,
            headers,
            'Detail Data',
            `${startDate}_${endDate}_PENDING_PROGRESS_DETAIL_WISE.xlsx`,
        )
        createSummaryExcelFile(
            formattedDataProgress,
            headers1,
            `${formattedDate} DATA IN PROGRESS SUMARY WISE`,
            'In Progress Summary',
            `${formattedDate}_INPROGRESS_SUMMARY_WISE.xlsx`
        )
        createSummaryExcelFile(
            formattedDataPending,
            headers1,
            `${formattedDate} DATA PENDING SUMARY WISE`,
            'Pending Summary',
            `${formattedDate}_PENDING_SUMMARY_WISE.xlsx`
        )
    }

    return (
        <Button
            className="bg-green-500 text-white px-2 text-sm py-[10px] rounded hover:bg-green-600 w-1/2"
            onClick={handleButtonClick}
        >
            Download Data WISE
        </Button>
    );
}
