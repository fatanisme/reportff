// components/Chart.js
import React, { useEffect, useRef } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

export default function Chart({ data }) {
  const chartDivRef = useRef(null); // DOM target untuk chart
  const chartRef = useRef(null);    // Simpan instance chart

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Buat chart baru
    const chart = am4core.create(chartDivRef.current, am4charts.XYChart);
    chartRef.current = chart;

    chart.paddingRight = 20;
    chart.data = data;

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
    valueAxis.max = Math.max(...data.map((d) => Math.max(d.IN, d.LAST))) * 1.1;

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
      valueLabel.label.dy = -10;
      valueLabel.label.fill = am4core.color("#fff");
      valueLabel.label.fontSize = 12;
      valueLabel.label.fontWeight = "bold";
    
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

    return () => {
      chart.dispose();
    };
  }, [data]);

  return (
    <div className="w-full">
      <div ref={chartDivRef} className="w-full h-96" />
    </div>
  );
}
