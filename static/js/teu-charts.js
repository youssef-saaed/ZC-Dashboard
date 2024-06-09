// Intiating our global variable which will need access from many scopes
var GPAChartRoot = null;

// This function is responsible for reading the selection boxes of semester and school and return an object has school_id, year and semester
function getInput() {
    var school_id = document.getElementById('SchoolGPASelect').value;
    var year = document.getElementById('SemesterGPASelect').value;
    var semester = year % 10;
    year = Math.trunc(year / 10);
    return {school_id: school_id, year: year, semester: semester}
}

// This function is helper function for SchoolSemesterGPAChart and it is responsible for generate GPA distribution histogram for selected school and semester for the first time 
var StartSchoolSemesterGPAChart = async () => {
    var input = getInput();
    var response = await fetch(`/FetchGPAs/${input.school_id}/${input.year}/${input.semester}`);
    var json = await response.json();
    source = [];
    for (var i in json)
    {
        source.push(json[i][0]);
    }

    var maxCols = 10;
    function getHistogramData(source) {
        if (source.length == 0)
        {
            return [{from: 0, to: 0, count: 0}];
        }
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
        
        return data;
    }
    var data = getHistogramData(source);

    GPAChartRoot = am5.Root.new("SchoolSemesterGPAChart");
    GPAChartRoot.setThemes([
        am5themes_Animated.new(GPAChartRoot)
    ]);
    var chart = GPAChartRoot.container.children.push(am5xy.XYChart.new(GPAChartRoot, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: GPAChartRoot.verticalLayout
    }));
    var legend = chart.children.push(
        am5.Legend.new(GPAChartRoot, {
            centerX: am5.p50,
            x: am5.p50
        })
    );
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(GPAChartRoot, {
        categoryField: "from",
        renderer: am5xy.AxisRendererX.new(GPAChartRoot, {
            minGridDistance: 30
        }),
        tooltip: am5.Tooltip.new(GPAChartRoot, {})
    }));
    xAxis.data.setAll(data);
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(GPAChartRoot, {
        maxPrecision: 0,
        renderer: am5xy.AxisRendererY.new(GPAChartRoot, {})
    }));
    var series = chart.series.push(am5xy.ColumnSeries.new(GPAChartRoot, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "from"
    }));
    series.columns.template.setAll({
        tooltipText: ">{categoryX}: {valueY} Students",
        width: am5.percent(90),
        tooltipY: 0,
        width: am5.p100
    });
    series.bullets.push(function () {
        return am5.Bullet.new(GPAChartRoot, {
            locationY: 0.5,
            sprite: am5.Label.new(GPAChartRoot, {
            text: "{valueY}",
            fill: GPAChartRoot.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
            })
        });
    });
    series.data.setAll(data);
    series.appear();
    chart.appear(100, 100);
}

// This function is helper function for SchoolSemesterGPAChart and it is responsible for update GPA distribution histogram for the new selected school or semester
var UpdateSchoolSemesterGPAChart = async () => {
    var input = getInput();
    var response = await fetch(`/FetchGPAs/${input.school_id}/${input.year}/${input.semester}`);
    var json = await response.json();
    source = [];
    for (var i in json)
    {
        source.push(json[i][0]);
    }

    var maxCols = 10;
    function getHistogramData(source) {
        if (source.length == 0)
        {
            return [{from: 0, to: 0, count: 0}];
        }
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
        
        return data;
    }
    var data = getHistogramData(source);

    GPAChartRoot.container.children.pop();
    var chart = GPAChartRoot.container.children.push(am5xy.XYChart.new(GPAChartRoot, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: GPAChartRoot.verticalLayout
    }));
    var legend = chart.children.push(
        am5.Legend.new(GPAChartRoot, {
            centerX: am5.p50,
            x: am5.p50
        })
    );
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(GPAChartRoot, {
        categoryField: "from",
        renderer: am5xy.AxisRendererX.new(GPAChartRoot, {
            minGridDistance: 30
        }),
        tooltip: am5.Tooltip.new(GPAChartRoot, {})
    }));
    xAxis.data.setAll(data);
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(GPAChartRoot, {
        maxPrecision: 0,
        renderer: am5xy.AxisRendererY.new(GPAChartRoot, {})
    }));
    var series = chart.series.push(am5xy.ColumnSeries.new(GPAChartRoot, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "from"
    }));
    series.columns.template.setAll({
        tooltipText: ">{categoryX}: {valueY} Students",
        width: am5.percent(90),
        tooltipY: 0,
        width: am5.p100
    });
    series.bullets.push(function () {
        return am5.Bullet.new(GPAChartRoot, {
            locationY: 0.5,
            sprite: am5.Label.new(GPAChartRoot, {
            text: "{valueY}",
            fill: GPAChartRoot.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true
            })
        });
    });
    series.data.setAll(data);
    series.appear();
    chart.appear(100, 100);
}

// This function take a function as an argument and link it with the change of school and semester selection boxes
function linkFunctionToInput(func)
{
    document.getElementById('SchoolGPASelect').addEventListener('change', func);
    document.getElementById('SemesterGPASelect').addEventListener('change', func);
}

// This function is responsible for calling StartSchoolSemesterGPAChart to generate GPA distribution histogram for the first time 
// and link UpdateSchoolSemesterGPAChart to selection box so on its change the histogram is updated
function SchoolSemesterGPAChart()
{
    StartSchoolSemesterGPAChart();
    linkFunctionToInput(UpdateSchoolSemesterGPAChart);
}

// This function is responsible for Generate and Update Top instructor section according to selected school and semester
var UpdateTopInstructors = async () => {
    var input = getInput();
    var response = await fetch(`/FetchTopInstructors/${input.school_id}/${input.year}/${input.semester}`)
    var json = await response.json();
    var cont = document.getElementById("instructorsContainer");
    cont.innerHTML = "";
    for (var i in json)
    {
        cont.innerHTML += `
            <div class="d-flex justify-content-between p-2 border bg-gray w-100 align-items-center p-3 rounded mt-1">
                <p class="p-0 m-0">${json[i][0] == 0 ? "Prof. " : "Eng. "}${json[i][1]}</p>
                <p class="p-0 m-0">${Math.round(json[i][2] * 10) / 10}</p>
            </div>
        `;
    }
}

// These 2 lines call UpdateTopInstructors function to generate top instructors section for the first time
// and then link it to selection boxes change so it update the section interactively  
UpdateTopInstructors();
linkFunctionToInput(UpdateTopInstructors);

// This part call the function that generates the chart when the am5 is ready
am5.ready(function() {
    SchoolSemesterGPAChart();
}); 