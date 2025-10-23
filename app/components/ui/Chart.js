// components/Chart.js
import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

export default function Chart({ data }) {
  const chartDivRef = useRef(null); // DOM target untuk chart
  const chartRef = useRef(null); // Simpan instance chart
  const chartStateRef = useRef({ chart: null, valueAxis: null });

  useEffect(() => {
    if (!chartDivRef.current) return;

    const chart = am4core.create(chartDivRef.current, am4charts.XYChart);
    chartRef.current = chart;
    chart.maskBullets = false; // izinkan label tampil di luar area batang

    chart.paddingTop = 40;
    chart.paddingRight = 20;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "CATEGORY";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.cellStartLocation = 0.2;
    categoryAxis.renderer.cellEndLocation = 0.8;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fontSize = 12;
    valueAxis.renderer.minWidth = 50;
    valueAxis.extraMax = 0.2; // ruang tambahan supaya label tidak terpotong

    const createSeries = (field, name, colorField) => {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = field;
      series.dataFields.categoryX = "CATEGORY";
      series.name = name;

      // Ambil warna dari data
      series.columns.template.propertyFields.fill = colorField;
      series.columns.template.propertyFields.stroke = colorField;
      series.columns.template.strokeWidth = 0;
      series.columns.template.width = am4core.percent(150);

      let valueLabel = series.bullets.push(new am4charts.LabelBullet());
      valueLabel.label.text = "{valueY}";
      valueLabel.label.fill = am4core.color("#000"); // warna teks
      valueLabel.label.fontSize = 12;
      valueLabel.label.fontWeight = "bold";
      valueLabel.label.horizontalCenter = "middle";
      valueLabel.label.verticalCenter = "bottom";
      valueLabel.label.hideOversized = false;
      valueLabel.label.truncate = false;
      valueLabel.label.wrap = false;
      valueLabel.locationY = 1; // posisi di atas batang
      valueLabel.dy = -15; // geser label keluar dari batang
      valueLabel.label.interactionsEnabled = true;
      valueLabel.label.cursorOverStyle = am4core.MouseCursorStyle.pointer;
      valueLabel.label.events.on("hit", function (ev) {
        const dataItem = ev.target.dataItem;
        const category = dataItem.categoryX; // misalnya nama cabang atau kategori
        const type = field; // 'IN' atau 'LAST'

        // Gabungkan jadi satu parameter, misalnya: "Jakarta-IN"
        const url = `/grafik/pending-&-progress/detail-wise?flow_code=${encodeURIComponent(
          category
        )}&mode=${encodeURIComponent(type)}`;

        window.open(url, "_blank");
      });

      let nameLabel = series.bullets.push(new am4charts.LabelBullet());
      nameLabel.label.text = name;
      nameLabel.label.fill = am4core.color("#000");
      nameLabel.label.fontSize = 10;
      nameLabel.label.fontWeight = "600";
      nameLabel.locationY = 0.5;
      nameLabel.label.horizontalCenter = "middle";
      nameLabel.label.verticalCenter = "middle";
    };

    createSeries("IN", "IN", "COLORIN");
    createSeries("LAST", "LAST", "COLORLAST");

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "zoomX";

    chartStateRef.current = { chart, valueAxis };

    return () => {
      chart.dispose();
      chartRef.current = null;
      chartStateRef.current = { chart: null, valueAxis: null };
    };
  }, []);

  useEffect(() => {
    const { chart, valueAxis } = chartStateRef.current;

    if (!chart || !data || data.length === 0) return;

    chart.data = data;

    if (valueAxis) {
      const maxCandidate = data.reduce((acc, item) => {
        const localMax = Math.max(item?.IN ?? 0, item?.LAST ?? 0);
        return localMax > acc ? localMax : acc;
      }, 0);

      valueAxis.max = maxCandidate > 0 ? maxCandidate * 1.1 : undefined;
    }
  }, [data]);

  return (
    <div className="w-full">
      <div ref={chartDivRef} className="w-full h-96" />
    </div>
  );
}
