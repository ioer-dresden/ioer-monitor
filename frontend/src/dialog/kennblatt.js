const kennblatt={
    endpoint_id:"kennblatt_text",
    open:function(){
        let lang_tag = function(){
                let tag = '';
                if(language_manager.getLanguage()==="en"){tag="_en"}
                return tag;
            },
            ind_name = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("ind_name"+lang_tag())],
            category = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()][('cat_name'+lang_tag())],
            unit = indikatorauswahl.getIndikatorEinheit(),
            info = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("info"+lang_tag())],
            methodik = function(){
                let text= indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("methodik"+lang_tag())],
                textLinesSeparated= text.replace(/°{2,}/g, "</br></br>"),
                textSpacesAdded= textLinesSeparated.replace(/°/g, " ");
                return textSpacesAdded;
            },
            verweise = function(){
                try {
                    let cont = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("verweise" + lang_tag())],
                        encode = he.decode(cont),
                        split = encode.split("</a>"),
                        html = function () {
                            let ul = "<ul>",
                                i = 0;
                            $.each(split, function (x, y) {
                                i += 1;
                                let res = y
                                        .replace("target", " target")
                                        .replace("href", " href")
                                        .replace(">- ", ">")
                                        .replace("http://www.ioer -monitor.de/methodik/glossar/b/", "https://www.ioer-monitor.de/methodik/glossar/b/")
                                    + "</a>";
                                if (i < split.length) {
                                    ul += `<li>${res}</li>`;
                                }
                            });
                            return `${ul}</ul>`;
                        };
                    return html();
                }catch(err){
                    console.log(err);
                    return "";
                }
            },
            interpretation = function(){
               let interpretation= indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("interpretation"+lang_tag())],
                   interpretationLinesSeparated= interpretation.replace(/°{2,}/g, "</br></br>"),
                   interpretationSpacesAdded= interpretationLinesSeparated.replace(/°/g, " ");
               return interpretationSpacesAdded;
            },

            bemerkungen = function(){
                let bemerkungen= indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("bemerkungen"+lang_tag())],
                bemerkungenLinesSeparated= bemerkungen.replace(/°{2,}/g, "</br></br>"),
                bemerkungenSpacesAdded= bemerkungenLinesSeparated.replace(/°/, " ");
                return bemerkungenSpacesAdded;
            },

            ogc = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()]["ogc"],
            spatial_extends = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()]["spatial_extends"],
            language = language_manager.getLanguage(),
            datengrundlage=legende.getDatengrundlageObject().text(),
            bezugsebenen=function(){
                try {
                    let availableSpatialResolutions = '';
                    $.each(spatial_extends, function (key, value) {

                                let spatialUnit="";
                                if (parseInt(value) == 1) {
                                     spatialUnit= `<div> ${raeumliche_analyseebene.getSpatialExtentNameById(key)}</div>`;
                                     availableSpatialResolutions +=spatialUnit;
                                }
                            });
                         return `${availableSpatialResolutions}`;


                            /*
                            checkbox = `<div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" ${state()} disabled>
                                <label class="form-check-label">${raeumliche_analyseebene.getSpatialExtentNameById(key)}</label>
                             </div>`;
                        form += checkbox;
                    });
                    */

                }
                catch(err){
                    console.log(err);
                    return "";
                }
            },
            ogc_links=function(){
                try {
                    let services = '';
                    $.each(ogc, function (key, value) {
                        let service="";
                                if (parseInt(value) == 1) {
                                    let link = function () {
                                        let ind_id = indikatorauswahl.getSelectedIndikator();
                                        return  `https://monitor.ioer.de/cgi-bin/${key}?MAP=${ind_id}_${key}`;
                                    };
                                    service= `<div class="text" >${key.toUpperCase()} : ${link()}</label>`
                                }

                            /*
                            checkbox = `<div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" ${state()} disabled>
                                <label class="form-check-label">${key.toUpperCase()}: ${link()}</label>
                             </div>`;
                             */

                        services += service;
                    });
                    return `${services}`;
                }catch(err){
                    console.log(err);
                    return "";
                }
            },
            literatur=function(){
                try {
                    let literatur = indikatorauswahl.getPossebilities()[indikatorauswahl.getSelectedIndikatorKategorie()]['indicators'][indikatorauswahl.getSelectedIndikator()][("literatur" + lang_tag())],
                        literaturLinesSeparated= literatur.replace(/°{2,}/g, "</br></br>"),
                        literaturSpacesAdded= literaturLinesSeparated.replace(/°/g, " ");
                    return he.decode(literaturSpacesAdded);
                }catch(err){
                    console.log(err);
                    return "";
                }
            },
            header_text={"de":{
                    "header":"Indikatorkennblatt",
                    "export":"Exportieren",
                    "cat":"Kategorie",
                    "einheit":"Maßeinheit",
                    "beschreibung":"Kurzbeschreibung",
                    "bedeutung":"Bedeutung und Interpretation",
                    "daten":"Datengrundlagen",
                    "methodik":"Methodik",
                    "verweise":"Verweise",
                    "bemerkung":"Bemerkungen",
                    "bezugsebenen":"Bezugsebenen",
                    "literatur":"Quellen/Literatur",
                    "erstellePDF":"Erstelle PDF"
                },
                "en":{
                    "header":"Indicator data sheet",
                    "export":"Export",
                    "cat":"Category:",
                    "einheit":"Unit",
                    "beschreibung":"Short description",
                    "bedeutung":"Importance and interpretation",
                    "daten":"Data basis",
                    "methodik":"Methodology",
                    "verweise":"Eprimands",
                    "bemerkung":"Remarks",
                    "bezugsebenen":"Available levels",
                    "ogc":"Links to available geoservices",
                    "literatur":"Sources/References",
                    "erstellePDF":"Creating PDF"
                }
            };
        //create the html
        let html = he.encode(`
            <h4 id="${this.endpoint_id}" class="dialog jq_dialog">
                <div class="export mobile_hidden">
                    <button class="btn btn-primary float-right" id="print_btn_kennblatt">
                        <i class="glyphicon glyphicon-print"></i>
                        <span>${header_text[language]["export"]}</span>
                    </button>            
                </div>
                <div id="kennblatt_form" class="w-100 inline-block">
                    <h3>${ind_name}</h3>
                    <hr/>
                    <h4>${header_text[language]["cat"]}</h4>
                    <div class="text">${category}</div>
                    <h4>${header_text[language]["einheit"]}</h4>
                    <div class="text">${unit}</div>
                    <h4>${header_text[language]["beschreibung"]}</h4>
                    <div class="text">${info}</div>
                    <h4>${header_text[language]["bedeutung"]}</h4>
                    <div class="text">${interpretation()}</div>
                    <h4>${header_text[language]["daten"]}</h4>
                    <div class="text">${datengrundlage}</div>
                    <h4>${header_text[language]["methodik"]}</h4>
                    <div class="text">${methodik()}</div>
                    <h4>${header_text[language]["verweise"]}</h4>
                    <div class="text">${verweise()}</div>
                    <h4>${header_text[language]["bemerkung"]}</h4>
                    <div class="text">${bemerkungen()}</div>
                    <h4>${header_text[language]["bezugsebenen"]}</h4>
                    <div class="text">${bezugsebenen()}</div>
                    <div class="html2pdf__page-break"></div>
                    <!--<h4>${header_text[language]["ogc"]}</h4>
                    <div class="text">${ogc_links()}</div>-->
                     <h4>${header_text[language]["literatur"]}</h4>
                    <div class="text">${literatur()}</div>
                </div>
            </div>`);
        //settings for the manager
        let instructions = {
            endpoint:`${this.endpoint_id}`,
            html:html,
            title:header_text[language]["header"]
        };
        dialog_manager.setInstruction(instructions);
        dialog_manager.create();
        this.controller.set(header_text[language]["erstellePDF"]);
    },
    controller:{
        set:function(headerText){
            let print_button = $('#print_btn_kennblatt');
            print_button
                .unbind()
                .click(function(){
                    print_button.hide();
                    let element = document.getElementById('kennblatt_form'),
                        opt = {
                            margin: 5,
                            quality: 0.98,
                            enableLinks: true,
                            filename: indikatorauswahl.getSelectedIndikator() + "_" + raeumliche_analyseebene.getSelectionId() + "_" + zeit_slider.getTimeSet() + '.' + ".pdf",
                            image: {type: 'pdf', quality: 1},
                            html2canvas:  { scale: 2,letterRendering: true},
                            jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
                        };
                    progressbar.init();
                    progressbar.setHeaderText(headerText);
                    let worker = html2pdf()
                        .from(element)
                        .set(opt)
                        .save()
                        .then(function(){
                            progressbar.remove();
                            print_button.show();
                            dialog_manager.restoreDimension();
                        });
                });
        }
    }
};
