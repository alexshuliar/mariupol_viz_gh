const rowConverterData = function(d) {



    keys = Object.keys(d)

    keys.forEach(function(key) {
        if (key === "counts" || key === "counts_unique") {
            d[key] = +d[key]

        } else if (d[key] === "") {
            d[key] = NaN
        }
    })

    return d

}


const getTextAges = function(clicked) {

    d3.json("text.json").then(function(data) {

        d3.select("#gender-age-description").select("p.main-text").html(data[clicked])


    })

}



const drawBars = function(barData, reset = false, clicked = undefined) {




    svgArea = document.querySelector("#gender-age-bars")
    w = svgArea.getBoundingClientRect().width - 45
    h = svgArea.getBoundingClientRect().height - 5


    var padding = 25;

    let xScaleBar = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d['value'])])
        .range([0, w])


    let yScaleBar = d3.scaleBand()
        .domain(barData.map(d => (d['key'])))
        .range([padding + 5, h])
        // .paddingInner(0.2)
        .paddingOuter(0)
        // .padding(0.5)



    if (reset) {
        svg = d3.select("div#gender-age-bars").select("svg")

        svg.selectAll("rect").data(barData)
            .transition().duration(800).attr("width", d => xScaleBar(d['value']))

        svg.selectAll("text").data(barData)
            .transition().duration(400).attr("opacity", 0)
            .transition().duration(400).text(d => d['key'])
            .attr("opacity", 1)

        setTimeout(getTextAges, 800, clicked)

        d3.select("#gender-age-description").select("p.main-text")
            .transition().duration(800)
            .style("opacity", 0)
            .transition().duration(800)
            .style("opacity", 1)


    } else {


        svg = d3.select("div#gender-age-bars").append("svg")
            .style("height", h)
            .style("width", "100%")

        svg.selectAll("rect").data(barData).enter().append("g").append("rect")
            .attr("width", 0)
            .attr("height", 10)
            .attr("y", d => yScaleBar(d['key']) - 15)
            .attr("x", padding - 20)
            .append("title")
            .text(function(d) {
                return d['value']
            });

        svg.selectAll("rect").transition()
            .duration(1500)
            .attr("width", d => xScaleBar(d['value']))


        svg.selectAll("g")
            .data(barData)
            .append("text")
            .text(d => d['key'])
            // .attr("x", d => xScaleBar(d['value']) + 10)
            // .attr("y", d => yScaleBar(d['key']))
            .attr("x", 5)
            .attr("y", d => yScaleBar(d['key']) - 18)
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", "14px")
            .attr("opacity", 0)

        svg.selectAll("g").selectAll("text")
            .transition()
            .duration(1500)
            .attr("opacity", 1)


        d3.select("#gender-age-description").select("p.block-header")
            .style("opacity", 0)
            .transition().duration(1600)
            .style("opacity", 1)
            .text("Рекомендації")

        d3.select("#gender-age-description").select("p.main-text")
            .style("opacity", 0)

        getTextAges(clicked)

        d3.select("#gender-age-description").select("p.main-text")
            .transition().duration(1600)
            .style("opacity", 1)



    }







}

const filterBarData = function(barFilters, rawData) {

    activeFilters = Object.keys(barFilters).filter(key => barFilters[key]['status'] === true)

    let reducedData = rawData

    for (i = 0; i < activeFilters.length; i++) {
        key = activeFilters[i]

        keyContent = barFilters[key]['filter']

        key = (key === "gender") ? "Стать" : "age"

        reducedData = reducedData.filter(row => row[key] === keyContent)
    }

    filteredData = reducedData

    dataset = d3.nest()
        .key(function(d) { return d['Діагноз'] })
        .rollup(function(v) {
            return d3.sum(v, v => v['counts'])

        })
        .entries(filteredData)

    dataset.sort((a, b) => b.value - a.value)
    dataset = dataset.slice(0, 10)

    return dataset
}

const drawAgeStat = function(barFilters, rawData) {

    // top10 = top100.slice(0, 10)


    filterVal = barFilters["age"]["filter"]

    dataset = filterBarData(barFilters, rawData)


    drawBars(barData = dataset, reset = false, clicked = filterVal.slice(1))

    d3.select("#gender-age-description").style("opacity", 1)




    d3.select("div.next-button").on("click", function() {
        filterVal = barFilters["age"]["filter"]

        dataset = filterBarData(barFilters, rawData)
        drawBars(barData = dataset, reset = true, clicked = filterVal.slice(1))
    })


}





