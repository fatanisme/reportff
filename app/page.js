"use client";

import React, { useEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4themes_animated from "@amcharts/amcharts4/themes/animated";
import ButtonExport from "./components/dashboardDaily/ButtonExport"; 
import DataDisplaySection from "./components/dashboardDaily/Section/dataDisplaySection";
import {} from "./components/dashboardDaily/getData";

am4core.useTheme(am4themes_animated.default);

const PendingProgressGriya = () => {
  const [chartData, setChartData] = useState([]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Dashboard Daily Proceed</h2>
        <div className='mb-2'>
          <span className="inline-block w-4 h-4 bg-[#1197f7] rounded"></span>
          <label className='mr-1'>Bisnis</label>
          <span className="inline-block w-4 h-4 bg-[#ff3b3b] rounded"></span>
          <label className='mr-1'>Risk</label>
          <span className="inline-block w-4 h-4 bg-[#ffd903] rounded"></span>
          <label className='mr-1'>FOG</label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
          <div>WISE</div>
          <div></div>
          <ButtonExport />
        </div>

        <DataDisplaySection
          dataChart={chartData}
        />

      </div>
    </div>
  );
};

export default PendingProgressGriya;
