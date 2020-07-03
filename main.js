const formatPay = d3.format(",d")
const formatTime = d3.timeFormat("%Y-%m")
const parseTime = d3.timeParse("%Y-%m")

const rowConverterData = function(d) {

    keys = Object.keys(d)

    keys.forEach(function(key) {
        if (key === "visit_month") {
            // d[key] = parseTime(d[key])
        } else if (isNaN(parseFloat(d[key])) == false) {
            d[key] = +d[key]
        } else if (d[key] === "") {
            d[key] = NaN
        }
    })

    return d

}


const drawHospBars = function(data, reset = false) {


    var w = 200;
    var h = 150;
    var padding = 25;

    let xScaleLoad = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['n_visits'])])
        .range([0, w])

    let xScalePayment = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['sum'])])
        .range([0, w])

    // wrap x scales into one
    let xScale = {
        'sum': xScalePayment,
        'n_visits': xScaleLoad
    }

    let yScaleHospital = d3.scaleBand()
        .domain(data.map(d => (d['legal_entity_name'])))
        .range([padding, h - padding])
        .paddingInner(1)
        // .paddingOuter(0.3)
        // .padding(0.5)


    let columns = ['legal_entity_name', 'n_visits', 'sum']
    let tbody = d3.select("div.tbody")



    if (reset) {
        // visits
        tbody.select("div#n_visits").select("svg").selectAll("rect")
            .data(data)
            .transition().duration(800).attr("width", 0)
            .transition().duration(800).attr("width", d => xScale["n_visits"](d['n_visits']))

        tbody.select("div#n_visits").select("svg").selectAll("text").data(data)
            .transition().duration(800).attr("opacity", 0)
            .transition().duration(400).attr("x", d => xScale["n_visits"](d["n_visits"]) + 17)
            .transition().duration(800).text(d => formatPay(Math.round(d["n_visits"])))
            .attr("opacity", 1)

        // payments
        tbody.select("div#sum").select("svg").selectAll("rect")
            .data(data)
            .transition().duration(800).attr("width", 0)
            .transition().duration(800).attr("width", d => xScale["sum"](d['sum']))

        tbody.select("div#sum").select("svg").selectAll("text").data(data)
            .transition().duration(800).attr("opacity", 0)
            .transition().duration(400).attr("x", d => xScale["sum"](d["sum"]) + 17)
            .transition().duration(800).text(d => formatPay(Math.round(d["sum"])))
            .attr("opacity", 1)

        // hospital names
        tbody.select("div#legal_entity_name").select("svg").selectAll("text")
            .data(data)
            .transition().duration(800).attr("opacity", 0)
            .transition().duration(800).text(d => "#" + d["legal_entity_name"].slice(110, 111))
            .attr("opacity", 1)


    } else {


        columns.forEach(function(col) {

            svg = tbody.append("div").attr("class", "column-content").attr("id", col).append("svg")
                .style("height", h)
                .style("width", "100%")
            if (col !== 'legal_entity_name') {
                svg.selectAll("rect").data(data).enter().append("g").append("rect")
                    .attr("width", 0)
                    // .attr("width", d => xScale[col](d[col]))
                    .attr("height", 20)
                    .attr("y", d => yScaleHospital(d['legal_entity_name']) - 15)
                    .attr("x", padding)
                    .attr("transform", (d, i) => "translate(" + 0 + "," + (i * 5) + ")")
                    .append("title")
                    .text(function(d) {
                        return formatPay(d[col]).toString().replace(/,/g, " ")
                    });

                svg.selectAll("rect").transition()
                    .duration(1500)
                    .attr("width", d => xScale[col](d[col]))

                svg.selectAll("g")
                    .data(data)
                    .append("text")
                    .text(d => formatPay(Math.round(d[col])).toString().replace(/,/g, " "))
                    .style("font-size", "10")
                    .attr("x", d => xScale[col](d[col]) + 17)
                    .attr("y", d => yScaleHospital(d['legal_entity_name']))
                    .attr("text-anchor", "end")
                    .attr("transform", (d, i) => "translate(" + 0 + "," + (i * 5) + ")")
                    .attr("opacity", 0)

                svg.selectAll("g").selectAll("text")
                    .transition()
                    .duration(2500)
                    .attr("opacity", 1)


            } else {
                svg.selectAll("g").data(data).enter()
                    .append("g")
                    .append("text")
                    .attr("x", 150)
                    .attr("y", d => yScaleHospital(d[col]))
                    .text(d => "№" + d[col].slice(110, 111))
                    .style("font-size", "12")
                    .attr("transform", (d, i) => "translate(" + 0 + "," + (i * 5) + ")")
                    .attr("text-anchor", "end")
            }

        })

    }






}



