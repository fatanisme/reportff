import React, { useState, useEffect } from 'react';
import Chart from '../../ui/Chart3';
import {
    fetchChartData
} from '../getData';

export default function DataDisplaySection() {
    const [chart, setChart] = useState([]);

    const getDataChart = async () => {
        const res = await fetchChartData()
        setChart(res)
    }

    useEffect(() => {
        getDataChart()
    }, []);
    // const cairData = chart[0].SUM_LIVE;
    // const rejectData = chart[0].SUM_REJECT;
    // const cancelData = chart[0].SUM_CANCEL;

    const cairData = chart.length != 0 ? chart[0].SUM_LIVE : 0;
    const rejectData = chart.length != 0 ? chart[0].SUM_REJECT : 0;
    const cancelData = chart.length != 0 ? chart[0].SUM_CANCEL : 0;

    return (
        <div className="grid grid-cols-1 gap-4 mt-6">
            <Chart data={chart} />
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
                {cairData && (
                    <>
                        <div className="p-2 bg-green-300 rounded text-center text-sm">
                            Cair: <span className="font-semibold">{cairData}</span>
                        </div>
                    </>
                )}

                {rejectData && (
                    <>
                        <div className="p-2 bg-red-100 rounded text-center text-sm">
                            Reject: <span className="font-semibold">{rejectData}</span>
                        </div>
                    </>
                )}

                {cancelData && (
                    <>
                        <div className="p-2 bg-red-400 rounded text-center text-sm">
                            Cancel : <span className="font-semibold">{cancelData}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
