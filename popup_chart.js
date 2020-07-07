// const drawSubButtons = function(buttonsData) {


//     d3.select("div.popup-chart").selectAll("div")
//         .data(buttonsData)
//         .enter()
//         .append("div")
//         .attr("class", d => "sub-button" + " " + d['chart_name'])
//         // .style("float", "left")
//         .append("text").text(d => d["chart_title"])


//     d3.select("div.last-week").style("clear", "right")


// }

const createPopupChart = function(searchQuery, first = true) {

    // console.log(searchQuery)




    chartIndicator = document.getElementById("popup-chart-container")


    if (chartIndicator) {


        d3.select("div#popup-chart-container")
            // .transition()
            // .style("opacity", 0)
            .remove()

    }


    // chartContainer = d3.select("div#doctor-details")
    //     .append("div")
    //     .attr("id", "popup-chart-container")

    // d3.select("div#popup-chart-container").append("div").attr("id", "doctor-name").append("text").text(searchQuery)
    // d3.select("div#popup-chart-container").append("div").attr("class", "popup-chart-title").attr("id", "load-title").text("Тижневе навантаження лікаря")
    // d3.select("div#popup-chart-container").append("div").attr("class", "popup-chart-title").attr("id", "gender-age-title").text("Статево-віковий розподіл пацієнтів")
    // d3.select("div#popup-chart-container").append("div").attr("class", "chart-buttons")
    // d3.select("div#popup-chart-container").append("div").attr("class", "popup-chart")

    // d3.select("div#doctor-profile").select("p#doctor-name").text(searchQuery)
    // d3.select("div.gender-age").append("div").attr("class", "popup-chart-title").attr("id", "gender-age-title").text("Статево-віковий розподіл пацієнтів")

    // d3.select("div#doctor-details")
    //     .transition()
    //     .delay(200)
    //     .style("opacity", 1)

    // chartButtons = [
    //     { chart_name: "week-stat", chart_title: "Навантаження по дням тижня" },
    //     { chart_name: "age-sex-stat", chart_title: "Статево-вікова статистика" },
    // ]


    // d3.select("div.chart-buttons").selectAll("div")
    //     .data(chartButtons)
    //     .enter()
    //     .append("div")
    //     .attr("class", d => "ch-button" + " " + d['chart_name'])
    //     .style("float", "left")
    //     .append("text").text(d => d["chart_title"])




    // weekButtons = [
    //     { chart_name: "week-mean", chart_title: "Середнє за весь час" },
    //     { chart_name: "last-week", chart_title: "Пацієнтів за минулий тиждень" },
    // ]

    // drawSubButtons(weekButtons)

    createGenderAge(searchQuery)

    createHeatmap(searchQuery)




}


