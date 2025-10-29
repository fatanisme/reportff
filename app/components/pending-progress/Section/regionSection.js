import React, { useState, useEffect } from "react";
import Dropdown from "../../ui/Dropdown";
import Button from "../../ui/Button";
import { fetchAreas, fetchRegions, fetchChartData, fetchCair } from "../getData";

export default function RegionSection({
  startDate,
  endDate,
  region,
  setRegion,
  area,
  setArea,
  setChartData,
  setLoading,
  setSummaryData,
  setSummaryLoading,
  isLoading,
  isSummaryLoading,
}) {
  const [regions, setRegions] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const getRegions = async () => {
      const res = await fetchRegions();
      setRegions(res || []);
    };
    getRegions();
  }, []);

  useEffect(() => {
    if (!region) return; // jangan fetch kalau region belum dipilih
    const getAreas = async () => {
      const res = await fetchAreas({ region });
      setAreas(res || []);
    };
    getAreas();
  }, [region]);

  const getData = async () => {
    const params = { startDate, endDate, region, area };
    try {
      setLoading(true);
      setSummaryLoading(true);
      setSummaryData([]);
      const effectiveEndDate = params.endDate || params.startDate || undefined;
      const [chartRes, summaryRes] = await Promise.all([
        fetchChartData({ area: params.area, region: params.region, endDate: effectiveEndDate }),
        fetchCair(params),
      ]);
      setChartData(chartRes || []);
      setSummaryData(Array.isArray(summaryRes) ? summaryRes : []);
    } catch (error) {
      console.error("Gagal memuat data chart:", error);
      setChartData([]);
      setSummaryData([]);
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!isLoading && !isSummaryLoading) {
      getData();
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
        disabled={isLoading || isSummaryLoading}
      />
      <Dropdown
        label="Pilih Area"
        options={areas}
        value={area}
        onChange={setArea}
        valueKey="KODE_AREA"
        labelKey="AREA"
        disabled={isLoading || isSummaryLoading}
      />

      <Button
        className="bg-blue-500 text-white px-4 text-sm py-2 rounded hover:bg-blue-600 w-1/2"
        onClick={handleButtonClick}
        disabled={isLoading || isSummaryLoading}
      >
        {isLoading || isSummaryLoading ? "Memuat..." : "Tampilkan"}
      </Button>
    </div>
  );
}
