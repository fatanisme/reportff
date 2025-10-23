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
    const [isButtonClicked, setIsButtonClicked] = useState(false); // New state to track button click

    // Function to fetch data when the "Tampilkan" button is clicked
    const fetchData = async () => {
        try {
            let url = "/api/pending-progress?";
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
            console.error("Error fetching data: ", error);
        }
    };

    useEffect(() => {
        // Create chart after data is fetched
        if (chartData.length === 0) return; // Don't create chart if no data

        let chart = am4core.create("chartdiv", am4charts.XYChart);
        chartRef.current = chart;
        chart.paddingRight = 20;
        chart.data = chartData; // Use fetched data for the chart

        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 20;
        categoryAxis.renderer.labels.template.rotation = -45;
        categoryAxis.renderer.cellStartLocation = 0.2;
        categoryAxis.renderer.cellEndLocation = 0.8;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.labels.template.fontSize = 12;
        valueAxis.renderer.minWidth = 50;

        // Set a max value for the valueAxis to avoid cut-off values
        valueAxis.max = Math.max(...chart.data.map(d => Math.max(d.IN, d.LAST))) * 1.1;

        const createSeries = (field, name, color) => {
            let series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = field;
            series.dataFields.categoryX = "category";
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
        fetchData();
    };

    // Function to export chart data as Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(chartData); // Convert data to worksheet
        const wb = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(wb, ws, "Pending Data"); // Append worksheet to workbook
        XLSX.writeFile(wb, "Pending_Progress_Data.xlsx"); // Write file as Excel
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Dashboard Daily In Progress & Pending</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
                    <div>
                        <label className="block text-sm font-medium">Pilih Region</label>
                        <select className="w-full p-2 border rounded" value={region} onChange={(e) => setRegion(e.target.value)}>
                            <option>All</option>
                            <option>Region 1</option>
                            <option>Region 2</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pilih Area</label>
                        <select className="w-full p-2 border rounded" value={area} onChange={(e) => setArea(e.target.value)}>
                            <option>All</option>
                            <option>Area 1</option>
                            <option>Area 2</option>
                        </select>
                    </div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={handleButtonClick} // Trigger data fetching on button click
                    >
                        Tampilkan
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 items-end">
                    <div>
                        <label className="block text-sm font-medium">Mulai Dari</label>
                        <input type="date" className="w-full p-2 border rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Sampai Dengan</label>
                        <input type="date" className="w-full p-2 border rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={exportToExcel} // Trigger export to Excel
                    >
                        Download Data WISE
                    </button>
                </div>

                <div className="w-full">
                    <div id="chartdiv" className="w-full h-96"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
                    <div className="p-4 bg-green-300 rounded text-center">Cair (Hari ini): <span className="font-semibold">15</span></div>
                    <div className="p-4 bg-green-600 rounded text-center">Cair (Bulan ini): <span className="font-semibold">15</span></div>
                    <div className="p-4 bg-red-100 rounded text-center">Cancel (Hari ini): <span className="font-semibold">15</span></div>
                    <div className="p-4 bg-red-300 rounded text-center">Cancel (Bulan ini): <span className="font-semibold">15</span></div>
                    <div className="p-4 bg-red-400 rounded text-center">Reject (Hari ini): <span className="font-semibold">429</span></div>
                    <div className="p-4 bg-red-600 rounded text-center">Reject (Bulan ini): <span className="font-semibold">39</span></div>
                    <div className="p-4 bg-gray-300 rounded text-center">Hold (Bulan ini): <span className="font-semibold">55</span></div>
                </div>
            </div>
        </div>
    );
};

export default PendingProgress;
