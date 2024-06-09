// Intiating our global variables which will need access from many scopes
var SchoolGPARoot = null;
var SchoolStudentsRoot = null;
var SchoolStudentsArray = null;

// This function is responsible for generating guage chart (indicator) by take the unique part of chart div id as "name" 
function guage(name)
{
    var root = am5.Root.new(`${name}-rate-chart`);
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    var chart = root.container.children.push(
      am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: 180,
        endAngle: 360
      })
    );
    var axisRenderer = am5radar.AxisRendererCircular.new(root, {
      innerRadius: -10,
      strokeOpacity: 1,
      strokeWidth: 15,
      minGridDistance: 30,
      strokeGradient: am5.LinearGradient.new(root, {
        rotation: 0,
        stops: [
            { color: am5.color(0xfb7116) },
            { color: am5.color(0xf6d32b) },
            { color: am5.color(0xf4fb16) },
            { color: am5.color(0x19d228) },
        ]
      })
    });
    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: axisRenderer
      })
    );
    var axisDataItem = xAxis.makeDataItem({});
    axisDataItem.set("value", 0);
    var bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, {
      sprite: am5radar.ClockHand.new(root, {
        radius: am5.percent(99)
      })
    }));
    xAxis.createAxisRange(axisDataItem);
    axisDataItem.get("grid").set("visible", false);
    axisDataItem.animate({
        key: "value",
        to: parseFloat(document.getElementById(`${name}-rate`).value),
        duration: 3000,
        easing: am5.ease.out(am5.ease.cubic)
    });
    chart.appear(100, 100);
}

// This function is responsible for generating Male to Female ratio chart 
function maleToFemaleChart()
{
    var root = am5.Root.new("maleToFemaleChart");
    root.setThemes([
        am5themes_Animated.new(root)
    ]);
    var chart = root.container.children.push(am5percent.SlicedChart.new(root, {
        layout: root.verticalLayout
    }));
    var series = chart.series.push(am5percent.PictorialStackedSeries.new(root, {
        alignLabels: true,
        orientation: "vertical",
        valueField: "value",
        categoryField: "category",
        svgPath: "M53.5,476c0,14,6.833,21,20.5,21s20.5-7,20.5-21V287h21v189c0,14,6.834,21,20.5,21 c13.667,0,20.5-7,20.5-21V154h10v116c0,7.334,2.5,12.667,7.5,16s10.167,3.333,15.5,0s8-8.667,8-16V145c0-13.334-4.5-23.667-13.5-31 s-21.5-11-37.5-11h-82c-15.333,0-27.833,3.333-37.5,10s-14.5,17-14.5,31v133c0,6,2.667,10.333,8,13s10.5,2.667,15.5,0s7.5-7,7.5-13 V154h10V476 M61.5,42.5c0,11.667,4.167,21.667,12.5,30S92.333,85,104,85s21.667-4.167,30-12.5S146.5,54,146.5,42 c0-11.335-4.167-21.168-12.5-29.5C125.667,4.167,115.667,0,104,0S82.333,4.167,74,12.5S61.5,30.833,61.5,42.5z"
    }));
    series.labelsContainer.set("width", 100);
    series.ticks.template.set("location", 0.6);
    series.data.setAll([
        { value: parseInt(document.getElementById("femalesC").value), category: "Females" },
        { value: parseInt(document.getElementById("malesC").value), category: "Males" },
    ]);
    chart.appear(1000, 100);
}