const createHeatmap = function(docName) {

    monthMapper = {
        January: "Січень",
        February: "Лютий",
        March: "Березень",
        April: "Квітень",
        May: "Травень",
        June: "Червень",
        July: "Липень",
        August: "Серпень",
        September: "Вересень",
        October: "Жовтень",
        November: "Листопад",
        December: "Грудень",
    }

    function drawCalendar(dateData) {

        var weeksInMonth = function(month) {
            var m = d3.timeMonth.floor(month)
            return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m, 1)).length;
        }

        var minDate = d3.min(dateData, function(d) { return new Date(d.visit_date) })
        var maxDate = d3.max(dateData, function(d) { return new Date(d.visit_date) })

        var cellMargin = 2,
            cellSize = 19;

        var translateMargin = 65

        var day = d3.timeFormat("%u"),
            week = d3.timeFormat("%W"),
            format = d3.timeFormat("%Y-%m-%d"),
            titleFormat = d3.utcFormat("%a, %d-%b");
        monthName = d3.timeFormat("%B"),
            months = d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);



        var svg = d3.select("#calendar-heatmap").selectAll("svg")
            .data(months)
            .enter().append("svg")
            .attr("class", "month")
            .attr("height", ((cellSize * 7) + (cellMargin * 8) + 20)) // the 20 is for the month labels
            .attr("width", function(d) {
                var columns = weeksInMonth(d);
                return ((cellSize * columns) + (cellMargin * (columns + 1))) + translateMargin;
            })
            .append("g")

        svg2 = document.querySelector("#calendar-heatmap").querySelector("svg:last-child")
        svg2.style.width = svg2.getBoundingClientRect().width * 0.7


        svg.append("text")
            .attr("class", "month-name")
            .attr("y", (cellSize * 7) + (cellMargin * 8) + 15)
            .attr("x", function(d) {
                var columns = weeksInMonth(d);
                return (((cellSize * columns) + (cellMargin * (columns + 1))) / 2);
            })
            .attr("text-anchor", "middle")
            .text(function(d) { return monthMapper[monthName(d)]; })

        d3.select("#calendar-heatmap").select("svg").select("text").attr("transform", "translate(" + translateMargin + ", 0)")


        var rect = svg.selectAll("rect.day")
            .data(function(d, i) { return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1)); })
            .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("rx", 3).attr("ry", 3) // rounded corners
            .attr("fill", '#eaeaea') // default light grey fill
            .attr("y", function(d) { return ((day(d) - 1) * cellSize) + ((day(d) - 1) * cellMargin) + cellMargin; })
            .attr("x", function(d) { return ((week(d) - week(new Date(d.getFullYear(), d.getMonth(), 1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(), d.getMonth(), 1))) * cellMargin) + cellMargin; })
            // .attr("transform", "translate(" + translateMargin + ", 0)")
            .on("mouseover", function(d) {
                d3.select(this).classed('hover', true);
            })
            .on("mouseout", function(d) {
                d3.select(this).classed('hover', false);
            })
            .datum(format);

        d3.select("#calendar-heatmap").select("svg").selectAll("rect").attr("transform", "translate(" + translateMargin + ", 0)")

        rect.append("title")
            .text(function(d) { return titleFormat(new Date(d)); });

        var lookup = d3.nest()
            .key(function(d) { return d.visit_date; })
            .rollup(function(leaves) {
                return d3.sum(leaves, function(d) { return parseInt(d.count); });
            })
            .object(dateData);


        var scale = d3.scaleLinear()
            .domain(d3.extent(dateData, function(d) { return parseInt(d.count); }))
            .range([0.4, 1]); // the interpolate used for color expects a number in the range [0,1] but i don't want the lightest part of the color scheme

        rect.filter(function(d) { return d in lookup; })
            .style("fill", function(d) { return d3.interpolatePuBu(scale(lookup[d])); })
            .select("title")
            .text(function(d) { return titleFormat(new Date(d)) + ":  " + lookup[d]; });


        weekNames = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"]

        d3.select("#calendar-heatmap").select("svg").selectAll("text.week-name").data(weekNames).enter().append("text")
            .attr("class", "week-name")
            .attr("y", (d, i) => (i + 1) * (cellSize) + (i * cellMargin) - cellMargin)
            .attr("x", 55)
            .attr("text-anchor", "end")
            .text(d => d)

    }

    if (searchQuery) {



        d3.csv("mariupol_data_analysis/doc_day_load_2m_v2.csv").then(function(data) {

            console.log(docName.name)
            data = data.filter(d => d['ПІБ лікаря'] === docName.name)


            svgIndicator = document.getElementsByClassName("month").length
            if (svgIndicator > 0) {

                d3.select("#calendar-heatmap").selectAll("svg")
                    .remove()
            }

            // setTimeout(drawCalendar, 600)

            drawCalendar(data);


        })

    }




}



// draw bars

// const createBars = function(docName) {

//     d3.csv("mariupol_data_analysis/doctors_day_load.csv", rowConverterData).then(function(data) {

//         newDataset = data.filter(d => (d['corrected_names'] === docName))

//         svgIndicator = document.getElementsByClassName("load-chart").length
//         if (svgIndicator === 1) {

//             d3.select("div.popup-chart").select("div.load-chart").remove()
//             d3.select("div.popup-chart").selectAll("div.sub-button").remove()
//         }

//         drawSubButtons(weekButtons)

//         var w = 420;
//         var h = 250;
//         var padding = 25;


//         let yScale = d3.scaleLinear()
//             .domain([0, d3.max(data, d => d['mean_patients'])])
//             .range([h - padding, padding])

//         let xScale = d3.scaleBand()
//             .domain(data.map(d => (d['visit_dayofweek'])))
//             .range([padding, w - padding])
//             .paddingInner(0.7)
//             .paddingOuter(0.4)
//             // .padding(0.7)



//         xAxis = d3.axisBottom()
//             .scale(xScale)
//             .ticks(10)

//         yAxis = d3.axisLeft()
//             .scale(yScale)
//             .ticks(5);



