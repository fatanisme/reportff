import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import {
    fetchExcelDetail,

} from './getData';

import {
    createExportExcel,
    createSummaryExcelFile
} from '../utils/exportExcel'

export default function ButtonExport({ startDate, endDate, region, area }) {
    const [dataDetail, setDataDetail] = useState([]);


    const params = { startDate, endDate, region, area };

    const getDetail = async () => {
        const res = await fetchExcelDetail(params);
        setDataDetail(res || []);
    }

    const handleButtonClick = () => {

        getDetail()

        if (dataDetail.length === 0) {
            alert("Data Excel export Detail Wise tidak ada / kosong !");
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

        const headers = ["TGL INPUT", "NO APLIKASI", "NAMA NASABAH", "JENIS PRODUK", "KODE PROGRAM",
            "PLAFOND", "CABANG", "AREA", "REGION", "LAST POSISI", "LAST READ BY", "LAST UPDATE",
            "JUMLAH RETURN", "BRANCH DDE"
        ];

        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('id-ID', options);

        createExportExcel(
            formattedDataDetail,
            headers,
            'Detail Data',
            `${startDate}_${endDate}_PENDING_PROGRESS_DETAIL_WISE.xlsx`,
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