const formatTime = d3.timeFormat("%Y-%m")
const parseTime = d3.timeParse("%Y-%m")


valueChoice = 'counts'


let filterStatus = {
    'hospital': {
        'status': false,
        'visible': false,
        'items': {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false
        }
    },
    'age': {
        'status': false,
        // 'visible': false,
        'items': {
            'y18-39': false,
            'y65+': false,
            'y40-64': false,
            'y6-17': false,
            'y0-5': false
        }
    },

    'Стать': {
        'status': false,
        // 'visible': false,
        'items': {
            'Чоловіча': false,
            'Жіноча': false
        }
    },

    'Діагноз': {
        'status': false,
        // 'visible': false,
        'items': [],
        'init': true

    }

}


const drawMouseArea = function(svg, scale, w) {

    xScale = scale

    xPoints = d3.nest()
        .key(function(d) { return d['visit_month'] })
        .entries(dataGlobal)
        .map(row => parseTime(row['key']))



    svg.append("g").attr("class", "hover-area")
        .selectAll("rect")
        .data(xPoints).enter()
        .append('svg:rect')
        .attr('width', 10)
        .attr('height', "100%")
        .attr("width", function(d, i) {

            start = xScale(xPoints[i])

            end = ((i + 1) !== xPoints.length) ? xScale(xPoints[i + 1]) : w

            rectLen = end - start
            return rectLen
        })
        .attr("x", d => xScale(d))
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr("transform", function(d, i) {

            start = xScale(xPoints[i])
            end = ((i + 1) !== xPoints.length) ? xScale(xPoints[i + 1]) : w
            rectLen = end - start
                // further need to change it with function return value
            return "transform", "translate(" + (-rectLen / 2) + ",3)"
        })
        .on('mouseout', function(d, i) { // on mouse out hide line, circles and text
            d3.selectAll("circle" + ".point-" + i)
                .transition()
                .duration(500)
                .style("opacity", "0");

            d3.selectAll("text" + ".point-" + i)
                .transition()
                .duration(500)
                .style("opacity", "0");


        })
        .on('mouseover', function(d, i) { // on mouse in show line, circles and text

            d3.selectAll("circle" + ".point-" + i)
                .transition()
                .style("opacity", function(d, i) {

                    if (i < 5) {
                        return "1"
                    } else {
                        return "0"
                    }

                });

            d3.selectAll("text" + ".point-" + i)
                .transition()
                .duration(500)
                .style("opacity", function(d, i) {
                    if (i < 5) {
                        return "1"
                    } else {
                        return "0"
                    }
                });

        })




}


const resetFilters = function() {

    legendGlobal = undefined
    colorScaleGlobal = undefined
    legendClickFlag = false

    filterStatus['Діагноз']['init'] = true

    d3.select(".line-chart-svg").select("svg").remove()
    d3.selectAll(".boxLegend").remove()

    filters = Object.keys(filterStatus)

    filters.forEach(function(key) {
        filterStatus[key]['status'] = false
        filterStatus[key]['visible'] = false
    })

    d3.select("div.hosp-choice").select("ul").style("display", "none")

    searchField = document.querySelector(".diag-input-box").querySelector("input")
    searchField['value'] = ''


    inputs = document.querySelector(".hosp-choice").querySelectorAll("input")
    inputs.forEach(function(checkbox) {
        checkbox['checked'] = false
        checkbox.closest("label").classList.remove("checked")
    })

    d3.selectAll(".f-button").classed("active-button", false)


    d3.select(".slider-box").select("input").property("checked", false)
    valueChoice = 'counts'

    // reset false here is to redraw visuals as if it was the first time
    MakeTimeLine(reset = false)


}


let dataGlobal
let legendGlobal
let legendClickFlag = false
let newDiagnoses = []
let keepLegend = false
let colorScaleGlobal


