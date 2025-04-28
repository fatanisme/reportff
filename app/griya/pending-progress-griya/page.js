'use client';

import FilterTglSection from '@/app/components/pending-progress-griya/Section/filterTglSection';
import DataDisplaySection from '@/app/components/pending-progress-griya/Section/dataDisplaySection';
import RegionSection from '@/app/components/pending-progress-griya/Section/regionSection';
import React, { useState } from 'react';

export default function Dashboard() {
  const [region, setRegion] = useState("All");
  const [area, setArea] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState([]);

  return (
    <div className="p-2 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">
          Dashboard Daily In Progress & Pending
        </h2>
        <div className='mb-2'>
          <span className="inline-block w-4 h-4 bg-[#1197f7] rounded"></span> 
          <label className='mr-1'>Bisnis</label>
          <span className="inline-block w-4 h-4 bg-[#ff3b3b] rounded"></span>
          <label className='mr-1'>Risk</label>  
          <span className="inline-block w-4 h-4 bg-[#ffd903] rounded"></span>
          <label className='mr-1'>FOG</label>  
        </div>

        <RegionSection
          startDate={startDate}
          endDate={endDate}
          region={region}
          setRegion={setRegion}
          area={area}
          setArea={setArea}
          setChartData={setChartData}
        />
        
        <FilterTglSection
          region={region}
          area={area}
        />

        <DataDisplaySection
          dataChart={chartData}
          region={region}
          area={area}
        />
      </div>
    </div>
  );
}
