"use client";

import React, { useEffect, useRef, useState } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as XLSX from "xlsx";

am4core.useTheme(am4themes_animated.default);

const PendingProgress = () => {
  const chartRef = useRef(null);
  const [region, setRegion] = useState("All");
  const [area, setArea] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState([]); // State untuk menyimpan data chart
  // const [excelData, setExcelData] = useState([]); // New state to store data for Excel
  // const [excelData1, setExcelData1] = useState([]);
  // const [excelData2, setExcelData2] = useState([]);
  const [regions, setRegions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cairs, setCairs] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false); // New state to track button click

  const fetchCair = async () => {
    try {
      let url = "http://localhost:3000/api/grafik/pending-progress-2";
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setCairs(result.data); // Update chartData dengan data yang diambil
      }
    } catch (error) {
      console.error("Error fetching chart data: ", error);
    }
  };
  // Menemukan data berdasarkan kategori
  const cairData = cairs.find(item => item.CATEGORY === "CAIR");
  const rejectData = cairs.find(item => item.CATEGORY === "REJECT");
  const cancelData = cairs.find(item => item.CATEGORY === "CANCEL");

  const fetchAreas = async () => {
    try {
      let url = "http://localhost:3000/api/area?";
      if (region !== "All") url += `kode_region=${region}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setAreas(result.data); // Update chartData dengan data yang diambil
      }
    } catch (error) {
      console.error("Error fetching chart data: ", error);
    }
  };

  // Function to fetch data for the chart
  const fetchRegions = async () => {
    try {
      let url = "http://localhost:3000/api/region";

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setRegions(result.data); // Update chartData with fetched data
      }
    } catch (error) {
      console.error("Error fetching chart data: ", error);
    }
  };
  // Function to fetch data for the chart
  const fetchChartData = async () => {
    try {
      let url = "http://localhost:3000/api/grafik/pending-progress";
      if (area !== "All") url += `?kode_area=${area}`;

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
      let url = "http://localhost:3000/api/export/pending-progress/detail?";
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (region) url += `kode_region=${region}&`;
      if (area) url += `kode_area=${area}`;

      console.log(url)
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        // setExcelData(result.data); // Update excelData with fetched data
        return result.data
      }
    } catch (error) {
      console.error("Error fetching Excel data: ", error);
    }
  };
  const fetchExcelData1 = async () => {
    try {
      let url = "http://localhost:3000/api/export/pending-progress/progress?";
      if (region) url += `kode_region=${region}&`;
      if (area) url += `kode_area=${area}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        // setExcelData1(result.data); // Update excelData with fetched data
        return result.data
      }
    } catch (error) {
      console.error("Error fetching Excel data: ", error);
    }
  };

  const fetchExcelData2 = async () => {
    try {
      let url = "http://localhost:3000/api/export/pending-progress/pending?";
      if (region) url += `kode_region=${region}&`;
      if (area) url += `kode_area=${area}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        // setExcelData2(result.data); // Update excelData with fetched data
        return result.data
      }
    } catch (error) {
      console.error("Error fetching Excel data: ", error);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchCair();
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [region]);
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
    // if (excelData.length === 0) {
    //   // Disable download button while fetching data
    //   await Promise.all([
    //     fetchExcelData(),
    //     fetchExcelData1(),
    //     fetchExcelData2()
    //   ]);
    // }
      const [data,data1,data2] = await Promise.all([
        fetchExcelData(),
        fetchExcelData1(),
        fetchExcelData2()
      ]);
    console.log('1')

    // If excelData is still empty, return
    if (data.length === 0) {
      alert("Data Excel export Detail Wise tidak ada / kosong !");
      return;
    }
    if (data1.length === 0) {
      alert("Data Excel export Inprogress Wise tidak ada / kosong !");
      return;
    }
    if (data2.length === 0) {
      alert("Data Excel export Pending Wise tidak ada / kosong !");
      return;
    }
    console.log('2')

    // setExcelData(data);
    // setExcelData1(data1);
    // setExcelData2(data2);

    const formattedData = data.map((item, index) => {
      const newItem = {
        "TGL INPUT": item.TGL_INPUT || "",
        "NO APLIKASI": item.NO_APLIKASI || "",
        "NAMA NASABAH": item.NAMA_NASABAH || "",
        "JENIS PRODUK": item.JENIS_PRODUK || "",
        "KODE PROGRAM": item.EVENT || "",
        "PLAFOND": item.PLAFOND || "",
        "CABANG": item.NAMA_CABANG || "",
        "AREA": item.NAMA_AREA || "",
        "REGION": item.REGION || "",
        "LAST POSISI": item.LAST_POSISI || "",
        "LAST READ BY": item.LAST_READ_BY + " - "+  item.LAST_READ_BY_NAME || "",
        "LAST UPDATE": item.LAST_UPDATE || "",
        "JUMLAH RETURN": item.JUM_RETURN || 0,
        "BRANCH DDE": item.BRANCH_DDE || "",
      };
    
      return newItem;
    });


const formattedData1 = data1.map((item, index) => {
  const newItem = {
    "NO": index + 1,
    "REGION": item.REGION || "",
    "NAMA AREA": `${item.NAMA_AREA}` || "",
    "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
    "IDE": item.IDE || 0,
    "DEDUPE": item.DEDUPE || 0,
    "IDEB": item.IDEB || 0,
    "UPLOAD DOC": item.UPLOAD_DOC || 0,
    "DDE": item.DDE || 0,
    "VERIN": item.VERIN || 0,
    "OTOR VERIN": item.OTOR_VERIN || 0,
    "VALID": item.VALID || 0,
    "APPROVAL": item.APPROVAL || 0,
    "SP3": item.SP3 || 0,
    "AKAD": item.AKAD || 0,
    "OTOR AKAD": item.OTOR_AKAD || 0,
    "REVIEW": item.REVIEW || 0,
    "OTOR REVIEW": item.OTOR_REVIEW || 0,
    "LIVE": item.LIVE || 0,
    "CANCEL": item.CANCEL || 0,
    "REJECT": item.REJECT || 0
  };

  return newItem;
});

formattedData1.push({
  "NO": "Total",
  "REGION": "",
  "NAMA AREA": "",
  "TOTAL APLIKASI": data1[0].SUM_TOTAL || 0,
  "IDE": data1[0].SUM_IDE || 0,
  "DEDUPE": data1[0].SUM_DEDUPE || 0,
  "IDEB": data1[0].SUM_DEDUPE || 0,
  "UPLOAD DOC": data1[0].SUM_UPLOAD || 0,
  "DDE": data1[0].SUM_DDE || 0,
  "VERIN": data1[0].SUM_VERIN || 0,
  "OTOR VERIN": data1[0].SUM_OTOR_VERIN || 0,
  "VALID": data1[0].SUM_VALID || 0,
  "APPROVAL": data1[0].SUM_APPROVAL || 0,
  "SP3": data1[0].SUM_SP3 || 0,
  "AKAD": data1[0].SUM_AKAD || 0,
  "OTOR AKAD": data1[0].SUM_OTOR_AKAD || 0,
  "REVIEW": data1[0].SUM_REVIEW || 0,
  "OTOR REVIEW": data1[0].SUM_OTOR_REVIEW || 0,
  "LIVE": data1[0].SUM_LIVE || 0,
  "CANCEL": data1[0].SUM_CANCEL || 0,
  "REJECT": data1[0].SUM_REJECT || 0
})

const formattedData2 = data2.map((item, index) => {
  const newItem = {
    "NO": index + 1,
    "REGION": item.REGION || "",
    "NAMA AREA": `${item.NAMA_AREA}` || "",
    "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
    "IDE": item.IDE || 0,
    "DEDUPE": item.DEDUPE || 0,
    "IDEB": item.IDEB || 0,
    "UPLOAD DOC": item.UPLOAD_DOC || 0,
    "DDE": item.DDE || 0,
    "VERIN": item.VERIN || 0,
    "OTOR VERIN": item.OTOR_VERIN || 0,
    "VALID": item.VALID || 0,
    "APPROVAL": item.APPROVAL || 0,
    "SP3": item.SP3 || 0,
    "AKAD": item.AKAD || 0,
    "OTOR AKAD": item.OTOR_AKAD || 0,
    "REVIEW": item.REVIEW || 0,
    "OTOR REVIEW": item.OTOR_REVIEW || 0,
    "LIVE": item.LIVE || 0,
    "CANCEL": item.CANCEL || 0,
    "REJECT": item.REJECT || 0
  };

  return newItem;
});
formattedData2.push({
  "NO": "Total",
  "REGION": "",
  "NAMA AREA": "",
  "TOTAL APLIKASI": data2[0].SUM_TOTAL || 0,
  "IDE": data2[0].SUM_IDE || 0,
  "DEDUPE": data2[0].SUM_DEDUPE || 0,
  "IDEB": data2[0].SUM_DEDUPE || 0,
  "UPLOAD DOC": data2[0].SUM_UPLOAD || 0,
  "DDE": data2[0].SUM_DDE || 0,
  "VERIN": data2[0].SUM_VERIN || 0,
  "OTOR VERIN": data2[0].SUM_OTOR_VERIN || 0,
  "VALID": data2[0].SUM_VALID || 0,
  "APPROVAL": data2[0].SUM_APPROVAL || 0,
  "SP3": data2[0].SUM_SP3 || 0,
  "AKAD": data2[0].SUM_AKAD || 0,
  "OTOR AKAD": data2[0].SUM_OTOR_AKAD || 0,
  "REVIEW": data2[0].SUM_REVIEW || 0,
  "OTOR REVIEW": data2[0].SUM_OTOR_REVIEW || 0,
  "LIVE": data2[0].SUM_LIVE || 0,
  "CANCEL": data2[0].SUM_CANCEL || 0,
  "REJECT": data2[0].SUM_REJECT || 0
})

console.log('3')

    

    // Convert to Excel sheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const ws1 = XLSX.utils.json_to_sheet(formattedData1, { skipHeader: true });
    const ws2 = XLSX.utils.json_to_sheet(formattedData2, { skipHeader: true });

    const headers = [
      "TGL INPUT",
      "NO APLIKASI",
      "NAMA NASABAH",
      "JENIS PRODUK",
      "KODE PROGRAM",
      "PLAFOND",
      "CABANG",
      "AREA",
      "REGION",
      "LAST POSISI",
      "LAST READ BY",
      "LAST UPDATE",
      "JUMLAH RETURN",
      "BRANCH DDE",
    ];
    //headers dipakai inprogress dan pending
    const headers1 = ["No","Region","Nama Area","Total Aplikasi","IDE","Dedupe","iDEB","Upload Doc",
    "DDE","Verin","Otor Verin","Valid","Approval","SP3","Akad","Otor Akad","Review",]

    const today = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('id-ID', options);

    ws["!cols"] = headers.map(() => ({ wpx: 150 }));
    ws["!rows"] = formattedData.map((row) => {
      return Object.keys(row).map((key) => row[key]);
    });
    
    XLSX.utils.sheet_add_aoa(ws1, [headers1], { origin: "A2" });
    const title1 = `${formattedDate} DATA IN PROGRESS SUMARY WISE`;
    XLSX.utils.sheet_add_aoa(ws1, [[title1]], { origin: "A1" });
    ws1["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers1.length - 1 },
      },
    ];
    ws1["A1"].s = {alignment: {horizontal: "center", vertical: "center"}};
    ws1["!cols"] = headers.map(() => ({ wpx: 150 }));


    XLSX.utils.sheet_add_aoa(ws2, [headers1], { origin: "A2" });
    const title2 = `${formattedDate} DATA PENDING SUMARY WISE`;
    XLSX.utils.sheet_add_aoa(ws2, [[title2]], { origin: "A1" });
    ws2["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers1.length - 1 },
      },
    ];
    ws2["A1"].s = {alignment: {horizontal: "center", vertical: "center"}};
    ws2["!cols"] = headers1.map(() => ({ wpx: 150 }));


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Data");
    const fileName = `${startDate}_${endDate}_PENDING_PROGRESS_DETAIL_WISE.xlsx`;
    XLSX.writeFile(wb, fileName);

    const wb1 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb1, ws1, "In Progress Summary");
    const fileName1 = `${formattedDate}_INPROGRESS_SUMMARY_WISE.xlsx`;
    XLSX.writeFile(wb1, fileName1);

    const wb2 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb2, ws2, "Pending Summary");
    const fileName2 = `${formattedDate}_PENDING_SUMMARY_WISE.xlsx`;
    XLSX.writeFile(wb2, fileName2);

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
              {regions.map((region) => (
                <option key={region.ID} value={region.KODE_REGION}>
                  {region.REGION_ALIAS}
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
              <option value="All">All</option>
              {areas.map((area) => (
                <option key={area.ID} value={area.KODE_AREA}>
                  {area.AREA}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-blue-500 text-white px-4 text-sm py-2 rounded hover:bg-blue-600 w-1/2"
            onClick={handleButtonClick} // Trigger data fetching for chart
          >
            Tampilkan
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
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
            className="bg-green-500 text-white px-2 text-sm py-[10px] rounded hover:bg-green-600 w-1/2"
            onClick={exportToExcel} // Trigger export to Excel
          >
            Download Data WISE
          </button>
        </div>

        <div className="w-full">
          <div id="chartdiv" className="w-full h-96"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-6">
          {cairData && (
          <>
            <div className="p-2 bg-green-300 rounded text-center text-sm">
              Cair (Hari ini): <span className="font-semibold">{cairData.IN}</span>
            </div>
            <div className="p-2 bg-green-600 rounded text-center text-sm">
              Cair (Bulan ini): <span className="font-semibold">{cairData.LAST}</span>
            </div>
          </>
        )}

        {/* Reject (Hari ini) dan Reject (Bulan ini) */}
        {rejectData && (
          <>
            <div className="p-2 bg-red-100 rounded text-center text-sm">
              Reject (Hari ini): <span className="font-semibold">{rejectData.IN}</span>
            </div>
            <div className="p-2 bg-red-300 rounded text-center text-sm">
              Reject (Bulan ini): <span className="font-semibold">{rejectData.LAST}</span>
            </div>
          </>
        )}

        {/* Cancel (Hari ini) dan Cancel (Bulan ini) */}
        {cancelData && (
          <>
            <div className="p-2 bg-red-400 rounded text-center text-sm">
              Cancel (Hari ini): <span className="font-semibold">{cancelData.IN}</span>
            </div>
            <div className="p-2 bg-red-600 rounded text-center text-sm">
              Cancel (Bulan ini): <span className="font-semibold">{cancelData.LAST}</span>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default PendingProgress;
