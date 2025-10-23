import React, { useState, useEffect } from 'react';
import Chart2 from '../../ui/Chart2';
import LoadingOverlay from '../../ui/LoadingOverlay';
import {
    fetchChartData
} from '../getData';

export default function DataDisplaySection() {
    const [dataChart, setDataChart] = useState([]);
    const isChartLoading = !dataChart || dataChart.length === 0;

    const getData = async () => {
        const res = await fetchChartData()
        setDataChart(res)
    }

    useEffect(() => {
        getData()
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 mt-6 relative">
            <div className={`${isChartLoading ? 'pointer-events-none opacity-70' : ''}`}>
                <Chart2 data={dataChart} />
            </div>
            <LoadingOverlay show={isChartLoading} />
        </div>
    );
}
