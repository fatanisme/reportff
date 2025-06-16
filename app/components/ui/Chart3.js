
import React, { useEffect, useRef } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

export default function Chart2({ data }) {
    const chartDivRef = useRef(null); // DOM target untuk chart
    const chartRef = useRef(null);    // Simpan instance chart

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Buat chart baru

        const chart = am4core.create(chartDivRef.current, am4charts.XYChart);

        chart.data = [
            {
                "stage": "IDE",
                "val": data[0].SUM_IDE || 0,
                "color": "#1197f7",
            },
            {
                "stage": "DEDUPE",
                "val": data[0].SUM_DEDUPE || 0,
                "color": "#1197f7",
            },
            {
                "stage": "Get Result IDEB",
                "val": data[0].SUM_IDEB || 0,
                "color": "#1197f7",
            },
            {
                "stage": "UPLOAD DOC",
                "val": data[0].SUM_UPLOAD || 0,
                "color": "#1197f7",
            },
            {
                "stage": "DDE",
                "val": data[0].SUM_DDE || 0,
                "color": "#ff3b3b",
            },
            {
                "stage": "VERIN",
                "val": data[0].SUM_VERIN || 0,
                "color": "#ff3b3b",
            },
            {
                "stage": "OTOR VERIN",
                "val": data[0].SUM_OTOR_VERIN || 0,
                "color": "#ff3b3b",
            },
            {
                "stage": "APPROVAL",
                "val": data[0].SUM_APPROVAL || 0,
                "color": "#1197f7",
            },
            {
                "stage": "SP3",
                "val": data[0].SUM_SP3 || 0,
                "color": "#ffd903",
            },
            {
                "stage": "AKAD",
                "val": data[0].SUM_AKAD || 0,
                "color": "#1197f7",
            },
            {
                "stage": "OTOR AKAD",
                "val": data[0].SUM_OTOR_AKAD || 0,
                "color": "#1197f7",
            },
            {
                "stage": "REVIEW",
                "val": data[0].SUM_REVIEW || 0,
                "color": "#ffd903",
            },
            {
                "stage": "OTOR REVIEW",
                "val": data[0].SUM_OTOR_REVIEW || 0,
                "color": "#ffd903",
            }
        ];

        console.log(chart.data)

        chart.padding(40, 40, 40, 40);

        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.dataFields.category = "stage";
        categoryAxis.renderer.minGridDistance = 60;
        // categoryAxis.fontSize = 18;
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
        // series.tooltip.background.fill = am4core.color("#CEB1BE");
        series.tooltip.background.propertyFields.stroke = "color";
        series.tooltip.autoTextColor = false;
        series.tooltip.label.fill = am4core.color("#000");
        series.tooltip.background.fillOpacity = 0;

        chart.cursor = new am4charts.XYCursor();

        return () => {
            chart.dispose();
        };
    }, [data]);

    return (
        <div className="w-full">
            <div ref={chartDivRef} className="w-full h-[30rem]" />
        </div>
    );
}
