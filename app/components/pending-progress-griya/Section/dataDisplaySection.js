import React, { useState, useEffect } from 'react';
import Chart from '../../ui/Chart';
import LoadingOverlay from '../../ui/LoadingOverlay';
import { fetchCair } from '../getData';

export default function DataDisplaySection({ dataChart, region, area, isLoading }) {
    const [cairs, setCairs] = useState([]);
    const hasData = Array.isArray(dataChart) && dataChart.length > 0;
    const isChartLoading = Boolean(isLoading);

    const getDataCair = async () => {
        const res = await fetchCair({region,area})
        setCairs(res || [])
    }

    useEffect(() => {
        getDataCair()
    }, []);

    const cairData = cairs.find(item => item.CATEGORY === "CAIR");
    const rejectData = cairs.find(item => item.CATEGORY === "REJECT");
    const cancelData = cairs.find(item => item.CATEGORY === "CANCEL");

    return (
        <div className="grid grid-cols-1 gap-4 mt-6 relative">
            <div className={`${isChartLoading ? 'pointer-events-none opacity-70' : ''}`}>
                {hasData ? (
                    <Chart data={dataChart} />
                ) : (
                    <div className="flex items-center justify-center h-96 border border-dashed border-gray-300 rounded">
                        <p className="text-sm text-gray-500">Data belum tersedia. Silakan tekan tombol Tampilkan.</p>
                    </div>
                )}
            </div>
            <LoadingOverlay show={isChartLoading} />
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
                {cairData && (
                    <>
                        <div className="p-2 bg-green-300 rounded text-center text-sm">
                            Cair (Hari ini): <span className="font-semibold">{cairData.IN}</span>
                        </div>
                        <div className="p-2 bg-green-600 rounded text-center text-sm">
                            Cair (Bulan ini): <span className="font-semibold">{cairData.LAST}</span>
                        </div>
                    </>
                )}

                {rejectData && (
                    <>
                        <div className="p-2 bg-red-100 rounded text-center text-sm">
                            Reject (Hari ini): <span className="font-semibold">{rejectData.IN}</span>
                        </div>
                        <div className="p-2 bg-red-300 rounded text-center text-sm">
                            Reject (Bulan ini): <span className="font-semibold">{rejectData.LAST}</span>
                        </div>
                    </>
                )}

                {cancelData && (
                    <>
                        <div className="p-2 bg-red-400 rounded text-center text-sm">
                            Cancel (Hari ini): <span className="font-semibold">{cancelData.IN}</span>
                        </div>
                        <div className="p-2 bg-red-600 rounded text-center text-sm">
                            Cancel (Bulan ini): <span className="font-semibold">{cancelData.LAST}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
