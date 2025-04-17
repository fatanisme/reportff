"use client";

import React, { useEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as XLSX from "xlsx"; // Import XLSX

am4core.useTheme(am4themes_animated.default);

const PendingProgress = () => {
  const chartRef = useRef(null);
  const [region, setRegion] = useState("All");
  const [area, setArea] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]); // State untuk menyimpan data chart
  const [excelData, setExcelData] = useState([]); // New state to store data for Excel
  const [regions, setRegions] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false); // New state to track button click

  // Function to fetch regions from API
  const fetchRegions = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/region");
      const result = await response.json();
      if (result.success) {
        setRegions(result.data); // Update regions state with fetched data
      }
    } catch (error) {
      console.error("Error fetching regions: ", error);
    }
  };

  // Function to fetch data for the chart
  const fetchChartData = async () => {
    try {
      let url = "http://localhost:3000/api/griya/pending-progress?";
      if (region !== "All") url += `region=${region}&`;
      if (area !== "All") url += `area=${area}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setChartData(result.data); // Update chartData with fetched data
      }
    } catch (error) {
      console.error("Error fetching chart data: ", error);
    }
  };

  // Function to fetch data for Excel export
  const fetchExcelData = async () => {
    try {
      let url = "http://localhost:3000/api/griya/pending-progress?";
      if (region !== "All") url += `region=${region}&`;
      if (area !== "All") url += `area=${area}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setExcelData(result.data); // Update excelData with fetched data
      }
    } catch (error) {
      console.error("Error fetching Excel data: ", error);
    }
  };

  useEffect(() => {
    // Fetch regions when component mounts
    fetchRegions();
  }, []);
  useEffect(() => {
    // Create chart after data is fetched
    if (chartData.length === 0) return; // Don't create chart if no data

    let chart = am4core.create("chartdiv", am4charts.XYChart);
    chartRef.current = chart;
    chart.paddingRight = 20;
    chart.data = chartData; // Use fetched data for the chart

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "CATEGORY";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.cellStartLocation = 0.2;
    categoryAxis.renderer.cellEndLocation = 0.8;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.renderer.minWidth = 50;

    // Set a max value for the valueAxis to avoid cut-off values
    valueAxis.max =
      Math.max(...chart.data.map((d) => Math.max(d.IN, d.LAST))) * 1.1;

    const createSeries = (field, name, color) => {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = field;
      series.dataFields.categoryX = "CATEGORY";
      series.name = name;
      series.columns.template.fill = color;
      series.columns.template.strokeWidth = 0;
      series.columns.template.width = am4core.percent(50);

      let labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY}";
      labelBullet.label.dy = -10;
      labelBullet.label.fontSize = 12;
      labelBullet.label.fontWeight = "bold";
      labelBullet.label.truncate = false;
      labelBullet.label.wrap = false;
      labelBullet.label.hideOversized = false;

      // Enable zoom functionality
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.behavior = "zoomX";
    };

    createSeries("IN", "IN", am4core.color("#007fff"));
    createSeries("LAST", "LAST", am4core.color("#dc3545"));

    return () => {
      chart.dispose();
    };
  }, [chartData]); // Re-render chart whenever chartData changes

  // Call fetchData only when the "Tampilkan" button is clicked
  const handleButtonClick = () => {
    setIsButtonClicked(true);
    fetchChartData(); // Fetch chart data
  };

  const exportToExcel = async () => {
    // If excelData is empty, fetch it first
    if (excelData.length === 0) {
      // Disable download button while fetching data
      setIsButtonClicked(true);
      await fetchExcelData(); // Wait until data is fetched
      return;
    }

    // If excelData is still empty, return
    if (excelData.length === 0) {
      alert("Data Excel export tidak ada / kosong !");
      return;
    }

    // Create the Excel data based on fetched data
    const categories = Array.from(
      new Set(excelData.map((item) => item.category))
    );

    const formattedData = excelData.map((item, index) => {
      const totalAplikasi = item.IN + item.LAST;

      const newItem = {
        No: index + 1,
        Region: item.region !== "All" ? item.region : "",
        Area: item.area !== "All" ? item.area : "",
        "Total Aplikasi": totalAplikasi,
      };

      categories.forEach((category) => {
        if (item.category === category) {
          newItem[category] = item.IN + item.LAST;
        } else {
          newItem[category] = 0;
        }
      });

      return newItem;
    });

    // Convert to Excel sheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const header = ["No", "Region", "Area", "Total Aplikasi", ...categories];
    ws["!cols"] = header.map(() => ({ wpx: 150 }));
    ws["!rows"] = formattedData.map((row) => {
      return Object.keys(row).map((key) => row[key]);
    });

    // Create a formatted date for the filename (e.g., "2025-02-17")
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Create workbook and save it with a filename that includes the date
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Data");

    // Use the formatted date in the filename
    const fileName = `${formattedDate}_Pending_Progress_Data.xlsx`;

    XLSX.writeFile(wb, fileName);

    // Reset the button state to enable future clicks
    setIsButtonClicked(false);
  };

  return (
    <div className="p-2 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">
          Dashboard Daily In Progress & Pending
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium">Pilih Region</label>
            <select
              className="w-full p-2 text-sm border rounded"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="All">All</option>
              {regions.map((regionData) => (
                <option key={regionData.KODE_REGION} value={regionData.REGION}>
                  {regionData.REGION}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Pilih Area</label>
            <select
              className="w-full p-2 text-sm border rounded"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option>All</option>
              <option>Area 1</option>
              <option>Area 2</option>
            </select>
          </div>
          <button
            className="bg-blue-500 text-white px-4 text-sm py-2 rounded hover:bg-blue-600 w-1/2"
            onClick={handleButtonClick} // Trigger data fetching for chart
          >
            Tampilkan
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium">Mulai Dari</label>
            <input
              type="date"
              className="w-full p-2 text-sm border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Sampai Dengan</label>
            <input
              type="date"
              className="w-full p-2 text-sm border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="bg-green-500 text-white px-2 text-sm py-2 rounded hover:bg-green-600 w-1/2"
            onClick={exportToExcel} // Trigger export to Excel
          >
            Download Data WISE
          </button>
        </div>

        <div className="w-full">
          <div id="chartdiv" className="w-full h-96"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
          <div className="p-2 bg-green-300 rounded text-center text-sm">
            Cair (Hari ini): <span className="font-semibold">15</span>
          </div>
          <div className="p-2 bg-green-600 rounded text-center text-sm">
            Cair (Bulan ini): <span className="font-semibold">15</span>
          </div>
          <div className="p-2 bg-red-100 rounded text-center text-sm">
            Cancel (Hari ini): <span className="font-semibold">15</span>
          </div>
          <div className="p-2 bg-red-300 rounded text-center text-sm">
            Cancel (Bulan ini): <span className="font-semibold">15</span>
          </div>
          <div className="p-2 bg-red-400 rounded text-center text-sm">
            Reject (Hari ini): <span className="font-semibold">429</span>
          </div>
          <div className="p-2 bg-red-600 rounded text-center text-sm">
            Reject (Bulan ini): <span className="font-semibold">39</span>
          </div>
          <div className="p-2 bg-gray-300 rounded text-center text-sm">
            Hold (Bulan ini): <span className="font-semibold">55</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingProgress;
