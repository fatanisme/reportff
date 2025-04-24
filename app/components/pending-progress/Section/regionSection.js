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
    setChartData}) 
    {
    const [regions, setRegions] = useState([]);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        const getRegions = async()=>{
            const res = await fetchRegions()
            setRegions(res)
        }
        getRegions()
    }, []);

    useEffect(() => {
        const getAreas = async()=>{
            const res = await fetchAreas(region,area)
            setAreas(res)
        }
        getAreas()
    }, [region]);

    const getDataChart = async()=>{
        const params = { startDate, endDate, region, area };
        const res = await fetchChartData(params)
        setChartData(res)
    }

    const handleButtonClick = () => {
        getDataChart()
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
            />
            <Dropdown
                label="Pilih Area"
                options={areas}
                value={area}
                onChange={setArea}
                valueKey="KODE_AREA"
                labelKey="AREA"
            />

            <Button
                className="bg-blue-500 text-white px-4 text-sm py-2 rounded hover:bg-blue-600 w-1/2"
                onClick={handleButtonClick}
            >
                Tampilkan
            </Button>
        </div>
    );
}
