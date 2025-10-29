"use client";

import FilterTglSection from "@/app/components/pending-progress/Section/filterTglSection";
import DataDisplaySection from "@/app/components/pending-progress/Section/dataDisplaySection";
import RegionSection from "@/app/components/pending-progress/Section/regionSection";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import React, { useMemo, useState } from "react";

export default function PendingProgress() {
  const [region, setRegion] = useState("All");
  const [area, setArea] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const isBusy = useMemo(
    () => Boolean(isLoading || isSummaryLoading),
    [isLoading, isSummaryLoading]
  );

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="relative rounded-lg bg-white p-6 shadow-md">
        <LoadingOverlay show={isBusy} />
        <h2 className="text-lg font-semibold mb-1">
          Dashboard Daily In Progress & Pending
        </h2>
        <div className="mb-2">
          <span className="inline-block w-4 h-4 bg-[#1197f7] rounded"></span>
          <label className="mr-1">Bisnis</label>
          <span className="inline-block w-4 h-4 bg-[#ff3b3b] rounded"></span>
          <label className="mr-1">Risk</label>
          <span className="inline-block w-4 h-4 bg-[#ffd903] rounded"></span>
          <label className="mr-1">FOG</label>
        </div>

        <div className={isBusy ? "pointer-events-none select-none opacity-60 transition" : "transition"}>
          <RegionSection
            startDate={startDate}
            endDate={endDate}
            region={region}
            setRegion={setRegion}
            area={area}
            setArea={setArea}
            setChartData={setChartData}
            setLoading={setIsLoading}
            setSummaryData={setSummaryData}
            setSummaryLoading={setIsSummaryLoading}
            isLoading={isLoading}
            isSummaryLoading={isSummaryLoading}
          />

          <FilterTglSection
            region={region}
            area={area}
            isLoading={isLoading}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          <DataDisplaySection
            dataChart={chartData}
            isLoading={isLoading}
            region={region}
            area={area}
            startDate={startDate}
            endDate={endDate}
            summaryData={summaryData}
            isSummaryLoading={isSummaryLoading}
          />
        </div>
      </div>
    </div>
  );
}
