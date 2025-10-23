import React, { useEffect, useMemo, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

function buildSummaryData(source = []) {
  const base = source[0] || {};
  return [
    { stage: "IDE", val: base.SUM_IDE || 0, color: "#1197f7" },
    { stage: "DEDUPE", val: base.SUM_DEDUPE || 0, color: "#1197f7" },
    { stage: "Get Result IDEB", val: base.SUM_IDEB || 0, color: "#1197f7" },
    { stage: "UPLOAD DOC", val: base.SUM_UPLOAD || 0, color: "#1197f7" },
    { stage: "DDE", val: base.SUM_DDE || 0, color: "#ff3b3b" },
    { stage: "VERIN", val: base.SUM_VERIN || 0, color: "#ff3b3b" },
    { stage: "OTOR VERIN", val: base.SUM_OTOR_VERIN || 0, color: "#ff3b3b" },
    { stage: "APPROVAL", val: base.SUM_APPROVAL || 0, color: "#1197f7" },
    { stage: "SP3", val: base.SUM_SP3 || 0, color: "#ffd903" },
    { stage: "AKAD", val: base.SUM_AKAD || 0, color: "#1197f7" },
    { stage: "OTOR AKAD", val: base.SUM_OTOR_AKAD || 0, color: "#1197f7" },
    { stage: "REVIEW", val: base.SUM_REVIEW || 0, color: "#ffd903" },
    { stage: "OTOR REVIEW", val: base.SUM_OTOR_REVIEW || 0, color: "#ffd903" },
  ];
}

export default function Chart3({ data }) {
  const chartDivRef = useRef(null);
  const chartStateRef = useRef({ chart: null });

  const preparedData = useMemo(() => buildSummaryData(data), [data]);

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
      <div ref={chartDivRef} className="w-full h-[30rem]" />
    </div>
  );
}
