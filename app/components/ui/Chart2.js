
import React, { useEffect, useMemo, useRef } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

function buildChartData(source = []) {
  const base = source[0] || {};
  return [
    { stage: "IDE", val: base.IDE || 0, color: "#1197f7" },
    { stage: "DEDUPE", val: base.DEDUPE || 0, color: "#1197f7" },
    { stage: "Get Result IDEB", val: base.IDEB || 0, color: "#1197f7" },
    { stage: "UPLOAD DOC", val: base.UPLOAD || 0, color: "#1197f7" },
    { stage: "DDE", val: base.DDE || 0, color: "#ff3b3b" },
    { stage: "VERIN", val: base.VERIN || 0, color: "#ff3b3b" },
    { stage: "OTOR VERIN", val: base.OTOR_VERIN || 0, color: "#ff3b3b" },
    { stage: "VALIDATE", val: base.VALIDATE_1 || 0, color: "#1197f7" },
    { stage: "APPROVAL", val: base.APPROVAL || 0, color: "#1197f7" },
    { stage: "SP3", val: base.SP3 || 0, color: "#ffd903" },
    { stage: "AKAD", val: base.AKAD || 0, color: "#1197f7" },
    { stage: "OTOR AKAD", val: base.OTOR_AKAD || 0, color: "#1197f7" },
    { stage: "REVIEW", val: base.REVIEW || 0, color: "#ffd903" },
    { stage: "OTOR REVIEW", val: base.OTOR_REVIEW || 0, color: "#ffd903" },
    { stage: "CANCEL", val: base.CANCEL || 0, color: "#626363" },
    { stage: "REJECT", val: base.REJECT || 0, color: "#7a7a7a" },
  ];
}

export default function Chart2({ data }) {
  const chartDivRef = useRef(null);
  const chartStateRef = useRef({ chart: null });

  const preparedData = useMemo(() => buildChartData(data), [data]);

  useEffect(() => {
    if (!chartDivRef.current) return;

    const chart = am4core.create(chartDivRef.current, am4charts.XYChart);

    chart.padding(40, 40, 40, 40);

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "stage";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.labels.template.rotation = -45;
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.horizontalCenter = "right";

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "val";
    series.dataFields.categoryX = "stage";
    series.tooltip.label.textAlign = "middle";
    series.columns.template.tooltipText = "[font-size:18px;bold]{valueY}[/]";
    series.columns.template.alwaysShowTooltip = true;
    series.tooltip.pointerOrientation = "down";
    series.columns.template.tooltipY = 0;
    series.columns.template.propertyFields.fill = "color";
    series.columns.template.propertyFields.stroke = am4core.color("#ccc");
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.propertyFields.stroke = "color";
    series.tooltip.autoTextColor = false;
    series.tooltip.label.fill = am4core.color("#000");
    series.tooltip.background.fillOpacity = 0;

    chart.cursor = new am4charts.XYCursor();

    chartStateRef.current = { chart };

    return () => {
      chart.dispose();
      chartStateRef.current = { chart: null };
    };
  }, []);

  useEffect(() => {
    const { chart } = chartStateRef.current;
    if (!chart) return;

    chart.data = preparedData;
  }, [preparedData]);

  return (
    <div className="w-full">
      <div ref={chartDivRef} className="w-full h-96" />
    </div>
  );
}
