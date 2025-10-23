import React, { useState,useEffect } from 'react';
import Dropdown from '../../ui/Dropdown';
import Button from '../../ui/Button';
import { fetchAreas, fetchRegions, fetchChartData } from '../getData';

export default function regionSection({
    startDate, 
    endDate, 
    region, 
    setRegion, 
    area, 
    setArea, 
    setChartData,
    setLoading,
    isLoading,
}) 
    {
    const [regions, setRegions] = useState([]);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        const getRegions = async()=>{
            const res = await fetchRegions()
            setRegions(res || [])
        }
        getRegions()
    }, []);

    useEffect(() => {
        if (!region) return;
        const getAreas = async()=>{
            const res = await fetchAreas({ region })
            setAreas(res || [])
        }
        getAreas()
    }, [region]);

    const getDataChart = async()=>{
        const params = { startDate, endDate, region, area };
        try {
            setLoading(true);
            const res = await fetchChartData(params)
            setChartData(res || [])
        } catch (error) {
            console.error("Gagal memuat data chart griya:", error);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }

    const handleButtonClick = () => {
        if (!isLoading) {
            getDataChart()
        }
    };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
            <Dropdown
                label="Pilih Region"
                options={regions}
                value={region}
                onChange={setRegion}
                valueKey="KODE_REGION"
                labelKey="REGION_ALIAS"
                disabled={isLoading}
            />
            <Dropdown
                label="Pilih Area"
                options={areas}
                value={area}
                onChange={setArea}
                valueKey="KODE_AREA"
                labelKey="AREA"
                disabled={isLoading}
            />

            <Button
                className="bg-blue-500 text-white px-4 text-sm py-2 rounded hover:bg-blue-600 w-1/2"
                onClick={handleButtonClick}
                disabled={isLoading}
            >
                {isLoading ? 'Memuat...' : 'Tampilkan'}
            </Button>
        </div>
    );
}
