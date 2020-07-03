d3.select(".container").style("height", "1500px")
d3.select(".sidebar-container").style("grid-template-rows", "0.15fr 0.2592fr 0.65fr")

const rowConverterData = function(d) {



    keys = Object.keys(d)

    keys.forEach(function(key) {
        if (key === "counts") {
            d[key] = +d[key]

        } else if (d[key] === "") {
            d[key] = NaN
        }
    })

    return d

}


const getTextAges = function(clicked) {

    d3.json("text.json").then(function(data) {

        // d3.select("#age-description").select("p.main-text").style("opacity", 0)
        d3.select("#gender-age-description").select("p.main-text").html(data[clicked])

        // d3.select("#age-description").select("p.main-text")
        //     .transition()
        //     .duration(800)
        //     .style("opacity", 1)


    })

}

const drawBars = function(barData, reset = false, clicked = undefined) {


    svgArea = document.querySelector("#gender-age-bars")
    w = svgArea.getBoundingClientRect().width - 45
        // h = svgArea.getBoundingClientRect().height - 5
    h = 400

    // console.log(w, h)

    // var w = 250;
    // var h = 400;
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



    // .transition().duration(800)
    // .style("opacity", 1)


    if (reset) {
        svg = d3.select("div#gender-age-bars").select("svg")

        svg.selectAll("rect").data(barData)
            .transition().duration(800).attr("width", 0)
            .transition().duration(800).attr("width", d => xScaleBar(d['value']))

        svg.selectAll("text").data(barData)
            .transition().duration(800).attr("opacity", 0)
            // .transition().duration(400).attr("x", d => xScaleBar(d['value']) + 10)
            // .transition().duration(800).text(d => d['key'])
            .transition().duration(400).attr("x", 5)
            .transition().duration(800).text(d => d['key'])
            .attr("opacity", 1)





        //     if (clicked) {

        //         // d3.select("#age-description").select("p.main-text").html("Новий текст<br>nextline")

        //         recomTitle = document.querySelector("#gender-age-description p").innerHTML
        //         if (!recomTitle) {

        //             d3.select("#gender-age-description").select("p.block-header")
        //                 .style("opacity", 0)
        //                 .transition().duration(1600)
        //                 .style("opacity", 1)
        //                 .text("Рекомендації")

        //             d3.select("#gender-age-description").select("p.main-text")
        //                 .style("opacity", 0)
        //                 // .transition().duration(800)
        //                 // .style("opacity", 1)


        //             getTextAges(clicked)


        //             d3.select("#gender-age-description").select("p.main-text")
        //                 .transition().duration(3000)
        //                 .style("opacity", 1)


        //         } else {

        //             d3.select("#gender-age-description").select("p.main-text")
        //                 .transition().duration(3000)
        //                 .style("opacity", 0)
        //                 // .transition().duration(800)
        //                 // .style("opacity", 1)
        //                 // setTimeout(getTextAges(clicked), 3000)

        //             getTextAges(clicked)
        //                 // setTimeout(getTextAges(clicked), 900)

        //             d3.select("#gender-age-description").select("p.main-text")
        //                 .transition().duration(3000)
        //                 .style("opacity", 1)
        //         }

        //     }



    } else {


        svg = d3.select("div#gender-age-bars").append("svg")
            .style("height", h)
            .style("width", "100%")

        svg.selectAll("rect").data(barData).enter().append("g").append("rect")
            .attr("width", 0)
            // .attr("width", d => xScaleBar(d['value']))
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
            .duration(2500)
            .attr("opacity", 1)


        d3.select("#gender-age-description").select("p.block-header")
            .style("opacity", 0)
            .transition().duration(1600)
            .style("opacity", 1)
            .text("Рекомендації")

        d3.select("#gender-age-description").select("p.main-text")
            .style("opacity", 0)

    }

    getTextAges(clicked)

    d3.select("#gender-age-description").select("p.main-text")
        .transition().duration(3000)
        .style("opacity", 1)

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
        // console.log(filteredData)


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
    // 'diag_category': {
    //     'status': false,
    //     'visible': false,
    //     'items': {
    //         "Вагітність, пологи, планування сім'ї": false,
    //         "Вухо": false,
    //         "Дихальна система": false,
    //         "Ендокринні/метаболічні розлади та порушення харчування": false,
    //         "Жіночі статеві органи": false,
    //         "Загальні та неспецифічні": false,
    //         "Кров, кровотворні органи та імунна система": false,
    //         "Нервова система": false,
    //         "Око": false,
    //         "Опорно-рухова система": false,
    //         "Серцево-судинна система": false,
    //         "Травна система": false,
    //         "Урологічні": false,
    //         "Шкірна система": false
    //     }

    // },


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

    filterStatus['Діагноз']['init'] = true

    d3.selectAll(".boxLegend")
        .remove()

    d3.selectAll(".boxLegend")
        .remove()

    filters = Object.keys(filterStatus)

    filters.forEach(function(key) {
        filterStatus[key]['status'] = false
        filterStatus[key]['visible'] = false
    })

    d3.select("div.hosp-choice").select("ul").style("display", "none")
    MakeTimeLine(reset = true)

    searchField = document.querySelector(".diag-input-box").querySelector("input")
    searchField['value'] = ''


    inputs = document.querySelector(".hosp-choice").querySelectorAll("input")
    inputs.forEach(function(checkbox) {
        checkbox['checked'] = false
        checkbox.closest("label").classList.remove("checked")
    })

    d3.selectAll(".f-button").classed("active-button", false)




}