// This function is helper function for SchoolGPAChart and it is responsible for generate GPA distribution histogram for selected school for the first time 
var StartSchoolGPAChart =  async () => {
    var response = await fetch(`/SchoolGPA/${document.getElementById("SchoolGPASelect").value}`);
    var json = await response.json();
    source = [];
    for (var i in json)
    {
        source.push(Math.round(parseInt(json[i][0]) * 100) / 100);
    }
    var maxCols = 3;
    var data = [];
    var min = Math.min.apply(null, source);
    var max = Math.max.apply(null, source);
    var range = max - min;
    var step = range / maxCols;
    for(var i = 0; i < maxCols; i++) {
        var from = min + i * step;
        var to = min + (i + 1) * step;
        data.push({
        from: from,
        to: to,
        count: 0
        });
    }
    for(var i = 0; i < source.length; i++) {
        var value = source[i];
        var item = data.find(function(el) {
            return (value >= el.from) && (value <= el.to);
        });
        item.count++;
    }
    SchoolGPARoot = am5.Root.new("SchoolGPAChart");
    SchoolGPARoot.setThemes([
        am5themes_Animated.new(SchoolGPARoot)
    ]);
    var chart = SchoolGPARoot.container.children.push(am5xy.XYChart.new(SchoolGPARoot, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: SchoolGPARoot.verticalLayout
    }));
    var legend = chart.children.push(
    am5.Legend.new(SchoolGPARoot, {
        centerX: am5.p50,
        x: am5.p50
    })
    );
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(SchoolGPARoot, {
        categoryField: "from",
        renderer: am5xy.AxisRendererX.new(SchoolGPARoot, {
            minGridDistance: 30
        }),
        tooltip: am5.Tooltip.new(SchoolGPARoot, {})
    }));
    xAxis.data.setAll(data);
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(SchoolGPARoot, {
        maxPrecision: 0,
        renderer: am5xy.AxisRendererY.new(SchoolGPARoot, {})
    }));
    var series = chart.series.push(am5xy.ColumnSeries.new(SchoolGPARoot, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "from"
    }));
    series.columns.template.setAll({
        tooltipText: "{categoryX}: {valueY} Students",
        width: am5.percent(90),
        tooltipY: 0,
        width: am5.p100
    });
    series.bullets.push(function () {
        return am5.Bullet.new(SchoolGPARoot, {
            locationY: 0.5,
            sprite: am5.Label.new(SchoolGPARoot, {
            text: "{valueY}",
            fill: SchoolGPARoot.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
            })
        });
    });
    series.data.setAll(data);
    series.appear();
    chart.appear(1000, 100);
}

// This function is helper function for SchoolGPAChart and it is responsible for update GPA distribution histogram for the new selected school
var UpdateSchoolGPAChart =  async () => {
    var response = await fetch(`/SchoolGPA/${document.getElementById("SchoolGPASelect").value}`);
    var json = await response.json();
    source = [];
    for (var i in json)
    {
        source.push(Math.round(parseInt(json[i][0]) * 100) / 100);
    }
    var maxCols = 3;
    var data = [];
    var min = Math.min.apply(null, source);
    var max = Math.max.apply(null, source);
    var range = max - min;
    var step = range / maxCols;
    for(var i = 0; i < maxCols; i++) {
        var from = min + i * step;
        var to = min + (i + 1) * step;
        data.push({
        from: from,
        to: to,
        count: 0
        });
    }
    for(var i = 0; i < source.length; i++) {
        var value = source[i];
        var item = data.find(function(el) {
            return (value >= el.from) && (value <= el.to);
        });
        item.count++;
    }
    SchoolGPARoot.container.children.pop();
    var chart = SchoolGPARoot.container.children.push(am5xy.XYChart.new(SchoolGPARoot, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: SchoolGPARoot.verticalLayout
    }));
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(SchoolGPARoot, {
        categoryField: "from",
        renderer: am5xy.AxisRendererX.new(SchoolGPARoot, {
            minGridDistance: 30
        }),
        tooltip: am5.Tooltip.new(SchoolGPARoot, {})
    }));
    xAxis.data.setAll(data);
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(SchoolGPARoot, {
        maxPrecision: 0,
        renderer: am5xy.AxisRendererY.new(SchoolGPARoot, {})
    }));
    var series = chart.series.push(am5xy.ColumnSeries.new(SchoolGPARoot, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "from"
    }));
    series.columns.template.setAll({
        tooltipText: "{categoryX}: {valueY} Students",
        width: am5.percent(90),
        tooltipY: 0,
        width: am5.p100
    });
    series.bullets.push(function () {
        return am5.Bullet.new(SchoolGPARoot, {
            locationY: 0.5,
            sprite: am5.Label.new(SchoolGPARoot, {
            text: "{valueY}",
            fill: SchoolGPARoot.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
            })
        });
    });
    series.data.setAll(data);
    series.appear();
    chart.appear(1000, 100);
}

