import React, {useEffect} from "react"
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

const HistoryChart = (props) => {
    useEffect(() => {
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        chart.paddingRight = 20;

        let data = [];
        // let visits = 10;
        // for (let i = 1; i < 366; i++) {
        //     visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
        //     data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
        // }
        console.log("Length:", props.results.length)
        for (let i = 0; i <  props.results.length; i++ ) {
            data.push({ timestamp: Date.parse(props.results[i].timestamp), 
                download: (props.results[i].download/1e6).toFixed(3),
                upload: (props.results[i].upload/1e6).toFixed(3)})
            //console.log("timestamp", Date.parse(props.results[i].timestamp), "download", (props.results[i].download/1e6).toFixed(3))
        }

        chart.data = data;

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.title.text = "Time"

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.title.text = "Speed (Mb/s)"

        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "timestamp";
        series.dataFields.valueY = "download";
        series.name = "Download"
        series.strokeWidth = 2
        series.tooltipText = "Download: {valueY.value}";

        let series2 = chart.series.push(new am4charts.LineSeries());
        series2.dataFields.dateX = "timestamp";
        series2.dataFields.valueY = "upload";
        series2.name = "Upload"
        series2.strokeWidth = 2
        series2.tooltipText = "Upload: {valueY.value}";

        chart.cursor = new am4charts.XYCursor();

        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(series);
        chart.scrollbarX = scrollbarX;

        chart.legend = new am4charts.Legend();

        // Add an export menu to the chart
        chart.exporting.menu = new am4core.ExportMenu()

        return () => {
            if (chart) {
                chart.dispose()
            }
        }
    }, [props.results])

    return (
        <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    )
}

export default HistoryChart