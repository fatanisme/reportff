"use client";

import React from 'react';
import Button from '../ui/Button';
import {
    fetchData,
} from './getData';

import {
    createExportExcel,
} from '../utils/exportExcel'
import { useNotification } from '@/app/components/ui/NotificationProvider';

export default function ButtonExport({ no_apl, type }) {

    const params = { no_apl };
    const { warning: notifyWarning, error: notifyError, success: notifySuccess } = useNotification();

    const getDetail = async () => {
        const res = await fetchData(params);
        return res || []
    }

    const handleButtonClick = async () => {
        try {
            const res = await getDetail();
            if (!Array.isArray(res) || res.length === 0) {
                notifyWarning("Data export tidak tersedia");
                return;
            }

            const detailRows = Array.isArray(res[0]) ? res[0] : [];
            const memoRows = Array.isArray(res[1]) ? res[1] : [];

            if (type === 1) {
                if (detailRows.length === 0) {
                    notifyWarning("Data Excel export tidak ada atau kosong");
                    return;
                }
            }

            if (type === 2) {
                const firstMemo = memoRows[0]?.MEMO ?? "";
                if (!firstMemo) {
                    notifyWarning("Data Excel Memo export tidak ada atau kosong");
                    return;
                }
            }
    
            const formattedDataDetail = detailRows.map((item) => {
                const newItem = {
                    "TGL INPUT": item.TGL_INPUT || "",
                    "NO APLIKASI": item.NO_APLIKASI || "",
                    "NAMA NASABAH": item.NAMA_NASABAH || "",
                    "JENIS PRODUK": item.JENIS_PRODUK || "",
                    "KODE PROGRAM": item.EVENT || "",
                    "TIPE PRODUK": item.TIPE_PRODUK || "",
                    "PLAFOND": item.PLAFOND || "0",
                    "CABANG": item.NAMA_CABANG || "",
                    "AREA": item.NAMA_AREA || "",
                    "REGION": item.REGION || "",
                    "LAST POSISI": item.LAST_POSISI || "",
                    "LAST READ BY": item.LAST_READ_BY || "",
                    "FLOW CODE HIST": item.FLOW_CODE_HIST || "",
                    "LAST READ HIST": item.LAST_READ_HIST || "",
                    "LAST UPDATE": item.LAST_UPDATE || "",
                    "JUMLAH RETURN": item.JUM_RETURN || "0",
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
                    "TOTAL SLA LIVE": item.TOTAL_SLA_LIVE || ""
                };
    
                return newItem;
            });
    
            const headers = [
                'TGL INPUT', 'NO APLIKASI', 'NAMA NASABAH', 'JENIS PRODUK', "KODE PROGRAM", "TIPE PRODUK",'PLAFOND', 'CABANG',
                'AREA', 'REGION', 'LAST POSISI', 'LAST READ BY', 'FLOW CODE HIST', 'LAST READ HIST',
                'LAST UPDATE', 'JUMLAH RETURN', 'PIC IDE', 'IN IDE', 'OUT IDE', 'SLA IDE',
                'PIC DEDUPE', 'IN DEDUPE', 'OUT DEDUPE', 'SLA DEDUPE', 'PIC iDEB', 'IN iDEB',
                'OUT iDEB', 'SLA iDEB', 'PIC UPLOAD DOC', 'IN UPLOAD DOC', 'OUT UPLOAD DOC',
                'SLA UPLOAD DOC', 'BRANCH DDE', 'PIC DDE', 'IN DDE', 'OUT DDE', 'SLA DDE', 'PIC VERIN',
                'IN VERIN', 'OUT VERIN', 'SLA VERIN', 'PIC APPROVAL', 'IN APPROVAL', 'OUT APPROVAL',
                'SLA APPROVAL', 'PIC SP3', 'IN SP3', 'OUT SP3', 'SLA SP3', 'PIC AKAD', 'IN AKAD',
                'OUT AKAD', 'SLA AKAD', 'PIC REVIEW', 'IN REVIEW', 'OUT REVIEW', 'SLA REVIEW',
                'TOTAL SLA LIVE'
            ];

            const rawMemo = memoRows[0]?.MEMO ?? "";
            const rows = rawMemo ? rawMemo.split('###') : [];

            const parsedData = rows.map(row => row.split('|'));

            const formattedDataDetail2 = parsedData.map((item) => {
                const newItem = {
                    "Stage": item[2] || "",
                    "PIC": item[0] || "",
                    "Tanggal": item[3] || "",
                    "Isi Memo": item[4] || "",
                };
    
                return newItem;
            });
    
            const headers2 = [
                'Stage', 'PIC', 'Tanggal', 'Isi Memo'
            ];
    
            if(type == 1){
                createExportExcel(
                    formattedDataDetail,
                    headers,
                    `Detail WISE`,
                    `Detail WISE.xlsx`,
                )
            }else{
                createExportExcel(
                    formattedDataDetail2,
                    headers2,
                    `Detail Memo WISE NO APLIKASI`,
                    `Detail Memo WISE NO APLIKASI ${no_apl}.xlsx`,
                )
            }
            notifySuccess("Data berhasil diekspor");
        } catch (error) {
            console.error("Gagal mengekspor data inquiry aplikasi:", error);
            notifyError("Terjadi kesalahan saat mengekspor data");
        }

    }

    return (
        <Button
            className="bg-green-500 text-white px-2 text-sm py-[10px] rounded hover:bg-green-600 w-1/6 mt-3"
            onClick={handleButtonClick}
        >
            Download Data WISE
        </Button>
    );
}