//         let svg = d3.select("div.popup-chart")
//             .append("div")
//             .attr("class", "load-chart")
//             .append("svg")
//             .attr("width", w)
//             .attr("height", h)

//         svg.selectAll("rect")
//             .data(newDataset)
//             .enter()
//             .append("rect")
//             .attr("x", d => xScale(d['visit_dayofweek']))
//             .attr("y", d => yScale(d['mean_patients']))
//             .attr("height", d => h - yScale(d['mean_patients']))
//             .attr("width", xScale.bandwidth() * 1.3)
//             .attr("transform", "translate(0," + (-padding) + ")")
//             .append("title")
//             .text(function(d) {
//                 return formatPay(d['mean_patients'])
//             });




//         svg.append("g")
//             .attr("class", "x-axis")
//             .attr("transform", "translate(0," + (h - padding) + ")")
//             .call(xAxis);

//         svg.select(".x-axis").selectAll("text").style("font-size", "8px")

//         svg.append("g")
//             .attr("class", "y-axis")
//             .attr("transform", "translate(" + padding + ",0)")
//             .call(yAxis);




//         d3.selectAll("div.sub-button").on("click", function() {

//             mapCol = {
//                 "week-mean": "mean_patients",
//                 "last-week": "n_patients",
//             }


//             whichButton = this.getAttribute("class").split(" ").slice(-1)[0]
//             colName = mapCol[whichButton]

//             yScale.domain([0, d3.max(data, d => d[colName])])


//             xAxis = d3.axisBottom()
//                 .scale(xScale)
//                 .ticks(10)

//             yAxis = d3.axisLeft()
//                 .scale(yScale)
//                 .ticks(5);

//             // replace NaN values with zeros for further transition
//             selection = svg.selectAll("rect")
//             selection
//                 .call(function(rects) {
//                     rects.attr("height", function() {
//                         rectHeight = this.getAttribute("height")
//                         if (isNaN(rectHeight)) {
//                             return 0
//                         } else {
//                             return rectHeight
//                         }
//                     })
//                 })
//                 .call(function(rects) {
//                     rects.attr("y", function() {
//                         rectTop = this.getAttribute("y")
//                         if (rectTop === null) {
//                             return h
//                         } else {
//                             return rectTop
//                         }
//                     })
//                 })



//             svg.selectAll("rect")
//                 .data(newDataset)
//                 .transition()
//                 // .enter()
//                 // .append("rect")
//                 .attr("x", d => xScale(d['visit_dayofweek']))
//                 .attr("y", d => yScale(d[colName]))
//                 .attr("height", d => h - yScale(d[colName]))
//                 .attr("width", xScale.bandwidth() * 1.3)
//                 .attr("transform", "translate(0," + (-padding) + ")")

//             svg.selectAll("rect")
//                 .select("title")
//                 .text(function(d) {
//                     return formatPay(d[colName])
//                 })



//             svg.select("g.y-axis")
//                 .transition()
//                 .call(yAxis);






//         })

//     })


//     d3.selectAll("div.ch-button").on("click", function() {


//         whichButton = this.getAttribute("class").split(" ").slice(-1)[0]


//         // if (whichButton === 'week-stat') {
//         //     createBars(docName)
//         // } else if (whichButton === 'age-sex-stat') {
//         //     createGenderAge(docName)
//         // }



//     })


// }