// This function is responsible for calling StartSchoolGPAChart to generate GPA distribution histogram for the first time 
// and adding event listener to selection box so on its change the UpdateSchoolGPAChart function is called to update histogram
function SchoolGPAChart()
{
    StartSchoolGPAChart();
    document.getElementById("SchoolGPASelect").addEventListener('change', UpdateSchoolGPAChart);
}

// This function is responsible for generating the multiple series vertical barplot which display the count and revenue of each research field
var ResearchChart = async() => {
    var response = await fetch("/FetchResearchData");
    var json = await response.json();
    data = [];
    for (var i in json)
    {
        data.push({field: json[i][0], revenue: Math.round(json[i][2] / 100_000), count: json[i][1]});
    }
    var root = am5.Root.new("research-chart");
    root.setThemes([
        am5themes_Animated.new(root)
    ]);
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft:0,
        layout: root.verticalLayout
    }));
    var legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50
    }));
    var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "field",
        renderer: am5xy.AxisRendererY.new(root, {
            inversed: true,
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
            minorGridEnabled: true
        })
    }));
    yAxis.data.setAll(data);
    var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
            strokeOpacity: 0.1,
            minGridDistance: 50
        }),
        min: 0
    }));
    function createSeries(field, name, sign="Researches", sign2="") {
        var series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: name,
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: field,
            categoryYField: "field",
            sequencedInterpolation: true,
            tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: `[bold]{name}[/]\n{categoryY}: ${sign2}{valueX} ${sign}`,
            })
        }));
        series.columns.template.setAll({
            height: am5.p100,
            strokeOpacity: 0
        });
        series.bullets.push(function () {
            return am5.Bullet.new(root, {
            locationX: 1,
            locationY: 0.5,
            sprite: am5.Label.new(root, {
                fontSize: 10,
                centerY: am5.p50,
                text: `${sign2}{valueX} ${sign}`,
                populateText: true
            })
            });
        });
        series.bullets.push(function () {
            return am5.Bullet.new(root, {
            locationX: 1,
            locationY: 0.5,
            sprite: am5.Label.new(root, {
                fontSize: 10,
                centerX: am5.p100,
                centerY: am5.p50,
                text: "{name}",
                fill: am5.color(0xffffff),
                populateText: true
            })
            });
        });
        series.data.setAll(data);
        series.appear();
        return series;
    }
    createSeries("revenue", "Revenue", "K", "$");
    createSeries("count", "Count");
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        behavior: "zoomY"
    }));
    cursor.lineY.set("forceHidden", true);
    cursor.lineX.set("forceHidden", true);
    chart.appear(1000, 100);
}

// This function is helper function for SchoolStudentChart and it is responsible for generating School students ratio donut chart for the first time
var StartSchoolStudentsChart =  async () => {
    var response = await fetch("/FetchSchoolStudentsData");
    var json = await response.json();
    source = [];
    for (var i in json)
    {
        if (json[i][0] == "Computional Science And Artificial Intelligence")
        {
            json[i][0] = "CSAI";
        }
        source.push({school: json[i][0], count: json[i][1]});
    }
    SchoolStudentsArray = source;
    SchoolStudentsRoot = am5.Root.new("SchoolStudentsChart");
    SchoolStudentsRoot.setThemes([
        am5themes_Animated.new(SchoolStudentsRoot)
    ]);
    var chart = SchoolStudentsRoot.container.children.push(am5percent.PieChart.new(SchoolStudentsRoot, {
        layout: SchoolStudentsRoot.horizontalLayout,
        innerRadius: am5.percent(50)
    }));
    var series = chart.series.push(am5percent.PieSeries.new(SchoolStudentsRoot, {
        valueField: "count",
        categoryField: "school",
    }));
    series.data.setAll(source);
    series.appear(1000, 100);
}