const drawHospitalStats = function() {

    d3.csv("mariupol_data_analysis/hosp_stats_wide.csv", rowConverterData).then(function(data) {

        // console.log(data)

        // d3.select("div#container").append("div").attr("class", "hospital-stats")

        // d3.selectAll("div.hospital-stats")
        d3.select("div.bar-chart")
            // .append("div").attr("class", "bar-chart")
            .call(header => header
                .call(function(tr) {
                    tr.append("div").attr("class", "table-header")
                        .call(th => th.append("div").attr("class", "column-header").attr("id", "legal_entity_name").append("text").text("Центр первинної медико-санітарної допомоги"))
                        .call(th => th.append("div").attr("class", "column-header").attr("id", "last_month").append("text").text("Кількість прийомів в місяць"))
                        .call(th => th.append("div").attr("class", "column-header").attr("id", "last_month").append("text").text("Державне фінансування, грн"))
                })


            )
            .call(tbody => tbody.append("div").attr("class", "tbody"))



        // slider

        defaultData = data.filter(d => d["visit_month"] === "2019-12")

        // console.log(defaultData)

        dataTime = d3.nest()
            .key(function(d) { return d['visit_month'] })
            .entries(data)


        var dataTime = dataTime.map(function(d) {
            return parseTime(d['key'])
        });


        var sliderTime = d3.sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365 / 12)
            .width(500)
            .tickFormat(d3.timeFormat('%Y-%m'))
            .tickValues(dataTime)
            .default(d3.max(dataTime))
            .on('onchange', val => {
                monthToFilter = d3.timeFormat('%Y-%m')(val)

                filteredData = data.filter(d => d["visit_month"] === monthToFilter)

                drawHospBars(filteredData, reset = true)

                // d3.select('p#value-time').text("Період: " + d3.timeFormat('%Y-%m')(val));
            });

        var gTime = d3
            // .select('div#slider-time')
            .select('div.slider-body')
            .append('svg')
            // .attr('width', 550)
            // .attr('height', 70)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);

        d3.select('p#value-time').text("Період: " + d3.timeFormat('%Y-%m')(sliderTime.value()));



        drawHospBars(defaultData, reset = false)





    })


}

drawHospitalStats()



// BEESWARM