const drawLineChart = function(filteredDataset, reset = false) {

    const assignStyling = function(diagName, i, line, path, circles, text, transitionFlag) {
        // function to assign the same styling to different selectors for lines, circles and text
        path
            .transition()
            .duration(1000)
            .attr("fill", "none")
            .attr("stroke", function() {
                if (i < 5) {
                    return colorScale(diagName)
                } else {
                    return 'lightgrey'
                }
            })
            .attr("class", (d) => "line" + " " + diagName.split(" ")[0])
            .attr("stroke-width", 2)
            .attr("id", "l" + i)
            .attr("d", line)

        path.attr("stroke-dasharray", null)
            .attr("stroke-dashoffset", null)



        const styleCircle = function(circles) {
            circles
                .attr("cx", d => xScale(d.key))
                .attr("cy", d => yScale(d.value))
                .attr("r", 4)
                .attr("fill", function() {
                    if (i < 5) {
                        return colorScale(diagName)
                    } else {
                        return "grey"
                    }
                })
                .attr("class", (d, i) => "point-" + i + " " + diagName.split(" ")[0])
                .style("opacity", 0)

        }

        const styleText = function(text) {
            text
                .attr("x", d => xScale(d.key) + 10)
                .attr("y", d => yScale(d.value) - 5)
                .text(d => d.value)
                .attr("class", (d, i) => "point-" + i + " " + diagName.split(" ")[0])
                .attr("font-size", 14)
        }

        if (transitionFlag) {
            circles.transition().duration(1000).call(styleCircle)
            text.transition().duration(300).style("opacity", 0)
                .transition().duration(700).call(styleText)
        } else {
            circles.call(styleCircle)
            text.call(styleText)
        }


    }


    svgArea = document.querySelector(".line-chart-svg")
    widthSvg = svgArea.getBoundingClientRect().width - 5
    heightSvg = svgArea.getBoundingClientRect().height - 5


    var margin = { top: 5, right: 20, bottom: 50, left: 60 },

        w = widthSvg - margin.left - margin.right,
        h = heightSvg - margin.top - margin.bottom;

    var dataset, xScale, yScale, xAxis, yAxis, line




    diagnoses = d3.nest()
        .key(function(d) { return d['Діагноз'] })
        .key(function(d) { return d['visit_month'] })
        .rollup(function(v) {
            return d3.sum(v, v => v[valueChoice])

        })
        .entries(filteredDataset)


    if (newDiagnoses.length > 0) {
        diagnoses.sort(function(a, b) {
            return newDiagnoses.indexOf(a['key']) - newDiagnoses.indexOf(b['key']);
        });
    }



    let colorScale
    if (colorScaleGlobal) {
        colorScale = colorScaleGlobal
    } else {
        colors = ["#C98BBC", "#BFD890", "#FFDB54", "#AC468A", "#2678bd", "#B5C4E6",
            "#FFE37E", "#8CBF3A", "#939CCF", "#4762AB", "#FFF1C4",
            "#DBB4D6", "#C1DFC0", "#5f8fca", "#dbe2f3"
        ]
        colorScale = d3.scaleOrdinal()
            .domain(filteredDataset, d => d.key)
            .range(colors)

        colorScaleGlobal = colorScale
    }


    //Create scale functions on flattened array - one for all diagnoses
    xScale = d3.scaleTime()
        .domain([new Date("2018-12-31"), new Date("2019-12")])
        .range([0, w - margin.right]);


    yScale = d3.scaleLinear()
        .domain([
            // d3.min(diagnoses, function(d) { return d3.min(d.values, val => val.value) }),
            0,
            d3.max(diagnoses, function(d) { return d3.max(d.values, val => val.value) })
        ])
        .range([h, margin.top]);


    //Define axes
    xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickFormat(formatTime);

    //Define Y axis
    yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(5);


    line = d3.line()
        .x(function(d) { return xScale(d.key); })
        .y(function(d) { return yScale(d.value); })
        .curve(d3.curveCatmullRom)



    if (reset === true) {

        svg = d3.select(".line-chart-svg").select("svg").select("g")

        svg.select("g.axis.x")
            .call(xAxis)

        svg.select("g.axis.y")
            .call(yAxis);

        // if legend wasn't clicked it use simpler pattern for redraw visuals and doesn't apply transition
        if (legendClickFlag === false) {

            diagnoses.forEach(function(diag, i) {

                diagName = diag.key
                diagCode = diag.key.split(" ")[0]

                dataset = diag.values

                dataset.forEach(d => {
                    d['key'] = parseTime(d['key']),
                        d['value'] = d['value']
                })

                dataset.sort((a, b) => a.key - b.key)


                path = svg.select("path#l" + i)
                    .datum(dataset)


                g = svg.select("g.points#p" + i)

                circles = g.selectAll("circle")
                    .data(dataset)

                text = g.selectAll("text").data(dataset)

                assignStyling(diagName, i, line, path, circles, text, transitionFlag = false)

            })

        } else {


            linesNew = diagnoses.length

            linesLeft = svg.selectAll("path.line")._groups[0].length

            availableLines = Array.from(document.querySelectorAll("path.line")).map(node => node.classList[1])

            // drawing multiple lines for each diagnosis
            diagnoses.forEach(function(diag, i) {

                diagName = diag.key
                diagCode = diag.key.split(" ")[0]

                dataset = diag.values

                dataset.forEach(d => {
                    d['key'] = parseTime(d['key']),
                        d['value'] = d['value']
                })

                dataset.sort((a, b) => a.key - b.key)


                if (availableLines.includes(diagCode)) {

                    availableLines.splice(availableLines.indexOf(diagCode), 1)

                    path = svg.select("path.line." + diagCode)
                        .datum(dataset)

                    g = svg.select("g.points." + diagCode)

                    circles = g.selectAll("circle")
                        .data(dataset)
                    text = g.selectAll("text").data(dataset)

                    assignStyling(diagName, i, line, path, circles, text, transitonFlag = true)

                } else {

                    path = svg.append("path").datum(dataset)

                    g = svg.append("g").attr("class", "points " + diagName.split(" ")[0]).attr("id", "p" + i)

                    circles = g.selectAll("circle")
                        .data(dataset).enter()
                        .append("circle")
                    text = g.selectAll("text").data(dataset).enter()
                        .append("text")

                    assignStyling(diagName, i, line, path, circles, text, transitionFlag = true)

                }


            })


            // clearing filtered out lines
            if (availableLines.length > 1) {
                // first iteration when all initial lines are available and only one line selected
                lineToKeep = diagnoses[0].key.split(" ")[0]

                svg.selectAll("path.line").filter(function() {
                    return this.classList[1] !== lineToKeep
                }).remove()

                svg.selectAll("g.points").filter(function() {
                    return this.classList[1] !== lineToKeep
                }).remove()

            } else if (availableLines.length > 0) {
                // when one line has been clicked twice on legend and need to be filtered out
                lineLeft = availableLines[0]

                svg.selectAll("path.line." + lineLeft).transition().duration(300).style("opacity", 0).remove()
                svg.selectAll("g.points." + lineLeft).remove()

            }
        }



        if (!keepLegend) {

            // // also removing legend - transition hidden due to js async problem
            d3.select("div.line-chart-legend").selectAll("div.boxLegend")
                .style("opacity", 1)
                // .transition()
                // .duration(500)
                .style("opacity", 0)
                .remove()

        }


    } else {

        var svg = d3.select("div.line-chart-svg")
            .append("svg")
            .attr("width", "100%")
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")


        svg.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0," + 10 + ")")

        svg.append("g")
            .attr("class", "axis y")
            .call(yAxis);

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Кількість звернень")
            .style("font-size", "10px")




        // drawing multiple lines for each diagnosis
        diagnoses.forEach(function(diag, i) {

            diagName = diag.key

            dataset = diag.values

            dataset.forEach(d => {
                d['key'] = parseTime(d['key']),
                    d['value'] = d['value']
            })


            dataset.sort((a, b) => a.key - b.key)

            path = svg.append("path")
                .datum(dataset)
                .attr("fill", "none")
                .attr("stroke", function() {
                    if (i < 5) {
                        return colorScale(diagName)
                    } else {
                        return 'lightgrey'
                    }
                })
                .attr("stroke-width", 2)
                .attr("class", (d) => "line" + " " + diagName.split(" ")[0])
                .attr("id", "l" + i)
                .attr("d", line)


            totalLength = path.node().getTotalLength()

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0);


            g = svg.append("g").attr("class", "points " + diagName.split(" ")[0]).attr("id", "p" + i)


            g.selectAll("circle")
                .data(dataset).enter()
                .append("circle")
                .attr("cx", d => xScale(d.key))
                .attr("cy", d => yScale(d.value))
                .attr("r", 4)
                .attr("fill", function() {
                    if (i < 5) {
                        return colorScale(diagName)
                    } else {
                        return "grey"
                    }
                })
                .attr("class", (d, i) => "point-" + i + " " + diagName.split(" ")[0])
                .style("opacity", 0)

            g.selectAll("text").data(dataset).enter()
                .append("text")
                .attr("x", d => xScale(d.key) + 10)
                .attr("y", d => yScale(d.value) - 5)
                .text(d => d.value)
                .attr("class", (d, i) => "point-" + i + " " + diagName.split(" ")[0])
                .attr("opacity", 0)
                .attr("font-size", 14)


        })


        diagnosesGlobal = diagnoses
            // d3.selectAll("path.line").each(d => console.log(d))


    }



    let legendKeys
    let legendBoxes


    if (keepLegend) {
        // for next legend draw - to keep legend unchanged based on filters for lines
        legendKeys = legendGlobal

        legendBoxes = d3.selectAll(".boxLegend")

        keepLegend = false




    } else {

        legendKeys = diagnoses.map(function(d) {
            return {
                diag: d.key,
                check: false
            }

        })

        legendGlobal = legendKeys

        legend = d3.select("div.legend-list")


        legendBoxes = legend.selectAll(".boxLegend").data(legendKeys)
            .enter().append("div")
            .attr("class", "boxLegend")
            .attr("id", (d, i) => i)
            .attr("transform", function(d, i) {
                return "translate(" + (w - 40) + "," + (i * 20) + ")";
            })



        legendBoxes.append("svg")
            .attr("width", 20)
            .attr("height", 20)
            .style("margin-right", 5)
            .append("circle")
            .attr("fill", function(d, i) {

                if (i < 5) {
                    return colorScale(d.diag)
                } else {
                    return 'lightgrey'
                }
            })
            // .attr("width", "100%").attr("height", "100%")
            .attr("r", "5px")
            .attr("cx", "50%")
            .attr("cy", "50%")

        legendBoxes.append("text").text(function(d) { return d.diag; })
            .attr("transform", "translate(15,9)"); //align texts with boxes

        legendBoxes.style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)

    }




    d3.selectAll("div.boxLegend").on("click", function() {

        legendClickFlag = true



        const dispatchLegend = function() {

            d3.select("div.line-chart-legend").dispatch("mouseout")
        }

        setTimeout(dispatchLegend, 200)


        filterStatus['Діагноз']['init'] = false

        diagClicked = this.textContent

        if (newDiagnoses.includes(diagClicked)) {
            newDiagnoses.splice(newDiagnoses.indexOf(diagClicked), 1)
        } else {
            newDiagnoses.push(diagClicked)
        }

        clickedId = parseInt(this.id)

        legendKeys.forEach(function(row) {
            if (row.diag === diagClicked) {

                row['check'] = !row['check']
            }
        })


        legendBoxes.selectAll("circle")
            .transition()
            .duration(1000)
            .attr("fill", function(d) {
                if (d.check === true) {

                    return colorScale(d.diag)
                } else {
                    return "lightgrey"
                }

            })



        filterStatus['Діагноз']['status'] = true
        filterStatus['Діагноз']['items'] = legendKeys
            // console.log(keepLegend);

        allUnchecked = legendKeys.every(row => row['check'] === false)
        if (allUnchecked) {
            resetFilters()
        } else {
            MakeTimeLine(reset = true)
            keepLegend = true
        }



    })



    d3.selectAll("div.boxLegend").on("mouseover", function() {
        diagClicked = this.textContent
        clickedId = parseInt(this.id)

        d3.event.stopPropagation()
            // console.log(d3.event.target)


        // first time apply only when all lines presented on screen and match with all legend labels
        if (filterStatus['Діагноз']['init'] === true) {



            d3.selectAll(".line").data(legendKeys)
                .attr("opacity", function(d, i) {
                    if (this.classList[1] === diagClicked.split(" ")[0]) {
                        return 1
                    } else {
                        return 0.3
                    }

                })
                .attr("stroke-width", function(d, i) {

                    if (clickedId === i) {

                        return 2.5
                    } else {
                        return 2
                    }
                })
                .attr("stroke", function(d, i) {
                    if (diagClicked === d.diag) {
                        return colorScale(d.diag)
                    }
                })
                .attr("stroke", function(d, i) {

                    if ((i >= 5) && (clickedId === i)) {

                        return "grey"
                    } else if (i >= 5) {
                        return "lightgray"

                    } else {
                        return colorScale(d.diag)
                    }
                })


        } else {
            lineKeys = legendKeys.filter(row => row.check === true)
            d3.selectAll(".line").data(lineKeys)
                .attr("opacity", function(d, i) {
                    // if (diagClicked === d.diag) {
                    if (diagClicked.split(" ")[0] === this.classList[1]) {

                        return 1
                    } else {
                        return 0.3
                    }

                })
        }




        d3.selectAll("circle." + diagClicked.split(" ")[0])
            .transition().duration(1000)
            .style("opacity", 1)

        d3.selectAll("text." + diagClicked.split(" ")[0])
            .transition().duration(1000)
            .style("opacity", 1)




        legendBoxes.selectAll("svg").selectAll("circle")
            .transition().duration(250)
            .attr("r", function(d, i) {
                if (diagClicked === d.diag) {
                    return "7px"
                } else {
                    return "5px"
                }
            })


        legendBoxes.selectAll("text")
            .transition().duration(500)
            .style("font-weight", function(d, i) {
                if (diagClicked === d.diag) {
                    return "bold"
                } else {
                    return "normal"
                }
            })



    })

    d3.selectAll("div.boxLegend").on("mouseout", function() {

        d3.selectAll("circle." + diagClicked.split(" ")[0])
            .transition().duration(1000)
            .style("opacity", 0)

        d3.selectAll("text." + diagClicked.split(" ")[0])
            .transition().duration(1000)
            .style("opacity", 0)


        legendBoxes.selectAll("text")
            .style("font-weight", "normal")

        if (filterStatus['Діагноз']['init'] === true) {

            d3.selectAll(".line").data(legendKeys)
                .attr("opacity", 1)
                .attr("stroke", function(d, i) {

                    if (i < 5) {
                        return colorScale(d.diag)
                    } else {
                        return 'lightgrey'
                    }

                })

        }


        legendBoxes.selectAll("circle")
            .attr("r", 5)



    })

    d3.select("div.line-chart-legend").on("mouseout", function() {
        // diagClicked = this.textContent
        // clickedId = parseInt(this.id)

        // console.log(diagClicked);

        if (filterStatus['Діагноз']['init'] === false) {

            lineKeys = legendKeys.filter(row => row.check === true)
            d3.selectAll(".line").data(lineKeys)
                .attr("opacity", 1)

        }



        legendBoxes.selectAll("circle")
            .attr("r", 5)


        legendBoxes.selectAll("text")
            .style("font-weight", "normal")


    })


    drawMouseArea(svg, xScale, w)



}


