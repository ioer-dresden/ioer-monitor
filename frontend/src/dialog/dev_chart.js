const dev_chart = {
    chart_compare_selector_toolbar: "#dev_chart_compare",
    chart_selector_toolbar: "#dev_chart",
    endpoint_id: "entwicklungsdiagramm_content",
    imigration: false,
    text: {
        de: {
            title: {
                false: "Wertentwicklung",
                true: "Entwicklungs- vergleich"
            },
            info: "Dieses Diagramm stellt die Entwicklung der Indikatoren dar.",
            indicator: "verfügbare Indikatoren",
            choice: "Bitte wählen.....",
            no_choice: "Kein Indikator gewählt",
            load: "Lädt Diagramm......",
            pnt: "alle Stützpunkte",
            trend: "Prognosewerte",
            unit: "Einheit",
            chart: "Entwicklungsdiagramm für Gebietseinheit",
            set_choice: function () {
                return `Bitte ${base_raumgliederung.getBaseRaumgliederungText(true)} angeben`
            },
            cancel: "Abbrechen",
            value:"Wert",
            explanation:"Relative Änderung des Indikators.",
            startValue:"Anfangswert"
        },
        en: {
            title: {
                false: "Trend chart",
                true: "Trend comparison"
            },
            info: "This diagram represents the trend of the indicators.",
            indicator: "Available indicators",
            choice: "Please choose.....",
            no_choice: "No indicator selected",
            load: "Loading diagram ......",
            pnt: "all base points",
            trend: "Forecast values",
            unit: "Unit",
            chart: "Development diagram for territorial unit",
            set_choice: function () {
                return `Please set ${base_raumgliederung.getBaseRaumgliederungText(true)}`
            },
            cancel: "Cancel",
            value:"Value",
            explanation:"Relative change of indicator value.",
            startValue:"Starting value"
        }
    },
    icon: {
        single: {
            path: "frontend/assets/icon/trend20.png"
        },
        multiple: {
            path: "frontend/assets/icon/trend_compare20.png"
        }
    },
    init: function () {
        if (raeumliche_visualisierung.getRaeumlicheGliederung() === "raster") {
            helper.disableElement(this.chart_selector_toolbar, "vergleichen Sie 2 Indikatoren oder Zeitschnitte miteinander");
            helper.disableElement(this.chart_compare_selector_toolbar, "vergleichen Sie 2 Indikatoren oder Zeitschnitte miteinander");
        } else {
            helper.enableElement(this.chart_selector_toolbar, $(this.chart_selector_toolbar).data("title"));
            helper.enableElement(this.chart_compare_selector_toolbar, $(this.chart_compare_selector_toolbar).data("title"));
        }
        this.controller.set();
    },
    open: function () {
        let lan = language_manager.getLanguage(),
            html = he.encode(`
            <div class="jq_dialog" id="${this.endpoint_id}">
                <div class="container">
                    <h4>${this.text[lan].info}</h4>
                    <div id="diagramm_options">
                        <div id="indikator_choice_container_diagramm">
                            <div>${this.text[lan].indicator}</div>
                            <div id="indicator_ddm_diagramm" class="ui selection multiple dropdown">
                                <i class="dropdown icon"></i>
                                <a id="default_diagramm_choice" class="ui label transition visible" style="display: inline-block !important;"></i></a>
                                <div class="default text">${this.text[lan].choice}</div>
                                <div  id="kat_auswahl_diagramm" class="menu"></div>
                            </div>
                        </div>
                        <div id="diagramm_export">
                            <div title="Diagramm herunterladen">Download:</div>
                            <div id="digramm_export_container">
                                <div id="diagramm_download_format_choice" class="ui compact selection dropdown">
                                    <i class="dropdown icon"></i>
                                    <div class="default text">${this.text[lan].choice}</div>
                                    <div class="menu">
                                        <div class="item" data-format="png">PNG</div>
                                        <div class="item" data-format="pdf">PDF</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="diagramm_choices">
                            <div id="digramm_choices_container">
                                <div class="checkboxes">
                                    <label>
                                        <input type="checkbox" value="" id="alle_stpkt">${this.text[lan].pnt}
                                    </label>
                                    <!--Disabled: Kerngruppenbeschluss am 23.05.19
                                    <label id="prognose_container">
                                        <input type="checkbox" value="" id="prognose">${this.text[lan].trend}
                                    </label>
                                    -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="diagramm_info_text">
                        <div>${this.text[lan].chart}: <b id="diagramm_gebietsname"></b><span id="diagramm_ags"></span> in <b id="diagrmm_gebiets_typ"></b>.</div>
                        <div id="explanation"></div>
                    </div>
                    <div id="container_diagramm" class="container_diagramm">
                        <div id="diagramm">
                            <h3 class="Hinweis_diagramm" id="Hinweis_diagramm_empty">${this.text[lan].no_choice}</h3>
                            <h3 class="Hinweis_diagramm" id="diagramm_loading_info">${this.text[lan].load}......</h3>
                            <svg id="visualisation" height="100"></svg>
                        </div>
                        <div id="tooltip" style="pointer-events: none;"></div>
                    </div>
                </div>
                </div>
            </div>
        `);
        //settings for the manager
        let instructions = {
            endpoint: `${this.endpoint_id}`,
            html: html,
            title: dev_chart.text[lan].title[this.chart.settings.ind_vergleich],
            modal: false,
            width: main_view.getMobileState() ? main_view.getWidth() : main_view.getWidth() * 0.75,
            height: toolbar.getHeight(),
            close: function () {
                dev_chart.chart.settings.state_stueztpnt = false;
                dev_chart.chart.settings.state_prognose = false;
            }
        };
        dialog_manager.setInstruction(instructions);
        dialog_manager.create();
        if (dev_chart.chart.settings.ind_vergleich){
            $('#explanation').text(dev_chart.text[lan].explanation);
        }

        this.chart.create();
    },
    chart: {
        settings: {
            ags: "",
            ind: "",
            name: "",
            ind_vergleich: false,
            state_stueztpnt: false,
            state_prognose: false,
        },
        ind_array_chart: [],
        merge_data: [],
        init: function () {
            const chart = this,
                migrationValues = MigrationValue.getValues(),
                ags = this.settings.ags;
            let svg = d3.select("#visualisation"),
                array = chart.ind_array_chart,
                diagram = $('#diagramm'),
                margin = {top: 20, right: 20, bottom: 30, left: 100},
                chart_width = diagram.width() - margin.left - margin.right,
                chart_height = $('.ui-dialog').height()*(1.2/3),
                margin_top = 0,
                migration_set = false;


            let x = d3.scaleTime().range([0, chart_width]),
                y = d3.scaleLinear().range([chart_height, 0]);

            //show loading info
            $('#diagramm_loading_info').show();

            if (array.length === 0) {
                $('#visualisation').hide();
                $('#Hinweis_diagramm_empty').show();
            } else {
                //clean the chart
                $('#visualisation').show().empty();
                //remove the tip if shown
                $('#Hinweis_diagramm_empty').hide();
            }

            //clean the legend
            $('.legende_single_part_container').remove();

            let g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let line = d3.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.value);
                });

            let curve= d3.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.value);
                })
                .curve(d3.curveBasis);

            let def = $.Deferred();

            //create the call
            function defCalls() {
                let requests = [],
                    settings = {
                        "forecast": chart.settings.state_prognose.toString(),
                        "all_points": chart.settings.state_stueztpnt.toString(),
                        "compare": chart.settings.ind_vergleich.toString()
                    };
                $.each(array, function (key, value) {
                    requests.push(RequestManager.getTrendValues(value.id, chart.settings.ags.toString(), settings));
                });
                $.when.apply($, requests).done(function () {
                    def.resolve(arguments);
                });
                return def.promise();
            }

            defCalls().done(function (arr) {
                chart.merge_data = [];
                let i = 0;

                $.each(array, function (key, val) {
                    let obj = {id: val.id, values: arr[i][0]};
                    if (array.length === 1) {
                        obj = {id: val.id, values: arr[0]};
                    }
                    chart.merge_data.push(obj);
                    i++;
                });
                if (chart.settings.ind_vergleich) {  // Recalculate the 'value' property of all elements, to display it correctly as percentiles
                    for (let item in chart.merge_data) {
                        let firstValue = chart.merge_data[item].values[0].real_value;

                        for (let val in chart.merge_data[item].values) {
                            chart.merge_data[item].values[val].value = calculatePercentiles(firstValue, chart.merge_data[item].values[val].real_value);
                        }
                    }

                }
                $('#diagramm_loading_info').hide();
                scaleChart();
                createPath();

            });

            function calculatePercentiles(firstValue, currentValue,) {
                //  Normalize the values taking minValue into acount! Maybe consider some different logic?
                let relativeChange= (currentValue-firstValue)/firstValue*100,
                    inPercent=relativeChange;
                return inPercent
            }

            function scaleChart() {
                let data = [];
                $.each(chart.merge_data, function (key, value) {
                    let firstValue = value.values[0]['real_value'];
                    $.each(value.values, function (x, y) {
                        data.push({"year": y.year, "value": y.value, "real_value": y.real_value})
                    })
                });
                let minYear = helper.getMinArray(data, "year"),
                    maxYear = helper.getMaxArray(data, "year"),
                    maxValue = helper.getMaxArray(data, "value"),
                    minValue = helper.getMinArray(data, "value"),
                    min_date = new Date(minYear - 1, 0, 1),
                    max_date = new Date(maxYear + 1, 0, 1),
                    current_year = helper.getCurrentYear();

                console.log("min date: "+ min_date+ "\n Max date: "+ max_date);
                console.log("min Year: "+ minYear+ "\n Max Year: "+ maxYear);

                // add to Min, Max values to allow for more axis ticks if the values do not vary a lot
                maxValue = maxValue + (maxValue-minValue) / 10;
                minValue = minValue - (maxValue-minValue) / 10;

                // Indicators from the "Nachhaltigkeit" category should all begin at Zero!
               //if (chart.merge_data.length==1 && indikatorauswahl.getIndikatorKategorie(chart.merge_data[0].id)=="N"){
               //    minValue=0;
               //}

                //reset max year if prognose is unset
                if (!chart.settings.state_prognose) {
                    max_date = new Date(current_year , 0, 1);
                }
                if (minYear === maxYear) {
                    x.domain(d3.extent([new Date(maxYear - 5, 0, 1), max_date]));
                } else {
                    x.domain(d3.extent([min_date, max_date]));
                }
                y.domain(d3.extent([minValue, maxValue]));

                //set x axis
                g.append("g")
                    .attr("class", "axis axis--x")
                    .style("font-size", "15px")
                    .attr("transform", "translate(0," + chart_height + ")")
                    .call(d3.axisBottom(x)
                        .tickSizeInner(-chart_height)
                        .scale(x)
                        .ticks(10)
                        .tickFormat(function (d) {
                        if (chart.settings.state_prognose) {
                            if (d.getFullYear() <= helper.getCurrentYear()) {
                                return d.getFullYear();
                            }
                        } else {
                            return d.getFullYear();
                        }
                    }));
                //set y axis
                g.append("g")
                    .attr("class", "axis axis--y")
                    .style("font-size", "15px")
                    .call(d3.axisLeft(y)
                        .ticks(8)
                        .tickSizeInner(- chart_width)
                        .tickFormat(function (d) {
                        if (d === 0 && dev_chart.chart.settings.ind_vergleich){
                            return dev_chart.text[language_manager.getLanguage()].startValue;
                        }
                        return helper.dotTocomma(d).toString() ;
                        })

                    );
                // text label for the y axis
                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 )
                    .attr("x",0 - (chart_height/2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "20px")
                    .text(function(){
                        return dev_chart.chart.settings.ind_vergleich ? "%": einheit
                    });

                // Resize ticks:
                d3.selectAll("g.axis.axis--y g.tick line")
                    .attr("x2", function(d,i){
                        //d for the tick line is the value
                        //of that tick
                        //(a number between 0 and 1, in this case)
                        if ( i%2 ) //if it's an even
                            return chart_width;
                        else
                            return 5;
                    });
            }

            //fill the path values
            function createPath() {
                $.each(chart.merge_data, function (key, value) {
                    let data = value.values;
                    console.info(data);
                    abstractData(data);
                    try {
                        setMigrationValue(data);
                    } catch (error) {
                        dev_chart.imigration = false;
                    }
                    setTimeout(function () {
                        appendData(data, data[0].color.toString());
                        createCircle(data, data[0].color.toString());
                        setLegende(data, data[0].color.toString());
                        createRegressionCurve(data);
                    }, 100);
                });
            }



            //add the data
            function appendData(data, color) {
                let values_line = [],
                    values_future = [],
                    set = function (array, _dash_array) {
                            g.append("path")
                                .data(array)
                                .attr("class", "regression_line")
                                .attr('stroke', color)
                                .attr("fill", "none")
                                .attr("d", curve(array));
                    };
                $.each(data, function (key, value) {
                    if (value.year < (new Date).getFullYear()) {
                        values_line.push(value);
                    } else {
                        values_future.push(value);
                    }
                });
                set(values_line, ("7,3"));
                if (values_future.length > 0) {
                    values_future.push(values_line[(values_line.length - 1)]);
                    values_future = values_future.sort(function (a, b) {
                        return a.year > b.year ? 1 : -1;
                    });
                    set(values_future, ("1,3"));
                }
            }

            //create the migration value
            function setMigrationValue(data) {
                if (!migration_set) {
                    dev_chart.imigration = true;
                    let ags_s = ags.toString().substr(0, 2),
                        id = null,
                        year = null,
                        class_band = "migration-band";

                    for (let x = 0; x <= data.length - 1; x++) {
                        id = data[x].id;
                        year = parseInt(data[x].year);
                    }

                    let min = parseTime(`01/${migrationValues[id][ags_s]["min"]}`),
                        max = parseTime(`01/${migrationValues[id][ags_s]["max"]}`);

                    //if min or max is null exit function
                    if (min == null || max == null) {
                        return;
                    }

                    let linearGradient = svg.append("defs")
                        .append("linearGradient")
                        .attr("id", "linear-gradient");

                    linearGradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", "#ffffff");

                    linearGradient.append("stop")
                        .attr("offset", "25%")
                        .attr("stop-color", "#E6E6E6");

                    linearGradient.append("stop")
                        .attr("offset", "50%")
                        .attr("stop-color", "#d3d3d3");

                    linearGradient.append("stop")
                        .attr("offset", "75%")
                        .attr("stop-color", "#E6E6E6");

                    linearGradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", "#ffffff");

                    g.append('rect')
                        .attr("x", x(min))
                        .attr("y", 0)
                        .attr("width", x(max) - x(min))
                        .attr("height", chart_height)
                        .attr("id", id)
                        .attr("class", class_band)
                        .attr("style", "background")
                        .attr("fill", "url(#linear-gradient)")
                        .attr("opacity",0.7);

                    //create the legende
                    let legend_migration = svg.append("g")
                        .attr("class", `${class_band} ${class_band}`);

                    legend_migration.append('g')
                        .append("rect")
                        .attr("x", margin.left)
                        .attr("y", chart_height + 60 + margin_top)
                        .attr("width", 30)
                        .attr("height", 10)
                        .style("fill", "url(#linear-gradient)");

                    legend_migration.append("text")
                        .attr("x", margin.left + 40)
                        .attr("y", chart_height + 70 + margin_top)
                        .attr("height", 20)
                        .attr("width", (chart_width * 0.7))
                        .style("fill", "grey")
                        .text(`ggf. beeinflusst durch Datenmodellmigration in ${MapHelper.getBldName(ags)}`);

                    legend_migration.append('g')
                        .append("rect")
                        .attr("x", margin.left)
                        .attr("y", chart_height + 80 + margin_top)
                        .attr("width", chart_width)
                        .attr("height", 1)
                        .style("fill", "grey");

                    migration_set = true;
                }
            }

            //function to set the legende, margin is a object like margin.left = 50px
            function setLegende(data, color) {
                let legend = svg.append("g")
                        .attr("class", "legend");
                    marginTop = margin_top + 40;

                legend.append('g')
                    .append("circle")
                    .attr("cx", margin.left)
                    .attr("cy", chart_height + 70 + marginTop)
                    .attr("r", 5.5)
                    .style("fill", color);

                legend.append("text")
                    .attr("x", margin.left + 30)
                    .attr("y", chart_height + 80 +margin_top )
                    .attr("height", 40)
                    .attr("width", (chart_width))
                    .style("font-size", "20px")
                    .style("fill", color)
                    .text(function () {
                        if (chart.settings.ind_vergleich) {
                            return data[0].name
                        } else {
                            return data[0].name + " "+ data[0].einheit;
                        }

                    })
                    .call(dev_chart.wrapText, chart_width);

                margin_top += 40;
            }

            function createCircle(data, color) {
                let color_set = color,
                    format_month = d3.timeFormat("%m"),
                    format_year = d3.timeFormat("%Y"),
                    tooltip = $('#tooltip');
                for (let i = 0; i < data.length; i++) {
                    let circle = g.append("g");
                    circle.append("circle")
                        .attr("class", data[0].id + "_circle circle")
                        .attr("r", 5.5)
                        .attr("data-value", data[i].value)
                        .attr('fill', function () {
                            if (data[i].year > (new Date).getFullYear()) {
                                return 'white';
                            } else {
                                return color_set;
                            }
                        })
                        .attr('stroke', color_set)
                        .attr("data-realvalue", data[i].real_value)
                        .attr("data-date", format_month(data[i].date) + "_" + format_year(data[i].date))
                        .attr("data-date_d3", data[i].date)
                        .attr("data-name", data[i].name)
                        .attr("data-ind", data[i].id)
                        .attr("data-year", data[i].year)
                        .attr("data-month", data[i].month)
                        .attr("data-einheit", function () {
                            if (chart.settings.ind_vergleich) {
                                return data[i].einheit
                            } else {
                                return data[i].einheit;
                            }
                        })
                        .attr("data-color", color_set)
                        .attr("transform", "translate(" + x(data[i].date) + "," + y(data[i].value) + ")")
                        .on("mouseenter", function () {
                            //handle what happens on moueover
                            const chart = dev_chart.chart,
                                elem = $(this);

                            let ind = elem.data('ind'),
                                year = elem.data('year'),
                                month = elem.data('month'),
                                value = elem.data('value'),
                                real_value = dev_chart.roundNumber(elem.data('realvalue'),3),
                                color = elem.data('color'),
                                einheit = elem.data('einheit'),
                                x = elem.position().left - document.getElementById('visualisation').getBoundingClientRect().x + 10,
                                y = elem.position().top - document.getElementById('visualisation').getBoundingClientRect().y + 80,
                                html = '',
                                text_value = dev_chart.text[language_manager.getLanguage()].value+ ": " + real_value + " " + einheit;

                            elem.attr("r", 7.5);
                            //the tooltip for ind vergleich
                            if (dev_chart.chart.settings.ind_vergleich) {
                                let data = [],
                                    ind_before = function (merge_data, ind, year) {
                                        let array = [],
                                            res = false;
                                        for (let i = 0; i < merge_data.length; i++) {
                                            if (merge_data[i].id === ind) {
                                                array.push(merge_data[i])
                                            }
                                        }
                                        for (let i = 0; i < array.length; i++) {
                                            if (array[i].id === ind) {
                                                if (array[i].year == year) {
                                                    res = i - 1;
                                                }
                                            }
                                        }
                                        return res;
                                    };
                                $.each(chart.merge_data, function (x, y) {
                                    if (y.id === ind) {
                                        data.push(y.values);
                                    }
                                });
                                //check if the oldest year is hover
                                let index = ind_before(data[0], ind, year);
                                if (index == -1) {
                                    html = text_value + "<br/>" + "Stand: " + month + "/" + year;
                                } else {
                                    //the text part
                                    let date_before = "von " + data[0][index].month + "/" + data[0][index].year + " bis " + month + "/" + year,
                                        text_value_dev = `Relative Entwicklung ${date_before}`,
                                        relative_value= (value - data[0][index].value).toFixed(2) + " %";
                                    html = text_value + `<br/>${text_value_dev}<br/>${relative_value}`;
                                }
                            } else {
                                html = text_value + `<br/> Stand: ${month} / ${year}`;
                            }

                            tooltip
                                .html(html)
                                .css({"left": x, "top": y, "color": color, "border": "1px solid" + color})
                                .show();
                        })
                        .on("mouseout", function () {
                            $(this).attr("r", 5.5);
                            tooltip.hide();
                        });
                }
            }

            function createRegressionCurve(data){
                let lineGenerator = d3.line()
                    .curve(d3.curveCardinal),
                    pathData = lineGenerator(data);

                g.append('path')
                    .attr('d', pathData);
            }

            function parseTime(_string) {
                let parseTime = d3.timeParse("%m/%Y");
                return parseTime(_string);
            }

            function abstractData(data) {
                data.forEach(function (d) {
                    d.date = parseTime(d.date);
                    d.value = +d.value;
                });
                return data;
            }
        },
        create: function () {
            const chart = dev_chart.chart;
            let selector = $(`#${dev_chart.endpoint_id}`),
                indikatorauswahl_chart = $('#indicator_ddm_diagramm');
            chart.controller.clearChartArray();
            $('#default_diagramm_choice').text(indikatorauswahl.getSelectedIndikatorText());
            if (chart.settings.ind_vergleich) {
                $('#indikator_choice_container_diagramm').show();
                if (chart.ind_array_chart.length == 0) {
                    let kat_auswahl_diagramm = $('#kat_auswahl_diagramm');
                    indikatorauswahl.cloneMenu('kat_auswahl_diagramm', 'link_kat_diagramm', 'right', 'X', false);
                    //remove items which have not the simular unit
                    indikatorauswahl_chart
                        .find('.submenu .item')
                        .each(function () {
                            if (indikatorauswahl.getIndikatorEinheit() !== $(this).data('einheit')) {
                                $(this).remove();
                            }
                        });
                    kat_auswahl_diagramm.find('.item').each(function () {
                        $(this).css("color", "rgba(0,0,0,.87)")
                    });
                    //remove selected Indicatopr from the list
                    helper.disableElement(`#kat_auswahl_diagramm #${indikatorauswahl.getSelectedIndikator()}_item`);
                    chart.ind_array_chart.push({"id": chart.settings.ind});
                }
            } else {
                selector.find('#indikator_choice_container_diagramm').remove();
                chart.ind_array_chart.push({"id": chart.settings.ind});
            }
            chart.init();
            chart.controller.set();
        },
        controller: {
            set: function () {
                const chart = dev_chart.chart;
                let ind_auswahl = $('#indicator_ddm_diagramm'),
                    download = $('#diagramm_download_format_choice');
                //set the info text
                $("#diagramm_gebietsname").text(chart.settings.name);
                $('#diagramm_ags').text(" (" + chart.settings.ags + ")");
                $('#diagrmm_gebiets_typ').text(function () {
                    if (chart.settings.ind_vergleich) {
                        return " %"
                    } else {
                        return (" " + indikatorauswahl.getIndikatorEinheit())
                    }
                });
                //set the selcted value
                ind_auswahl
                    .unbind()
                    .dropdown({
                        'maxSelections': 2,
                        onAdd: function (addedValue, addedText, $addedChoice) {
                            chart.ind_array_chart.push({"id": addedValue});
                            chart.init();
                            $(this).dropdown("hide");
                        },
                        onLabelRemove: function (value) {
                            chart.ind_array_chart = helper.removefromarray(chart.ind_array_chart, value);
                            chart.init();
                        }
                    });

                setTimeout(function () {
                    ind_auswahl.dropdown("hide");
                }, 500);

                //options-------------------------
                //1. alle Stützpkt
                $('#alle_stpkt')
                    .unbind()
                    .prop('checked', false)
                    .change(function () {
                        if (this.checked) {
                            chart.settings.state_stueztpnt = true;
                            chart.init();
                        } else {
                            chart.settings.state_stueztpnt = false;
                            chart.init();
                        }
                    });

                if ($.inArray(2025, indikatorauswahl.getAllPossibleYears()) !== -1) {
                    $('#prognose_container').show();
                } else {
                    $('#prognose_container').hide();
                }

                //2. Prognose
                $('#prognose')
                    .unbind()
                    .prop('checked', false)
                    .change(function () {
                        if (this.checked) {
                            chart.settings.state_prognose = true;
                            chart.init();
                        } else {
                            chart.settings.state_prognose = false;
                            chart.init();
                        }
                    });
                //export
                download
                    .dropdown({
                        onChange: function (value, text, $choice) {
                            let container = $('#visualisation'),
                                width = container.width(),
                                height = container.height(),
                                migrationClass = $(".migration-band"),
                                _export = function () {
                                    if (value === 'png') {
                                        Export_Helper.svgString2Image(width, height, '.container_diagramm #diagramm svg', Export_Helper.saveIMAGE);
                                    } else if (value === 'pdf') {
                                        Export_Helper.svgString2DataURL(width, height, '.container_diagramm #diagramm svg', {
                                            header: dev_chart.text[language_manager.getLanguage()].indicatorFor + chart.settings.name,
                                            sub_header: ""
                                        }, Export_Helper.savePDF);
                                    }
                                };
                            //workaround for firefox Bug
                            container.attr("height", height).attr("width", width);
                            $(this).dropdown("hide");
                            //ask user if he wants to export the migration band if avaliable
                            if (dev_chart.imigration) {
                                swal({
                                        title: "Möchten Sie auch das Unsicherheitsband exportieren ?",
                                        type: "info",
                                        showCloseButton: true,
                                        showCancelButton: true,
                                        confirmButtonText: "Ja",
                                        cancelButtonText: "Nein",
                                        customClass: "lightGrey-gradient"
                                    },
                                    function (isConfirm) {
                                        if (isConfirm) {
                                            _export();
                                        } else {
                                            migrationClass.hide();
                                            _export();
                                            migrationClass.show();

                                        }
                                    });
                            } else {
                                _export();
                            }
                        }
                    });
                setTimeout(function () {
                    download.dropdown("hide");
                }, 500);

                ///////////// Workaround: remove empty labels from dropdown menu. Needed to fix the bug where one extra empty label was shown in english version of Site
                // todo: find a better solution! (Reinis) the extra element is being set somewhere in chart.control
                ind_auswahl.children('a').each(function (index, object) {
                    if ($(this).text() == "") {
                        $(this).remove();
                    }
                });
            },
            clear: function () {
                $('#visualisation').empty();
                $("#diagramm_gebietsname").empty();
                $('#diagramm_ags').empty();
                $('#diagrmm_gebiets_typ').empty();
            },
            clearChartArray: function () {
                dev_chart.chart.ind_array_chart = [];
                dev_chart.chart.merge_data = [];
            }
        }
    },
    controller: {
        set: function () {
            //DOM events for the chart
            $(document).on("click", dev_chart.chart_selector_toolbar, function () {
                let callback = function () {
                    if (Dialoghelper.getAGS_Input()) {
                        dev_chart.chart.settings.ags = Dialoghelper.getAGS_Input();
                        dev_chart.chart.settings.name = Dialoghelper.getAGS_InputName();
                        dev_chart.chart.settings.ind = indikatorauswahl.getSelectedIndikator();
                        dev_chart.chart.settings.ind_vergleich = false;
                        dev_chart.open();
                    }
                };
                try {
                    Dialoghelper.setSwal(callback);
                } catch (err) {
                    alert_manager.alertError();
                }
            });

            $(document).on("click", dev_chart.chart_compare_selector_toolbar, function () {
                let callback = function () {
                    if (Dialoghelper.getAGS_Input()) {
                        dev_chart.chart.settings.ags = Dialoghelper.getAGS_Input();
                        dev_chart.chart.settings.name = Dialoghelper.getAGS_InputName();
                        dev_chart.chart.settings.ind = indikatorauswahl.getSelectedIndikator();
                        dev_chart.chart.settings.ind_vergleich = true;
                        dev_chart.open();
                    }
                };
                try {
                    Dialoghelper.setSwal(callback);
                } catch (err) {
                    alert_manager.alertError();
                }
            });
        }
    },
    getDecimalSpaces:function(){
        return parseInt(indikatorauswahl.getIndikatorInfo(false,"rundung"));
    },
    roundNumber: function (number, decimalSpaces) {
        console.log("This is value: "+ number);
        return Math.round(parseFloat(number) * Math.pow(10, decimalSpaces)) / Math.pow(10, decimalSpaces)
    },
    wrapText: function (text, width) {
    text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 2,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}
};

