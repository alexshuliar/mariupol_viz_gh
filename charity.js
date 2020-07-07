const drawTable = function(data) {

    tbody = d3.select("#charity-table").select(".tbody")

    tbody.selectAll("div.row-cell").data(data).enter().append("div").attr("class", "row-cell")
        .call(row => row.append("div").attr("class", "td-cell period").append("text").text(d => d.period))
        .call(row => row.append("div").attr("class", "td-cell hospital").append("text").text(d => d.hospital))
        .call(row => row.append("div").attr("class", "td-cell name").append("text").text(d => d.legal_entity_name))
        .call(row => row.append("div").attr("class", "td-cell goods").append("text").text(d => d.goods))
        .call(row => row.append("div").attr("class", "td-cell sum").append("text").text(d => d.value))







    filterColumns = {
        period: "period",
        hospital: "hospital",
        legal_entity_name: "name",
        goods: "goods"
    }

    Object.keys(filterColumns).forEach(function(key) {

        nested = d3.nest()
            .key(function(d) { return d[key] })
            .entries(data)
        valuesList = nested.map(d => d['key'])

        if (key == "period") {

            ordered = ['I квартал', 'II квартал', 'III квартал', 'IV квартал', 'Всього за IV\nквартал', 'Весь період']

            valuesList.sort(function(a, b) {
                return ordered.map(row => row).indexOf(a) - ordered.map(row => row).indexOf(b)
            })
        }

        // d3.select("div#" + filterColumns[key]).select("datalist")
        //     .selectAll("option").data(valuesList).enter()
        //     .append("option")
        //     .attr("value", d => d)

        d3.select(".table-header." + filterColumns[key]).select(".col-options").select("ul")
            .selectAll("label").data(valuesList).enter().append("label").text(d => d)


    })

    filterStatus = {
        period: {
            status: false,
            filterVal: undefined
        },
        hospital: {
            status: false,
            filterVal: undefined
        },
        legal_entity_name: {
            status: false,
            filterVal: undefined
        },
        goods: {
            status: false,
            filterVal: undefined
        }
    }

    d3.select("#charity-table").selectAll(".table-header").on("click", function() {
        colSelected = this.classList[1]

        if (colSelected === "sum") {
            return undefined
        } else {
            ulClosest = this.querySelector("ul")
            ulClosest.classList.toggle("active")

            d3.selectAll(".table-header").selectAll("ul").classed("active", function(d) {
                colClosest = this.closest(".table-header").classList[1]
                if (colClosest !== colSelected) {
                    return false
                } else {
                    return d3.select(this).classed("active")
                }
            })
        }


    })

    d3.select("#charity-table").selectAll(".col-options label").on("click", function() {
        filterName = this.closest(".table-header").classList[1]
        filterText = this.textContent
        d3.select(".filter-cell." + filterName).select("text").text(filterText)
        d3.select(".filter-cell." + filterName).classed("active", true)


        colId = (filterName === "name") ? "legal_entity_name" : filterName
        valueChoice = filterText

        filterStatus[colId]['status'] = true
        filterStatus[colId]['filterVal'] = valueChoice

        activeFilters = Object.keys(filterStatus).filter(key =>
            (filterStatus[key]['status'] === true))


        let filteredData = data

        activeFilters.forEach(function(key) {

            filteredData = filteredData.filter(d => (d[key] === filterStatus[colId]['filterVal']))

        })

        tbody.selectAll(".row-cell").remove()

        tbody.selectAll("div.row-cell").data(filteredData).enter().append("div").attr("class", "row-cell")
            .call(row => row.append("div").attr("class", "td-cell period").append("text").text(d => d.period))
            .call(row => row.append("div").attr("class", "td-cell hospital").append("text").text(d => d.hospital))
            .call(row => row.append("div").attr("class", "td-cell name").append("text").text(d => d.legal_entity_name))
            .call(row => row.append("div").attr("class", "td-cell goods").append("text").text(d => d.goods))
            .call(row => row.append("div").attr("class", "td-cell sum").append("text").text(d => d.value))
    })

    d3.select("#charity-table").selectAll(".filter-cell").selectAll("span").on("click", function() {
        this.closest(".filter-cell").classList.toggle("active")

        filterName = this.closest(".filter-cell").classList[1]
        colId = filterName ? "legal_entity_name" : filterName
        filterStatus[colId]['status'] = false

        tbody.selectAll(".row-cell").remove()

        tbody.selectAll("div.row-cell").data(data).enter().append("div").attr("class", "row-cell")
            .call(row => row.append("div").attr("class", "td-cell period").append("text").text(d => d.period))
            .call(row => row.append("div").attr("class", "td-cell hospital").append("text").text(d => d.hospital))
            .call(row => row.append("div").attr("class", "td-cell name").append("text").text(d => d.legal_entity_name))
            .call(row => row.append("div").attr("class", "td-cell goods").append("text").text(d => d.goods))
            .call(row => row.append("div").attr("class", "td-cell sum").append("text").text(d => d.value))
    })



}