const createGenderAge = function(docName) {


    d3.csv("mariupol_data_analysis/gender_age_stat_v2.csv", rowConverterData).then(function(data) {

        // ageOrder = ["y0-5", "y6-17", "y18-39", "y40-64", "y65+"]
        ageOrder = ["y65+", "y40-64", "y18-39", "y6-17", "y0-5"]

        let genderAverage = d3.nest()
            .key(function(d) { return d.person_gender })
            .key(function(d) { return d.person_age })
            .rollup(function(v) { return d3.sum(v, function(d) { return d.n_visits; }); })
            .entries(data)

        genderAv = genderAverage.map(function(gender) {
            return gender.values.map(function(d) {
                return {
                    person_gender: gender.key,
                    person_age: d.key,
                    n_visits: d.value
                }
            })
        })

        genderAvFlat = genderAv.flat()

        genderAvFlat.sort(function(a, b) {
            return ageOrder.map(row => row).indexOf(a['person_age']) - ageOrder.map(row => row).indexOf(b['person_age']);
        });


        sumGenderAv = genderAvFlat.reduce(function(a, b) { return { n_visits: a.n_visits + b.n_visits } }).n_visits
            // to percent
        genderAvFlat = genderAvFlat.map(function(d) {
            return {
                person_age: d.person_age,
                person_gender: d.person_gender,
                n_visits: d.n_visits / sumGenderAv
            }
        })

        let femaleAverage = genderAvFlat.filter(d => d.person_gender == 'жіноча')
            // let femaleAverage = genderAverage.filter(d => d.key == 'жіноча')[0]['values']
            // femaleAverage.sort(function(a, b) {
            //     return ageOrder.map(row => row).indexOf(a['key']) - ageOrder.map(row => row).indexOf(b['key'])
            // })

        // femSum = femaleAverage.reduce(function(a, b) { return { value: a.value + b.value } }).value
        //     // to percent
        // femaleAverage = femaleAverage.map(function(d) {
        //     return {
        //         key: d.key,
        //         value: d.value / femSum
        //     }
        // })

        let maleAverage = genderAvFlat.filter(d => d.person_gender == 'чоловіча')
            // maleAverage.sort(function(a, b) {
            //     return ageOrder.map(row => row).indexOf(a['key']) - ageOrder.map(row => row).indexOf(b['key'])
            // })

        // maleSum = maleAverage.reduce(function(a, b) { return { value: a.value + b.value } }).value
        //     // to percent
        // maleAverage = maleAverage.map(function(d) {
        //     return {
        //         key: d.key,
        //         value: d.value / maleSum
        //     }
        // })

        // console.log(maleAverage)







        // console.log(newDataset)


        // d3.select("div#doctor-details").append("div").attr("class", "gender-age")


        genAgeSvg = document.getElementsByClassName("gender-age")[0]
        w = genAgeSvg.getBoundingClientRect().width - 5
        h = genAgeSvg.getBoundingClientRect().height
        padding = 21
            // var w = 300;
            // var h = 250;
            // var padding = 30;

        let yScaleAge = d3.scaleBand()
            .domain(femaleAverage.map(d => (d['person_age'])))
            .range([padding, h - padding])
            .paddingOuter(0.3)


        // let xScaleMale = d3.scaleLinear()
        //     .domain([0, d3.max(male, d => d['n_visits'])])
        //     .range([0, w / 2])

        // let xScaleFemale = d3.scaleLinear()
        //     .domain([0, d3.max(female, d => d['n_visits'])])
        //     .range([0, w / 2])

        let xScaleGender = d3.scaleLinear()
            // .domain([0, d3.max(newDataset, d => d['n_visits'])])
            .domain([0, 0.3]) // domain in fractions/percents
            .range([0, w / 3])

        if (searchQuery) {

            svg = d3.select("div.gender-age").select("svg")


            svg.selectAll("g.average").selectAll("rect")
                .transition().duration(800)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 1)
                .attr("stroke-width", 2)



            d3.select("div.doctor-profile").select("p#doc-name").text(searchQuery.name)
            d3.select("div.doctor-profile").select("p#doc-hospital").text(searchQuery.hospital)
            d3.select("div.doctor-profile").select("p#doc-spec").text(searchQuery.spec)

            d3.select("div.doctor-profile").select("p#load-indicator").text(function() {

                text_start = "Даний лікар приймає на "
                text_end = " пацієнтів в тиждень, ніж в середньому."

                if (searchQuery.diff > 0) {

                    return text_start + (searchQuery.diff.toFixed(3) * 100) + "% більше" + text_end

                } else {

                    return text_start + (Math.abs(searchQuery.diff).toFixed(3) * 100) + "% менше" + text_end

                }
            })

            newDataset = data.filter(d => (d['ПІБ лікаря'] === searchQuery.name))
            newDataset.sort(function(a, b) {
                return ageOrder.map(row => row).indexOf(a['person_age']) - ageOrder.map(row => row).indexOf(b['person_age']);
            });


            sumDataset = newDataset.reduce(function(a, b) { return { n_visits: a.n_visits + b.n_visits } }).n_visits
                // to percent
            newDataset = newDataset.map(function(d) {
                return {
                    person_age: d.person_age,
                    person_gender: d.person_gender,
                    n_visits: d.n_visits / sumDataset
                }
            })





            let male = newDataset.filter(d => d['person_gender'] === 'чоловіча')
            let female = newDataset.filter(d => d['person_gender'] === 'жіноча')

            svg.selectAll("g.selected").remove()

            svg.append("g").attr("class", "male selected").selectAll("rect").data(male).enter().append("rect")
                .attr("height", 20)
                .attr("y", d => yScaleAge(d['person_age']))
                .attr("x", d => w / 2 - padding)
                .transition().duration(800)
                .attr("x", d => w / 2 - xScaleGender(d['n_visits']) - padding)
                .attr("width", d => xScaleGender(d['n_visits']))
                .attr("stroke-width", 3)
                .attr("opacity", 0.5)


            svg.selectAll("g.male").selectAll("rect").append("title")
                .text(function(d) {
                    return (d.n_visits * 100).toFixed(2) + "%"
                })



            svg.append("g").attr("class", "female selected").selectAll("rect").data(female).enter().append("rect")
                .attr("height", 20)
                .attr("y", d => yScaleAge(d['person_age']))
                .attr("x", w / 2 + padding)
                .attr("width", 0)
                .transition().duration(800)
                .attr("width", d => xScaleGender(d['n_visits']))
                .attr("stroke-width", 3)
                .attr("opacity", 0.5)

            svg.selectAll("g.female").selectAll("rect").append("title")
                .text(function(d) {
                    return (d.n_visits * 100).toFixed(2) + "%"
                })


        } else {

            svg = d3.select("div.gender-age").append("svg")
                .attr("height", h)
                .attr("width", w)



            let yAxisRight = d3.axisLeft(yScaleAge)
            yAxisRight.tickFormat(function(val) {
                return val.slice(1)
            }).tickSize(0)

            let yAxisLeft = d3.axisRight(yScaleAge).tickFormat("")

            svg.append("g").attr("class", "axis-right")
                .attr("transform", "translate(" + (w / 2 + padding - 5) + ", -4)")
                .call(yAxisRight)
                // svg.append("g").attr("class", "axis-left")
                //     .attr("transform", "translate(" + (w / 2 - padding + 5) + ", 0)")
                //     .call(yAxisLeft)
            d3.select(".axis-right").select(".domain").remove()
                // svg.select(".axis-right").selectAll("text").attr("transform", function(d) {

            //     if (d.length === 4) {
            //         return "translate(-6, 0)"
            //     } else if (d.length === 5) {
            //         return "translate(-5, 0)"
            //     } else {
            //         return "translate(-1, 0)"
            //     }

            // })



            svg.select(".axis-right").selectAll("text").attr("transform", function(d) {

                if (d === "y65+") {
                    return "translate(-1, 0)"
                } else if (d === "y0-5") {
                    return "translate(-3, 0)"
                } else if (d.length === 5) {
                    return "translate(0, 0)"

                } else {
                    return "translate(4, 0)"
                }

            })




            // drawing average doctor
            svg.append("g").attr("class", "male average").selectAll("rect").data(maleAverage).enter().append("rect")
                .attr("height", 20)
                .attr("y", d => yScaleAge(d['person_age']))
                .attr("x", d => w / 2 - padding)
                .transition().duration(800)
                .attr("x", d => w / 2 - xScaleGender(d['n_visits']) - padding)
                .attr("width", d => xScaleGender(d['n_visits']))
                // .attr("fill-opacity", 0.3)
                // .attr("stroke-opacity", 0.3)
                // .attr("stroke-width", 0)
                // .append("title")
                // .text(function(d) {
                //     return formatPay(d['value'])
                // })

            svg.append("g").attr("class", "female average").selectAll("rect").data(femaleAverage).enter().append("rect")
                .attr("height", 20)
                .attr("y", d => yScaleAge(d['person_age']))
                .attr("x", w / 2 + padding)
                .attr("width", 0)
                .transition().duration(800)
                .attr("width", d => xScaleGender(d['n_visits']))
                // .attr("fill-opacity", 0.3)
                // .attr("stroke-opacity", 0.3)
                // .attr("stroke-width", 0)
                // .append("title")
                // .text(function(d) {
                //     return formatPay(d['value'])
                // })

        }








        // // line between bars
        // svg.append("line")
        //     .attr("y1", 0)
        //     .attr("y2", h)
        //     .attr("x1", w / 2)
        //     .attr("x2", w / 2)
        //     .attr("stroke-width", 2)
        //     .attr("stroke", "black");





    })


}