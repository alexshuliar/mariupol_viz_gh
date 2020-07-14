const createPopupChart = function(searchQuery, first = true) {

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

    weekMapper = {
        Mon: "Пн",
        Tue: "Вт",
        Wed: "Ср",
        Thu: "Чт",
        Fri: "Пт",
        Sat: "Сб",
        Sun: "Нд",
    }



    function drawCalendar(dateData) {

        var weeksInMonth = function(month) {
            var m = d3.timeMonth.floor(month)
            return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m, 1)).length;
        }

        var minDate = d3.min(dateData, function(d) { return new Date(d.visit_date) })
        var maxDate = d3.max(dateData, function(d) { return new Date(d.visit_date) })

        var cellMargin = 2,
            cellSize = 17;

        var translateMargin = 65

        var day = d3.timeFormat("%u"),
            week = d3.timeFormat("%W"),
            format = d3.timeFormat("%Y-%m-%d"),
            titleFormat = d3.utcFormat("%a, %d-%B");
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

        svgAll = document.querySelector("#calendar-heatmap").querySelectorAll("svg")

        if (svgAll.length > 1) {
            svg2 = svgAll[1]
            svg2.style.width = svg2.getBoundingClientRect().width * 0.7
        }



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

        svg.style("opacity", 0)

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
            .datum(format)

        d3.select("#calendar-heatmap").select("svg").selectAll("rect").attr("transform", "translate(" + translateMargin + ", 0)")

        rect.append("title")
            .text(function(d) {
                titleStr = titleFormat(new Date(d)).split(",")
                titleUkr = weekMapper[titleStr[0]] + ", " + monthMapper[titleStr[1].split("-")[1]] + "-" + titleStr[1].split("-")[0]
                return titleUkr;
            });

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
            // .style("opacity", 1)
            .select("title")
            .text(function(d) {
                titleStr = titleFormat(new Date(d)).split(",")
                titleUkr = weekMapper[titleStr[0]] + ", " + monthMapper[titleStr[1].split("-")[1]] + "-" + titleStr[1].split("-")[0]
                return titleUkr + ", візитів" + ": " + lookup[d];
            });


        weekNames = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"]

        d3.select("#calendar-heatmap").select("svg").selectAll("text.week-name").data(weekNames).enter().append("text")
            .attr("class", "week-name")
            .attr("y", (d, i) => (i + 1) * (cellSize) + (i * cellMargin) - cellMargin)
            .attr("x", 55)
            .attr("text-anchor", "end")
            .text(d => d)

        svg.transition().duration(400).style("opacity", 1)

    }

    if (searchQuery) {

        d3.csv("mariupol_data_analysis/doc_day_load_2m_v2.csv").then(function(data) {

            data = data.filter(d => d['ПІБ лікаря'] === docName.name)

            svgIndicator = document.getElementsByClassName("month").length
            if (svgIndicator > 0) {

                d3.select("#calendar-heatmap").selectAll("svg")
                    .transition().duration(400).style("opacity", 0)
                    .remove()

                setTimeout(drawCalendar, 500, data)
            } else {
                drawCalendar(data)
            }



            // drawCalendar(data);


        })

    }




}

firstIterFlag = false


const createGenderAge = function(docName) {


    d3.csv("mariupol_data_analysis/gender_age_stat_v2.csv", rowConverterData).then(function(data) {

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
            return ageOrder.indexOf(a['person_age']) - ageOrder.indexOf(b['person_age']);
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

        let maleAverage = genderAvFlat.filter(d => d.person_gender == 'чоловіча')



        genAgeSvg = document.getElementsByClassName("gender-age")[0]
        w = genAgeSvg.getBoundingClientRect().width - 5
        h = genAgeSvg.getBoundingClientRect().height
        padding = 21

        let yScaleAge = d3.scaleBand()
            .domain(femaleAverage.map(d => (d['person_age'])))
            .range([padding, h - padding])
            .paddingOuter(0.3)

        let xScaleGender = d3.scaleLinear()
            .domain([0, 0.3]) // domain in fractions/percents
            .range([0, w / 3])

        if (searchQuery) {

            svg = d3.select("div.gender-age").select("svg")

            if (firstIterFlag) {

                d3.select("div.doctor-profile").select("p#doc-name")
                    .transition().duration(400).style("opacity", 0)
                    .transition().duration(400).text(searchQuery.name)
                    .transition().duration(400).style("opacity", 1)

                d3.select("div.doctor-profile").select("p#doc-hospital")
                    .transition().duration(400).style("opacity", 0)
                    .transition().duration(400).text(searchQuery.hospital)
                    .transition().duration(400).style("opacity", 1)

                d3.select("div.doctor-profile").select("p#doc-spec")
                    .transition().duration(400).style("opacity", 0)
                    .transition().duration(400).text(searchQuery.spec)
                    .transition().duration(400).style("opacity", 1)


                d3.select("div.doctor-profile").select("p#load-indicator")
                    .transition().duration(400).style("opacity", 0)
                    .text(function() {

                        text_start = "Даний лікар приймає на "
                        text_end = " пацієнтів в тиждень, ніж в середньому."

                        if (searchQuery.diff > 0) {

                            return text_start + (searchQuery.diff.toFixed(3) * 100).toString().slice(0, 4) + "% більше" + text_end

                        } else {

                            return text_start + (Math.abs(searchQuery.diff).toFixed(3) * 100).toString().slice(0, 4) + "% менше" + text_end

                        }
                    })
                    .transition().duration(400).style("opacity", 1)

            } else {

                d3.select("div.doctor-profile").select("p#doc-name")
                    .style("opacity", 0)
                    .transition().duration(400).text(searchQuery.name)
                    .transition().duration(400).style("opacity", 1)

                d3.select("div.doctor-profile").select("p#doc-hospital")
                    .style("opacity", 0)
                    .transition().duration(400).text(searchQuery.hospital)
                    .transition().duration(400).style("opacity", 1)

                d3.select("div.doctor-profile").select("p#doc-spec")
                    .style("opacity", 0)
                    .transition().duration(400).text(searchQuery.spec)
                    .transition().duration(400).style("opacity", 1)


                d3.select("div.doctor-profile").select("p#load-indicator")
                    .style("opacity", 0)
                    .transition().duration(400)
                    .text(function() {

                        text_start = "Даний лікар приймає на "
                        text_end = " пацієнтів в тиждень, ніж в середньому."

                        if (searchQuery.diff > 0) {

                            return text_start + (searchQuery.diff.toFixed(3) * 100).toString().slice(0, 4) + "% більше" + text_end

                        } else {

                            return text_start + (Math.abs(searchQuery.diff).toFixed(3) * 100).toString().slice(0, 4) + "% менше" + text_end

                        }
                    })
                    .transition().duration(400).style("opacity", 1)

            }



            newDataset = data.filter(d => (d['ПІБ лікаря'] === searchQuery.name))
            newDataset.sort(function(a, b) {
                return ageOrder.indexOf(a['person_age']) - ageOrder.indexOf(b['person_age']);
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