const drawBeeSwarm = function() {
    // instead of week_load_hospitals.csv
    d3.csv("mariupol_data_analysis/week_load_hosp_wide.csv", rowConverterData).then(function(data) {

        let columnColorGlobal = "Заклад"
        let circleId

        colors = ["#C98BBC", "#BFD890", "#FFDB54", "#AC468A", "#2678bd", "#B5C4E6"]
        colorScale = d3.scaleOrdinal()
            .domain(data, d => d["Заклад"])
            .range(colors)


        svgArea = document.querySelector(".svg-area")
        widthSvg = svgArea.getBoundingClientRect().width - 5
        heightSvg = svgArea.getBoundingClientRect().height - 5

        var svg =
            // d3.select("div#beeswarm-chart").append("svg")
            d3.select("div.svg-area").append("svg")
            .attr("width", widthSvg)
            .attr("height", heightSvg),
            margin = { top: 15, right: 25, bottom: 15, left: 10 },
            width = svg.attr("width") - margin.left - margin.right,
            // height = svg.attr("height") - margin.top - margin.bottom;
            height = svg.attr("height")

        var formatValue = d3.format(",d");

        var x = d3.scaleLinear()
            .rangeRound([0, width])

        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + (margin.top + 20) + ")");
        // .attr("transform", "translate(" + margin.left + ", 0)")


        x.domain(d3.extent(data, function(d) { return d.patients_per_week; }));

        var simulation = d3.forceSimulation(data)
            .force("x", d3.forceX(function(d) { return x(d.patients_per_week); }).strength(1))
            .force("y", d3.forceY(height / 3))
            .force("collide", d3.forceCollide(6))
            .stop();

        for (var i = 0; i < 120; ++i) simulation.tick();

        g.append("g")
            .attr("class", "axis axis--x")
            .call(d3.axisTop(x).ticks(9, ".0s").tickSizeOuter(0))
            .attr("transform", "translate(0, 235)")

        var cell = g.append("g")
            .attr("class", "cells")
            .selectAll("g").data(d3.voronoi()
                .extent([
                    [-margin.left, -margin.top],
                    [width + margin.right, height + margin.top]
                ])
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .polygons(data)).enter().append("g");

        cell.append("circle")
            .attr("id", (d, i) => "c" + i)
            .attr("r", 4)
            .style("fill", d => colorScale(d.data["Заклад"]))
            // .attr("fill", d => console.log(d.data["Заклад"]))
            .attr("cx", function(d) { return d.data.x; })
            .attr("cy", function(d) { return d.data.y; });

        cell.append("path")
            .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

        cell.append("title")
            .text(function(d) { return d.data.corrected_names + "\n" + formatValue(d.data.patients_per_week); });



        // compute mean
        let perWeekVals = data.map(row => row.patients_per_week)

        let averagePerWeek = perWeekVals.reduce(function(sum, value) {
            return sum + value
        }, 0) / data.length



        svg.append("text").text("Більше прийомів")
            .attr("y", 285).attr("x", margin.left)
            .attr("font-size", 14)

        svg.append("text").text("Менше приймоів")
            .attr("y", 285).attr("x", width)
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("font-size", 14)
            .attr("text-anchor", "end")

        svg.append("text").text("Кожна точка — один лікар.")
            .attr("x", margin.left).attr("y", margin.top)
            // .attr("transform", "translate(110 -15)")
            .attr("font-size", 11)
            .attr("text-anchor", "start")

        svg.append("text").text("Натисніть, щоб отримати")
            .attr("x", margin.left).attr("y", margin.top + 15)
            // .attr("transform", "translate(-70 -35)")
            .attr("font-size", 11)
            .attr("text-anchor", "start")

        svg.append("text").text("інформацію про лікаря")
            .attr("x", margin.left).attr("y", margin.top + 30)
            // .attr("transform", "translate(-40 -15)")
            .attr("font-size", 11)
            .attr("text-anchor", "start")



        svg.append("line")
            .attr("x1", x(averagePerWeek))
            .attr("x2", x(averagePerWeek))
            .attr("y1", 0)
            .attr("y2", 250)
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("opacity", 0.6)
            .attr("stroke-dasharray", ("7, 7"))
            .attr("transform", "translate(" + margin.left + ",0)")




        doctorNames = data.map(d => d['corrected_names'])

        d3.select("div#search-box").select("datalist")
            .selectAll("option").data(doctorNames).enter()
            .append("option")
            .attr("value", d => d)


        // making legend
        legendKeys = d3.nest()
            .key(function(d) { return d['Заклад'] })
            .entries(data)


        legendOrder = [
            'Комунальне некомерційне підприємство "Центр первинної медико-санітарної допомоги № 1"',
            'Комунальне некомерційне підприємство "Центр первинної медико-санітарної допомоги № 2"',
            'Комунальне некомерційне підприємство "Центр первинної медико-санітарної допомоги № 3"',
            'Комунальне некомерційне підприємство "Центр первинної медико-санітарної допомоги № 4"',
            'Комунальне некомерційне підприємство "Центр первинної медико-санітарної допомоги № 5"',
            legendKeys.slice(-1)[0]['key']

        ]

        legendKeys.sort(function(a, b) {
            return legendOrder.map(row => row).indexOf(a['key']) - legendOrder.map(row => row).indexOf(b['key']);
        });

        legend = d3.select(".legend-markers")

        circleLegend = legend.selectAll(".circleLegend").data(legendKeys)
            .enter().append("div")
            .attr("class", "circleLegend")
            .attr("id", (d, i) => i)
            // .attr("transform", function(d, i) {
            //     return "translate(" + (w - 40) + "," + (i * 20) + ")";
            // })
        circleLegend.append("svg")
            .attr("width", 20)
            .attr("height", 20)
            .style("margin-right", 5)
            .append("circle")
            .attr("r", 5)
            .attr("cx", 10)
            .attr("cy", 10)
            .style("fill", d => colorScale(d['key']))
            .attr("width", "100%").attr("height", "100%")
            .attr("transform", "translate(0 5)")


        circleLegend.append("text")
            .text(d => (d['key'].length === 85) ? d['key'].slice(80, 84) : d['key'].slice(64))




        d3.select("div#search-box").select("input").on("change", function() {
            // first - reset colors
            // d3.select("div.svg-area").selectAll("circle").style("fill", "#2878BC")
            d3.select("div.svg-area").selectAll("circle").data(data).style("fill", d => colorScale(d[columnColorGlobal]))

            searchQuery = this.value

            gList = d3.select("div.svg-area").select("svg")
                .selectAll("g.cells").selectAll("g")

            let selectedDoctor

            gList.each(function(d) {
                if (d.data.corrected_names === searchQuery) {

                    selectedDoctor = d3.select(this)
                    circleId = this.childNodes[0].id
                }
            })

            if (selectedDoctor !== undefined) {
                selectedDoctor.select("circle").style("fill", "yellow")

                circleLocX = selectedDoctor.select("circle").attr("cx")
                circleLocY = selectedDoctor.select("circle").attr("cy")


                doctorData = d3.nest()
                    .key(function(d) { return d['Заклад'] })
                    .key(function(d) { return d['Спеціальність'] })
                    .entries(data.filter(d => (d['corrected_names'] === searchQuery)))


                docLoad = doctorData[0].values[0].values[0].patients_per_week
                difference = docLoad / averagePerWeek - 1

                // console.log(difference)

                docObject = {
                    name: searchQuery,
                    hospital: doctorData[0].key,
                    spec: doctorData[0].values[0].key,
                    diff: difference
                }




                createPopupChart(searchQuery = docObject, first = false)
                    // createBars(searchQuery)


            }

        })


        d3.select("div.svg-area").selectAll("g.cells").selectAll("circle").on("mouseover", function() {

            circleId = this.id

            d3.select("div.svg-area").select("circle#" + circleId)
                // .transition().duration(500)
                .style("r", 7)

        })


        d3.select("div.svg-area").selectAll("g.cells").selectAll("circle").on("mouseout", function() {

            circleId = this.id

            d3.select("div.svg-area").select("circle#" + circleId)
                .transition().duration(500)
                .style("r", 4)

        })

        d3.select("div.svg-area").selectAll("circle").on("click", function() {

            circleId = this.id
            d3.select("div.svg-area").select("circle#" + circleId)
                .style("r", 9)
                .transition().duration(500)
                .style("r", 4)

            docFromCircle = this.parentNode.getElementsByTagName("title")[0].textContent.split('\n')[0]
            searchField = d3.select("div#search-box").select("input")._groups[0][0]
            searchField['value'] = docFromCircle


            // d3.select("div.svg-area").selectAll("circle").style("fill", "#2878BC")
            d3.select("div.svg-area").selectAll("circle").data(data).style("fill", d => colorScale(d[columnColorGlobal]))
            gList = d3.select("div.svg-area").select("svg")
                .selectAll("g.cells").selectAll("g")

            let selectedDoctor

            gList.each(function(d) {
                if (d.data.corrected_names === docFromCircle) {
                    selectedDoctor = d3.select(this)
                    circleId = this.childNodes[0].id
                }
            })

            if (selectedDoctor !== undefined) {
                selectedDoctor.select("circle").style("fill", "yellow")

                circleLocX = selectedDoctor.select("circle").attr("cx")
                circleLocY = selectedDoctor.select("circle").attr("cy")


                doctorData = d3.nest()
                    .key(function(d) { return d['Заклад'] })
                    .key(function(d) { return d['Спеціальність'] })
                    .entries(data.filter(d => (d['corrected_names'] === docFromCircle)))

                docLoad = doctorData[0].values[0].values[0].patients_per_week

                // console.log(docLoad)
                // console.log(averagePerWeek)

                difference = docLoad / averagePerWeek - 1

                // console.log(difference)

                docObject = {
                    name: docFromCircle,
                    hospital: doctorData[0].key,
                    spec: doctorData[0].values[0].key,
                    diff: difference
                }





                // console.log(doctorData)

                createPopupChart(searchQuery = docObject, first = false)
                    // createBars(docFromCircle)


            }


        })

        // sliderStatus = {
        //     hospital: true,
        //     specialization: false
        // }

        buttonStatus = {
            "hospital": true,
            "doc-spec": false
        }



        d3.selectAll(".bee-button").on("click", function() {
            buttonId = this.id

            d3.select(".selected-button").classed("selected-button", false)
            d3.select("#" + buttonId).classed("selected-button", true)

            // let toFilter

            // Object.keys(sliderStatus).forEach(function(key) {

            //     sliderStatus[key] = !sliderStatus[key]

            //     if (sliderStatus[key]) {
            //         toFilter = key

            //     }

            //     selected = Array.from(document.getElementsByName(key))[0]
            //     selected["checked"] = sliderStatus[key]

            // })


            // column = (toFilter === "hospital") ? "Заклад" : "Спеціальність"
            column = (buttonId === "hospital") ? "Заклад" : "Спеціальність"

            columnColorGlobal = column


            colorScale = d3.scaleOrdinal()
                .domain(data, d => d[column])
                .range(colors)

            d3.select(".svg-area").select("svg").selectAll("circle")
                .data(data)
                .transition().duration(800)
                // .attr("fill", d => console.log(colorScale(d[column]), column))
                .style("fill", function(d, i) {
                    if (circleId) {
                        if (i === parseInt(circleId.slice(1))) {
                            return "yellow"
                        } else {
                            return colorScale(d[column])
                        }
                    } else {
                        return colorScale(d[column])
                    }

                })
                // .style("fill", d => colorScale(d[column]))


            d3.selectAll(".circleLegend")
                .transition().duration(500)
                .style("opacity", 0).remove()


            legendKeys = d3.nest()
                .key(function(d) { return d[column] })
                .entries(data)

            if (buttonId == "hospital") {
                legendKeys.sort(function(a, b) {
                    return legendOrder.map(row => row).indexOf(a['key']) - legendOrder.map(row => row).indexOf(b['key']);
                });
            }


            legend = d3.select(".legend-markers")

            const redrawLegend = function() {
                circleLegend = legend.selectAll(".circleLegend").data(legendKeys)
                    .enter().append("div")
                    .attr("class", "circleLegend")
                    .attr("id", (d, i) => i)
                    // .attr("transform", function(d, i) {
                    //     return "translate(" + (w - 40) + "," + (i * 20) + ")";
                    // })
                circleLegend.append("svg")
                    .attr("width", 20)
                    .attr("height", 20)
                    .style("margin-right", 5)
                    .append("circle")
                    .attr("cx", 10)
                    .attr("cy", 10)
                    .transition()
                    .duration(500)
                    .attr("r", 5)
                    .attr("fill", d => colorScale(d['key']))
                    .attr("width", "100%").attr("height", "100%")
                    .attr("transform", "translate(0 5)")


                circleLegend.append("text")
                    .style("opacity", 0)
                    .style("font-size", "12px")
                    .transition()
                    .duration(500)
                    .style("opacity", 1)
                    // .text(d => d['key'])
                    .text(function(d) {
                        if (buttonId === "hospital") {
                            return (d['key'].length === 85) ? d['key'].slice(80, 84) : d['key'].slice(64)
                        } else {
                            return d['key']
                        }
                    })

            }

            setTimeout(redrawLegend, 600)

        })

        createPopupChart(searchQuery = undefined, first = true)


    })



}

drawBeeSwarm()