const roundToTwo = function(num) {
    return +(Math.round(num + "e+2") + "e-2");
}


const rowConverterData = function(d) {



    keys = Object.keys(d)

    keys.forEach(function(key) {
        if (key === "value") {
            d[key] = roundToTwo(+d[key])

        } else if (d[key] === "") {
            d[key] = NaN
        }
    })

    return d

}



var defaults = {
    margin: {
        top: 24,
        right: 0,
        bottom: 0,
        left: 0
    },
    rootname: "TOP",
    format: ",d",
    title: "",
    width: document.querySelector("#treemap-container").getBoundingClientRect().width - 5,
    height: document.querySelector("#treemap-container").getBoundingClientRect().height - 24 - 35 - 5
};

console.log(document.querySelector("#treemap-container").getBoundingClientRect().height);

function main(o, data) {
    var root,
        opts = Object.assign(Object.assign(defaults), o),
        formatNumber = d3.format(opts.format),
        rname = opts.rootname,
        margin = opts.margin,
        // offset to correct grandparent block - header of the chart
        offset = 35,
        height = 36 + 16;


    // d3.select("#chart").style("width", opts.width + "px").style("height", opts.height + "px")
    var width = opts.width - margin.left - margin.right,
        // height = opts.height - margin.top - margin.bottom - theight,
        height = opts.height,
        transitioning;

    colors = [
            "#DBB4D6", "#8CBF3A", "#C98BBC", "#B5C4E6",
            "#2678bd", "#AC468A", "#4762AB", "#5f8fca", "#939CCF"
        ]
        //    "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"

    // var color = d3.scale.category20c();
    var color = d3.scale.ordinal()
        .range(colors);

    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        .children(function(d, depth) {
            return depth ? null : d._children;
        })
        .sort(function(a, b) {
            return a.value - b.value;
        })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top + offset)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + offset) + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent
        .call(function(gp) {
            gp.append("rect")
                .attr("y", -margin.top - offset)
                .attr("width", width * 0.25)
                .attr("height", margin.top)
        })
        .call(function(gp) {
            gp.append("text")
                .attr("x", 15)
                .attr("y", 6 - margin.top - offset + 7)
                .attr("dy", ".75em")

        })
        .call(function(gp) {
            gp.append("text")
                .attr("class", "hospital-summary")
                .attr("y", 6 - margin.top - offset + 7)
                .attr("x", width * 0.3)
                .attr("width", width * 0.7)
                .attr("height", margin.top)
                .attr("dy", ".75em");
        })



    // grandparent.append("text")
    //     .attr("x", 6)
    //     .attr("y", 6 - margin.top - offset)
    //     .attr("dy", ".75em");


    // d3.select("#chart").insert("p", ":first-child").attr("class", "title").text(opts.title)


    // console.log(data)

    root = data;

    initialize(root);
    accumulate(root);

    root['value'] = roundToTwo(root.value) * 1000
    root.values.forEach(function(hosp) {
        hosp['value'] = roundToTwo(hosp.value) * 1000

        hosp.values.forEach(function(item) {
            item['value'] = roundToTwo(item.value) * 1000
        })

    })


    layout(root);
    // console.log(root);
    display(root);



    function initialize(root) {
        // console.log(root);
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
        return (d._children = d.values) ?

            d.value = d.values.reduce(function(p, v) {
                return p + accumulate(v);
            }, 0) :
            d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {

        if (d._children) {
            treemap.nodes({
                _children: d._children
            });
            d._children.forEach(function(c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    function alignText() {
        d3.select(".depth").selectAll("g").each(function() {
            let rectWidth
            let textVal

            hasRectParent = this.querySelector("rect.parent")

            if (hasRectParent) {



                // if (this.className.baseVal === "children") {
                rectWidth = this.querySelector("rect.parent").getBBox().width
                rectHeight = this.querySelector("rect.parent").getBBox().height
                    // rectArea = rectWidth * rectHeight

                // console.log(this)

                textVal = this.querySelector("tspan")

                d3.select(this.lastChild.lastChild).attr("dy", "18px")

                parentText = textVal.closest("text")
                    // // } else {

                //     // console.log(this)
                //     rectWidth = this.querySelector("rect.child").getBBox().width
                //     textVal = this.querySelector("text")

                // }

                // console.log(textVal.closest("text"));
                textWidth = textVal.getBBox().width

                // console.log(this)
                // console.log(rectWidth)
                // console.log(textVal)
                // console.log(textWidth)

            }


            // if (rectWidth > 85) {
            if (rectWidth > 100 && rectHeight > 50) {

                // console.log(textVal)

                // console.log(textVal)
                // console.log(rectWidth);

                d3.select(textVal).call(wrap, rectWidth - 10)
                if (parentText) {

                    parentText.style.opacity = 1
                } else {
                    textVal.opacity = 1
                }

            }
        })
        d3.selectAll("tspan").attr("font-size", "11px")
        d3.selectAll("text").attr("font-size", "11px")
    }

    function roundRect() {
        d3.select(".depth").selectAll("rect.parent").attr("rx", function(d) {
            rxVal = this.getBoundingClientRect().width
            if (rxVal > 50) {
                return Math.pow(rxVal, 0.35)
            } else {
                return rxVal * 0.1
            }

        })
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d).parent)

        grandparent.datum(d.parent).select("text.hospital-summary")
            .text(name(d).key);




        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");

        g.filter(function(d) {
                return d._children;
            })
            .classed("children", true)
            .on("click", transition);

        var children = g.selectAll(".child")
            .data(function(d) {
                return d._children || [d];
            })
            .enter().append("g");

        children.append("rect")
            .attr("class", "child")
            .call(rect)
            .append("title")
            .text(function(d) {
                return d.key + " (" + formatNumber(d.value).toString().replace(/,/g, " ") + ")";
            });
        children.append("text")
            .attr("class", "ctext")
            .text(function(d) {

                return d.key;
            })
            // .call(wrap)
            .call(text2);

        g.append("rect")
            .attr("class", "parent")
            .call(rect);

        g.selectAll("rect.parent").append("title")
            .text(function(d) {
                return d.key + " (" + formatNumber(d.value).toString().replace(/,/g, " ") + ")";
            })


        var t = g.append("text")
            .attr("class", "ptext")
            .attr("dy", ".75em")

        t.append("tspan")
            .text(function(d) {
                return d.key;
            });
        t.append("tspan")
            .attr("dy", "1.0em")
            .text(function(d) {
                return formatNumber(d.value).toString().replace(/,/g, " ");
            });
        t.call(text);

        g.selectAll("rect")
            .style("fill", function(d) {
                return color(d.key);
            });

        function transition(d) {

            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function(a, b) {
                return a.depth - b.depth;
            });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
            t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
            t2.selectAll(".ptext").call(text).style("fill-opacity", 0);
            t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);



            // Remove the old node when the transition is finished.
            t1.remove().each("end", function() {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });

            function returnOpacity() {
                d3.selectAll(".ptext").transition().duration(300).style("fill-opacity", function() {
                    gClosest = this.closest("g")
                    rectWidth = gClosest.querySelector("rect.parent").getBBox().width
                    rectHeight = gClosest.querySelector("rect.parent").getBBox().height
                        // rectArea = rectWidth * rectHeight

                    if (rectWidth > 100 && rectHeight > 50) {
                        return 1
                    } else {
                        return 0
                    }
                });
            }

            setTimeout(alignText, 800)
            setTimeout(roundRect, 800)
            setTimeout(returnOpacity, 800)

        }


        d3.selectAll(".depth").selectAll("rect.child").attr("opacity", 0)

        // split text in rectangles
        alignText()



        return g;
    }

    function text(text) {

        text.selectAll("tspan")
            .attr("x", function(d) {
                return x(d.x) + 10;
            })
        text.attr("x", function(d) {
                return x(d.x) + 10;
            })
            .attr("y", function(d) {

                // if (d.key === "КУ Маріупольська міська лікарня №9-МСЧ працівників ДМФ") {
                //     return 15
                // } else {
                //     return y(d.y) + 15;
                // }
                if (this.closest("g").className.baseVal === "children") {
                    return d.y + 15
                } else {
                    return y(d.y) + 15
                }

            })

        .style("opacity", function(d) {

            return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
        });

        // console.log(this);
    }


    function text2(text) {
        text.attr("x", function(d) {
                return x(d.x + d.dx) - this.getComputedTextLength() - 6;
            })
            .attr("y", function(d) {
                return y(d.y + d.dy) - 6;
            })
            .style("opacity", function(d) {

                return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0;
            });

        // console.log(this);
    }

    function rect(rect) {

        rect.attr("x", function(d) {
                return x(d.x);
            })
            .attr("y", function(d) {
                // modified to get this first bar not overlap the top of grandparent
                // if (d.key === "КУ Маріупольська міська лікарня №9-МСЧ працівників ДМФ") {
                // if (d.key === 'КНП ММП "Маріупольська міська лікарня №4 ім. І.К.Мацука" ') {
                //     console.log(this)
                //     console.log(d.y)
                //     console.log(y(d.y))
                //     return d.y
                // } else {

                //     // console.log(d.y)
                //     // console.log(y(d.y))
                //     return y(d.y);
                // }
                if (this.closest("g").className.baseVal === "children") {
                    return d.y
                } else {
                    return y(d.y)
                }



            })
            .attr("width", function(d) {
                return x(d.x + d.dx) - x(d.x);
            })
            .attr("height", function(d) {
                return y(d.y + d.dy) - y(d.y);
            });
    }



    function name(d) {
        // return d.parent ?
        //     // name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")" :
        //     name(d.parent) + " " + d.key + ": " + formatNumber(d.value) :
        //     // d.key + " (" + formatNumber(d.value) + ")";
        //     d.key + ": " + formatNumber(d.value);
        return d.parent ? {
            parent: d.parent.key + ": " + formatNumber(d.parent.value).toString().replace(/,/g, " "),
            key: d.key + ": " + formatNumber(d.value).toString().replace(/,/g, " ")
        } : {
            parent: d.key + ": " + formatNumber(d.value).toString().replace(/,/g, " "),
            key: ""
        }
    }

    roundRect()

    // function wrap(text, width) {
    function wrap(text) {
        text.each(function() {
            // console.log(this)
            // console.log(this.closest("g"))
            // console.log(this.closest("g").lastChild.previousSibling)

            width = this.closest("g").lastChild.previousSibling.getBBox().width


            // console.log(width);
            var text = d3.select(this),
                textInit = text.text(),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.2, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0.7,
                tspan = text.text(null)
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");

            // console.log(textInit)

            // scaleFactor = 7.2453
            scaleFactor = 7.2453
            while (word = words.pop()) {

                line.push(word);
                tspan.text(line.join(" "));
                // console.log(line)
                // console.log(line.join(" ").length * scaleFactor);
                // console.log(width);
                // if (tspan.node().getComputedTextLength() > width - 4) {
                if (line.join(" ").length * scaleFactor > width) {

                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        // .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .attr("dy", "15px")
                        .text(word);
                }

            }
        });
    }





}

d3.csv("mariupol_data_analysis/charity_incomes_v3.csv", rowConverterData, function(err, res) {

    // console.log(res);

    drawTable(res)


    var data = d3.nest().key(function(d) {
        return d.hospital;
    }).key(function(d) {
        return d.goods_fix;
    }).entries(res);



    main({
        title: "Розмір благодійної допомоги отриманий в натуральній формі"
    }, {
        key: "ВСІ ЛІКАРНІ",
        values: data
    });

    data.forEach(function(key) {

        key.values.forEach(function(key) {
            delete key.values
            delete key._children
        })
    })

    // console.log(data)




});