const MakeTimeLine = function(reset = false) {

    d3.csv("mariupol_data_analysis/diagnoses_stats_v2.csv", rowConverterData).then(function(data) {

        activeFilters = Object.keys(filterStatus).filter(key => filterStatus[key]['status'] === true)

        // console.log(filterStatus)

        for (i = 0; i < activeFilters.length; i++) {
            key = activeFilters[i]

            keyContent = filterStatus[key]['items']

            if (key === 'Діагноз') {
                // console.log(keyContent)

                valuesToFilter = keyContent.filter(row => row.check === true).map(row => row.diag)
                    // console.log(valuesToFilter)

            } else {
                valuesToFilter = Object.keys(keyContent).filter(val => keyContent[val] === true)
            }
            // valuesToFilter = Object.keys(keyContent).filter(val => keyContent[val] === true)

            if (valuesToFilter.length === 0) {
                filterStatus[key]['status'] = false
                continue
            }

            key = (key === 'diag_category') ? 'Категорія діагнозу' : key
            data = data.filter(row => valuesToFilter.includes(row[key]))
        }

        filteredData = data


        // if (filterKey === 'hospital') {


        //     filteredData = data.filter(row => filterVal.includes(row[filterKey]))


        // } else {
        //     filteredData = data
        // }



        dataset = d3.nest()
            .key(function(d) { return d['Діагноз'] })
            .rollup(function(v) {
                return d3.sum(v, v => v[valueChoice])

            })
            .entries(filteredData)




        dataset.sort((a, b) => b.value - a.value)
            // dataset = dataset.slice(0, 30)

        topDis = dataset.map(row => row.key)

        filteredDataset = filteredData.filter(row => topDis.includes(row['Діагноз']))

        // sorting data based on aggregation of top diag
        filteredDataset.sort(function(a, b) {
            return dataset.map(row => row.key).indexOf(a['Діагноз']) - dataset.map(row => row.key).indexOf(b['Діагноз']);
        });


        console.log(filteredDataset)

        drawLineChart(filteredDataset, reset = reset)


    })

}


