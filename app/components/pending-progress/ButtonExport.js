import React, { useState,useEffect } from 'react';
import Button from '../ui/Button';
import {
    fetchExcelDetail,
    fetchExcelProgress,
    fetchExcelPending
} from './getData';

import {
    formatMainData,
    formatSummaryData
} from './formatExcel';

import {
    createExportExcel,
    createSummaryExcelFile
} from '../utils/exportExcel'

export default function ButtonExport({ startDate, endDate, region, area }) {
    const [dataDetail, setDataDetail] = useState([]);
    const [dataProgress, setDataProgress] = useState([]);
    const [dataPending, setDataPending] = useState([]);

    const handleButtonClick = () => {
        const params = { startDate, endDate, region, area };

        const detail = fetchExcelDetail(params);
        const progress = fetchExcelProgress(params);
        const pending = fetchExcelPending(params);

        setDataDetail(detail || []);
        setDataProgress(progress || []);
        setDataPending(pending || []);

        if (detail.length === 0) {
            alert("Data Excel export Detail Wise tidak ada / kosong !");
            return;
        }
        if (progress.length === 0) {
            alert("Data Excel export Inprogress Wise tidak ada / kosong !");
            return;
        }
        if (pending.length === 0) {
            alert("Data Excel export Pending Wise tidak ada / kosong !");
            return;
        }

        const formattedDataDetail = detail.map(formatMainData)

        const formattedDataProgress = progress.map(formatSummaryData)
        formattedDataProgress.push({
            "NO": "Total",
            "REGION": "",
            "NAMA AREA": "",
            "TOTAL APLIKASI": progress[0].SUM_TOTAL || 0,
            "IDE": progress[0].SUM_IDE || 0,
            "DEDUPE": progress[0].SUM_DEDUPE || 0,
            "IDEB": progress[0].SUM_DEDUPE || 0,
            "UPLOAD DOC": progress[0].SUM_UPLOAD || 0,
            "DDE": progress[0].SUM_DDE || 0,
            "VERIN": progress[0].SUM_VERIN || 0,
            "OTOR VERIN": progress[0].SUM_OTOR_VERIN || 0,
            "VALID": progress[0].SUM_VALID || 0,
            "APPROVAL": progress[0].SUM_APPROVAL || 0,
            "SP3": progress[0].SUM_SP3 || 0,
            "AKAD": progress[0].SUM_AKAD || 0,
            "OTOR AKAD": progress[0].SUM_OTOR_AKAD || 0,
            "REVIEW": progress[0].SUM_REVIEW || 0,
            "OTOR REVIEW": progress[0].SUM_OTOR_REVIEW || 0,
            "LIVE": progress[0].SUM_LIVE || 0,
            "CANCEL": progress[0].SUM_CANCEL || 0,
            "REJECT": progress[0].SUM_REJECT || 0
        })

        const formattedDataPending = pending.map(formatSummaryData)
        formattedDataPending.push({
            "NO": "Total",
            "REGION": "",
            "NAMA AREA": "",
            "TOTAL APLIKASI": pending[0].SUM_TOTAL || 0,
            "IDE": pending[0].SUM_IDE || 0,
            "DEDUPE": pending[0].SUM_DEDUPE || 0,
            "IDEB": pending[0].SUM_DEDUPE || 0,
            "UPLOAD DOC": pending[0].SUM_UPLOAD || 0,
            "DDE": pending[0].SUM_DDE || 0,
            "VERIN": pending[0].SUM_VERIN || 0,
            "OTOR VERIN": pending[0].SUM_OTOR_VERIN || 0,
            "VALID": pending[0].SUM_VALID || 0,
            "APPROVAL": pending[0].SUM_APPROVAL || 0,
            "SP3": pending[0].SUM_SP3 || 0,
            "AKAD": pending[0].SUM_AKAD || 0,
            "OTOR AKAD": pending[0].SUM_OTOR_AKAD || 0,
            "REVIEW": pending[0].SUM_REVIEW || 0,
            "OTOR REVIEW": pending[0].SUM_OTOR_REVIEW || 0,
            "LIVE": pending[0].SUM_LIVE || 0,
            "CANCEL": pending[0].SUM_CANCEL || 0,
            "REJECT": pending[0].SUM_REJECT || 0
        })

        const headers = ["TGL INPUT", "NO APLIKASI", "NAMA NASABAH", "JENIS PRODUK", "KODE PROGRAM",
            "PLAFOND", "CABANG", "AREA", "REGION", "LAST POSISI", "LAST READ BY", "LAST UPDATE",
            "JUMLAH RETURN", "BRANCH DDE"
        ];
        const headers1 = ["No","Region","Nama Area","Total Aplikasi","IDE","Dedupe","iDEB","Upload Doc",
            "DDE","Verin","Otor Verin","Valid","Approval","SP3","Akad","Otor Akad","Review",]

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