let dataGlobal
let legendGlobal
let keepLegend = false
let colorScaleGlobal


const drawLineChart = function(filteredDataset, reset = false) {


    svgArea = document.querySelector(".line-chart-svg")
    widthSvg = svgArea.getBoundingClientRect().width - 5
    heightSvg = svgArea.getBoundingClientRect().height - 5


    var margin = { top: 5, right: 20, bottom: 100, left: 60 },

        w = widthSvg - margin.left - margin.right,
        h = heightSvg - margin.top - margin.bottom;

    var dataset, xScale, yScale, xAxis, yAxis, line


    diagnoses = d3.nest()
        .key(function(d) { return d['Діагноз'] })
        .key(function(d) { return d['visit_month'] })
        .rollup(function(v) {
            return d3.sum(v, v => v['counts'])

        })
        .entries(filteredDataset)

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


    if (reset === true) {

        d3.select("div.line-chart-svg").select("svg")
            // .style("opacity", 1)
            // .transition()
            // .duration(500)
            // .style("opacity", 0)
            .remove()

        if (!keepLegend) {

            // // also removing legend - transition hidden due to js async problem
            d3.select("div.line-chart-legend").selectAll("div.boxLegend")
                .style("opacity", 1)
                // .transition()
                // .duration(500)
                .style("opacity", 0)
                .remove()

        }




    }

    //Create SVG element
    var svg = d3.select("div.line-chart-svg")
        .append("svg")
        .attr("width", "100%")
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    svg.style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1)




    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(0," + 10 + ")")


    svg.append("g")
        .attr("class", "axis")
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



        //Define line generators
        line = d3.line()
            .x(function(d) { return xScale(d.key); })
            .y(function(d) { return yScale(d.value); })
            .curve(d3.curveCatmullRom)

        path = svg.append("path")
            .datum(dataset)
            .attr("fill", "none")
            // .attr("stroke", colorScale(diagName))
            .attr("stroke", function() {
                if (i < 5) {
                    return colorScale(diagName)
                } else {
                    return 'lightgrey'
                }
            })
            .attr("stroke-width", 2)
            // .attr("class", "line")
            .attr("class", (d) => "line" + " " + diagName.split(" ")[0])
            .attr("id", i)
            .attr("d", line)


        totalLength = path.node().getTotalLength()

        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);



        g = svg.append("g").attr("class", "points")


        g.selectAll("circle")
            .data(dataset).enter()
            .append("circle")
            .attr("cx", d => xScale(d.key))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4)
            // .attr("r", function() {
            //     if (i < 5) {
            //         return 4
            //     }
            // })
            .attr("fill", function() {
                if (i < 5) {
                    return colorScale(diagName)
                } else {
                    return "grey"
                }
            })
            // .attr("fill", d => colorScale(diagName))
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
            // .attr("font-size", function() {
            //     if (i < 5) {
            //         return 14
            //     } else {
            //         return 0
            //     }
            // })


    })


    let legendKeys
    let legendBoxes

    console.log(keepLegend);

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

        keepLegend = true

        filterStatus['Діагноз']['init'] = false

        diagClicked = this.textContent



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
        console.log(keepLegend);
        MakeTimeLine(reset = true)


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
                    if (diagClicked === d.diag) {

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

    d3.selectAll("div.line-chart-legend").on("mouseout", function() {
        diagClicked = this.textContent
        clickedId = parseInt(this.id)


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

    d3.csv("mariupol_data_analysis/diagnoses_stats.csv", rowConverterData).then(function(data) {

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
                return d3.sum(v, v => v['counts'])

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

        drawLineChart(filteredDataset, reset = true)






    })



}


const drawFirstTime = function() {

    d3.csv("mariupol_data_analysis/diagnoses_stats.csv", rowConverterData).then(function(data) {

        console.log(data)
            // filterButtons = ["Категорія діагнозу", "Діагноз", "Стать", "Вік", 'Скинути всі фільтри']
            // filterButtons = ["Категорія діагнозу", "Стать", "Вік", 'Скинути всі фільтри']

        // // first buttons
        // d3.select("div#container")
        //     .append("div").attr("class", "stat-panel")
        //     .call(panel => panel.append("div").attr("class", "data-choice"))
        //     .call(panel => panel.append("div").attr("class", "buttons"))
        //     .call(panel => panel.append("div").attr("class", "timeline-panel"))
        // d3.selectAll("div.data-choice")
        //     .selectAll("div").data(["Всі лікарні", "Вибрати лікарню"]).enter()
        //     .append("div")
        //     .attr("class", "select-button")
        //     .append("text").text(d => d)

        // // clear float divs before 
        // d3.select("div.data-choice").append("div").attr("class", "clear-before")


        // d3.select("div.buttons")
        //     .selectAll("div").data(filterButtons).enter()
        //     .append("div")
        //     .attr("class", "filter-button")
        //     .attr("id", (d, i) => "i" + i)
        //     .attr("tabindex", (d, i) => i)
        //     .append("text").text(d => d)


        // d3.select("div.buttons").append("div")
        //     .attr("class", "filter-button")
        //     .attr("id", "diagnosis")
        //     .append("text").text("Діагноз")



        // // clear float divs before 
        // d3.select("div.buttons").append("div").attr("class", "clear-before")


        // d3.select("div.timeline-panel")
        //     .call(panel => panel.append("div").attr("id", "chart").style("display", "inline-block"))
        //     .call(panel => panel.append("div").attr("id", "legend").style("display", "inline-block"))







        // create hospital checkboxes
        hospitals = Object.keys(filterStatus['hospital']['items'])

        // d3.select("div.data-choice").append("div")
        //     .attr("class", "data-checkbox")
        //     .style("display", "none")
        //     .selectAll("label")
        //     .data(hospitals).enter()
        //     .append("label").attr("class", "label-container")
        //     .call(label => label.text(d => "КНП Центр первинної медико-санітарної допомоги №" + d))
        //     .call(label => label.append("input").attr("type", "checkbox"))
        //     .call(label => label.append("span").attr("class", "checkmark"))

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

        // // HAVE TO MAKE IT IN ONE LOOP
        // // ages
        // ages = d3.map(data, d => d.age).keys()

        // xAges = document.getElementById("i2").getBoundingClientRect().x

        // d3.select("div.buttons").append("div")
        //     .attr("class", "data-checkbox age")
        //     .style("margin-left", (xAges + 35) + "px")
        //     .style("display", "none")
        //     .selectAll("label")
        //     .data(ages).enter()
        //     .append("label").attr("class", "label-container")
        //     .call(label => label.text(d => d))
        //     .call(label => label.append("input").attr("type", "checkbox"))
        //     .call(label => label.append("span").attr("class", "checkmark"))

        // // genders
        // genders = d3.map(data, d => d['Стать']).keys()

        // xGenders = document.getElementById("i1").getBoundingClientRect().x

        // d3.select("div.buttons").append("div")
        //     .attr("class", "data-checkbox Стать")
        //     .style("margin-left", (xGenders + 35) + "px")
        //     .style("display", "none")
        //     .selectAll("label")
        //     .data(genders).enter()
        //     .append("label").attr("class", "label-container")
        //     .call(label => label.text(d => d))
        //     .call(label => label.append("input").attr("type", "checkbox"))
        //     .call(label => label.append("span").attr("class", "checkmark"))

        // // diagnoses category
        // diagnosesCat = d3.map(data, d => d['Категорія діагнозу']).keys()

        // xDiagCat = document.getElementById("i0").getBoundingClientRect().x

        // d3.select("div.buttons").append("div")
        //     .attr("class", "data-checkbox diag_category")
        //     .style("margin-left", (xDiagCat) + "px")
        //     .style("display", "none")
        //     .selectAll("label")
        //     .data(diagnosesCat).enter()
        //     .append("label").attr("class", "label-container")
        //     .call(label => label.text(d => d))
        //     .call(label => label.append("input").attr("type", "checkbox"))
        //     .call(label => label.append("span").attr("class", "checkmark"))

        // // diagnoses
        allDiagnoses = d3.map(data, d => d['Діагноз']).keys()

        // d3.select("div.buttons").select("div#diagnosis").append("div").attr("class", "search-disease")
        //     .call(div => div.append("label").attr("for", "dis-search"))
        //     .call(div => div.append("input")
        //         .attr("type", "search")
        //         .attr("id", "dis-search")
        //         .attr("list", "doctors")
        //         .attr("autocomplete", "off")
        //         .attr("placeholder", "Ввести хворобу")
        //     )
        //     .call(div => div.append("datalist").attr("id", "doctors"))

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

                    // console.log(diagObj)


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

            d3.select(".container").style("height", "1600px")
                // for old 3 navboxes menu
                // d3.select(".sidebar-container").style("grid-template-rows", "0.15fr 0.185fr 0.65fr")
            d3.select(".sidebar-container").style("grid-template-rows", "0.15fr 0.24fr 0.65fr")

            d3.select(".header-line-chart").style("padding-top", "20px")
                // d3.select(".dis-content-container").style("grid-template-rows", "0.14fr 0.354fr 0.15fr 0.4")
            d3.select(".dis-content-container").style("grid-template-rows", "10% min-content 10% 37.5%")

            // grid-template-rows: 0.12fr 0.23fr 0.17fr 0.40fr;
            // d3.select(".dis-content-container").style("grid-template-rows", "0.15fr 0.23fr 0.17fr 0.42fr")
            // grid-template-rows: 0.15fr 0.2fr 0.65fr;
            // d3.select(".sidebar-container").style("grid-template-rows", "0.15fr 0.2fr 0.65fr")

            drawAgeStat(barFilters = barFilters, rawData = data)
        })




    })



}





drawFirstTime()