const drawFirstTime = function() {

    d3.csv("mariupol_data_analysis/diagnoses_stats_v2.csv", rowConverterData).then(function(data) {

        console.log(data)

        // create hospital checkboxes
        hospitals = Object.keys(filterStatus['hospital']['items'])

        // new edition
        d3.select("div.hosp-choice")
            // .append("div").attr("class", "data-checkbox")
            .select("ul")
            // .style("display", "none")
            .selectAll("label")
            .data(hospitals).enter()
            .append("label").attr("class", "label-container")
            .call(label => label.text(d => "Центр первинної медико-санітарної допомоги №" + d))
            .call(label => label.append("input").attr("type", "checkbox"))
            // .call(label => label.append("span").attr("class", "checkmark"))


        // // diagnoses
        allDiagnoses = d3.map(data, d => d['Діагноз']).keys()


        d3.select("div.diag-input-box").append("datalist").attr("id", "diagnoses")
            .selectAll("option").data(allDiagnoses).enter()
            .append("option")
            .attr("value", d => d)



        // click events for hospital choice
        d3.select("div.hospital-filters").selectAll("div.h-button").on("click", function() {

            // console.log(this)
            // console.log(d3.event.target)

            if (!["LABEL", "INPUT"].includes(d3.event.target.tagName)) {

                text = this.querySelector("span").textContent

                hospButtonStatus = filterStatus['hospital']['visible']
                checkboxStatus = filterStatus['hospital']['items']



                switch (text) {
                    case "ВСІ ЛІКАРНІ":

                        // makeChart(data, update = true, metric = metricFirst)
                        d3.select("div.hosp-choice ul").style("display", "none")

                        document.querySelectorAll(".hosp-choice input").forEach(function(val) {
                            val['checked'] = false
                            val.closest("label").classList.remove("checked")
                        })


                        filterStatus['hospital']['status'] = false
                        filterStatus['hospital']['visible'] = false
                        Object.keys(checkboxStatus).forEach(key => checkboxStatus[key] = false)

                        MakeTimeLine(reset = true)

                        break

                    case "ВИБРАТИ ЛІКАРНЮ":

                        filterStatus['hospital']['status'] = true


                        // another conditional to account case when it's clicked 2nd time - it will close and unselect checkboxes
                        if (!hospButtonStatus) {


                            d3.select("div.hosp-choice ul").style("display", "flex")

                            // click event for checkboxes
                            d3.selectAll("label.label-container").selectAll("input").on("click", function() {

                                // console.log(this)
                                hospSelected = this.parentNode.textContent.slice(-1)
                                checkmarkStatus = this.parentNode.querySelector("span")
                                checkboxStatus[hospSelected] = !checkboxStatus[hospSelected]

                                this.closest("label").classList.toggle("checked")

                                MakeTimeLine(reset = true)

                            })

                            filterStatus['hospital']['visible'] = true

                        } else {
                            filterStatus['hospital']['visible'] = false

                            d3.select("div.hosp-choice ul").style("display", "none")
                        }
                }

            }

        })


        // click event for other filters
        d3.select("div.line-filters-left").selectAll("div.f-button").on("click", function() {



            if (this.textContent == 'Скинути всі фільтри') {
                resetFilters()
            } else {

                this.classList.toggle("active-button")
                    // only one column that has different from button name in dataset

                // console.log(this)
                nameMapper = {
                    'age-filter': 'age',
                    'male-filter': 'Стать',
                    'female-filter': 'Стать'
                }

                buttonClass = this.classList[1]
                text = nameMapper[buttonClass]

                activeFilters = filterStatus[text]['items']


                if (text === "age") {
                    valSelected = "y" + this.textContent
                } else {
                    valSelected = (this.textContent === "ЧОЛОВІК") ? "Чоловіча" : "Жіноча"
                }

                activeFilters[valSelected] = !activeFilters[valSelected]

                hideSectionStatus = Object.values(activeFilters).every(button_status => !button_status)

                if (hideSectionStatus) {
                    filterStatus[text]['status'] = false
                } else {
                    filterStatus[text]['status'] = true
                }

                MakeTimeLine(reset = true)

            }



        })


        // click event for diagnosis filter
        d3.selectAll("div.diag-input-box").select("input").on("change", function() {

            searchQuery = this.value

            if (searchQuery !== '') {

                legendGlobal = undefined

                d3.select("div.legend-list").selectAll("div.boxLegend")
                    .style("opacity", 1)
                    // .transition()
                    // .duration(500)
                    .style("opacity", 0)
                    .remove()

                if (allDiagnoses.includes(searchQuery)) {
                    filterStatus['Діагноз']['status'] = true

                    diagObj = {
                        diag: searchQuery,
                        check: true
                    }

                    filterStatus['Діагноз']['items'] = [diagObj]


                    MakeTimeLine(reset = true)

                }

            }

        })


        // clearing diag filter
        d3.selectAll("div.diag-input-box").select("input").on("input", function() {
            if (this.value === '') {

                legendGlobal = undefined
                filterStatus['Діагноз']['init'] = true

                d3.select("div.legend-list").selectAll("div.boxLegend")
                    .style("opacity", 1)
                    // .transition()
                    // .duration(500)
                    .style("opacity", 0)
                    .remove()

                filterStatus['Діагноз']['status'] = false

                MakeTimeLine(reset = true)
            }
        })


        d3.select("div.slider-box").select("input").on("change", function() {

            if (this.checked) {
                valueChoice = 'counts_unique'

            } else {
                valueChoice = 'counts'
            }

            setTimeout(MakeTimeLine, 300, true)
        })


        // repeated from another function
        dataset = d3.nest()
            .key(function(d) { return d['Діагноз'] })
            .rollup(function(v) {
                return d3.sum(v, v => v['counts'])

            })
            .entries(data)

        dataset.sort((a, b) => b.value - a.value)
            // dataset = dataset.slice(0, 30)

        topDis = dataset.map(row => row.key)

        filteredDataset = data.filter(row => topDis.includes(row['Діагноз']))

        // sorting data based on aggregation of top diag
        filteredDataset.sort(function(a, b) {
            return dataset.map(row => row.key).indexOf(a['Діагноз']) - dataset.map(row => row.key).indexOf(b['Діагноз']);
        });


        dataGlobal = data

        drawLineChart(filteredDataset)


        // section for gender-age bars

        barFilters = {
            "age": {
                "status": true,
                "filter": "y18-39"
            },
            "gender": {
                "status": true,
                "filter": "Чоловіча"
            }
        }

        d3.selectAll("div.gender-selector").on("click", function() {

            namesMapper = {
                "ЧОЛОВІК": "Чоловіча",
                "ЖІНКА": "Жіноча"
            }

            filterType = this.className.split("-")[0]

            barFilters[filterType]["status"] = true

            filterVal = namesMapper[this.textContent]

            barFilters[filterType]['filter'] = filterVal

            d3.selectAll("div.gender-selector").classed("calc-selected-button", false)

            this.classList.toggle("calc-selected-button")


            // dataset = filterBarData(barFilters, rawData)

            // drawBars(barData = dataset, reset = true, clicked = undefined)



        })

        d3.selectAll("div.age-selector").on("click", function() {

            filterType = this.className.split("-")[0]

            barFilters[filterType]["status"] = true

            filterVal = "y" + this.textContent

            barFilters[filterType]['filter'] = filterVal

            d3.selectAll("div.age-selector").classed("calc-selected-button", false)

            this.classList.toggle("calc-selected-button")

            // dataset = filterBarData(barFilters, rawData)

            // drawBars(barData = dataset, reset = true, clicked = filterVal.slice(1))


        })


        d3.select("div.next-button").on("click", function() {
            d3.select("div.title-calc").remove()
            document.querySelector(".calc-container").classList.remove("initial")
            document.querySelector(".calc-container").classList.add("tight")

            d3.select(".gender-age-body").style("display", "flex")

            drawAgeStat(barFilters = barFilters, rawData = data)
        })

    })

}



drawFirstTime()