// This function is helper function for SchoolStudentsChart and it is responsible for update School students ratio donut chart for the new selected year
var UpdateSchoolStudentsChart =  async () => {
    SchoolStudentsRoot.container.children.pop();
    var selection = document.getElementById("SchoolStudentsSelect").value;
    if (selection == 0)
    {
        var chart = SchoolStudentsRoot.container.children.push(am5percent.PieChart.new(SchoolStudentsRoot, {
            layout: SchoolStudentsRoot.horizontalLayout,
            innerRadius: am5.percent(50)
        }));
        var series = chart.series.push(am5percent.PieSeries.new(SchoolStudentsRoot, {
            valueField: "count",
            categoryField: "school",
        }));
        series.data.setAll(SchoolStudentsArray);
        series.appear(1000, 100);
    }
    else {
        var source2 = [];
        for (var i in SchoolStudentsArray)
        {
            var response =  await fetch(`/FetchSchoolStudentsData/${selection}/${parseInt(i) + 1}`);
            console.log(response);
            var json = await response.json();
            source2.push({school: SchoolStudentsArray[i].school, count: json[0][0]});
        }
        var chart = SchoolStudentsRoot.container.children.push(am5percent.PieChart.new(SchoolStudentsRoot, {
            layout: SchoolStudentsRoot.horizontalLayout,
            innerRadius: am5.percent(50)
        }));
        var series = chart.series.push(am5percent.PieSeries.new(SchoolStudentsRoot, {
            valueField: "count",
            categoryField: "school",
        }));
        series.data.setAll(source2);
        series.appear(1000, 100);
    }
}

// This function is responsible for calling StartSchoolStudentsChart to generate School students ratio donut chart for the first time 
// and adding event listener to selection box so on its change the UpdateSchoolStudentsChart function is called to update the donut chart
function SchoolStudentsChart()
{
    StartSchoolStudentsChart();
    document.getElementById("SchoolStudentsSelect").addEventListener('change', UpdateSchoolStudentsChart);   
}

// This function is responsible for generating the rank development multiple series xy chart 
var RankDevelopChart = async () => {
    var response = await fetch("/FetchRanks");
    var json = await response.json();
    data = [];
    for (var i in json)
    {
        data.push({year: json[i][0], national: json[i][1], international: json[i][2]})
    }
    var root = am5.Root.new("rankDevChart");
    root.setThemes([
        am5themes_Animated.new(root)
    ]);
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        maxTooltipDistance: 0,
        pinchZoomX:true
    }));
    var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        min: 2005,
        max: 2023,
        strictMinMaxSelection: true,
        renderer: am5xy.AxisRendererX.new(root, {
            minorGridEnabled: true
        }),
        tooltip: am5.Tooltip.new(root, {})
    }));
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {inversed: true})
    }));
    var series = chart.series.push(am5xy.LineSeries.new(root, {
        name: "National",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "national",
        valueXField: "year",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}"
        })
    }));
    series.data.setAll(data);
    series = chart.series.push(am5xy.LineSeries.new(root, {
        name: "International",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "international",
        valueXField: "year",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
        })
    }));
    series.data.setAll(data);
    series.appear();
    var legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {
        height: am5.percent(100)
    }));
    legend.itemContainers.template.events.on("pointerover", function(e) {
        var itemContainer = e.target;
        var series = itemContainer.dataItem.dataContext;
        chart.series.each(function(chartSeries) {
            if (chartSeries != series) {
            chartSeries.strokes.template.setAll({
                strokeOpacity: 0.15,
                stroke: am5.color(0x000000)
            });
            } else {
            chartSeries.strokes.template.setAll({
                strokeWidth: 3
            });
            }
        })
    })
    legend.itemContainers.template.events.on("pointerout", function(e) {
        var itemContainer = e.target;
        var series = itemContainer.dataItem.dataContext;

        chart.series.each(function(chartSeries) {
            chartSeries.strokes.template.setAll({
            strokeOpacity: 1,
            strokeWidth: 1,
            stroke: chartSeries.get("fill")
            });
        });
    });
    legend.itemContainers.template.set("width", am5.p100);
    legend.data.setAll(chart.series.values);
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        behavior: "none"
    }));
    root.numberFormatter.setAll({
        numberFormat: "####",
        numericFields: ["valueX"]
    });
    cursor.lineY.set("visible", false);
    chart.appear(1000, 100);
}

// This part call all functions that generate charts when the am5 is ready
am5.ready(function() {
    guage("acceptance");
    guage("enrollment");
    guage("graduation");
    maleToFemaleChart();
    SchoolGPAChart();
    ResearchChart();
    SchoolStudentsChart();
    RankDevelopChart();
}); 