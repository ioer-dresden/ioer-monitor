
const area_info={
    parameters:{ // all the necessary Values, assigned in getAllParameters function
        endpoint_id: "",
        ags:"",
        name:"",
        spatialUnit:"",
        parentSpatialUnits:[],
        data:[],
        lan:"",
        time:0,
        relevance:"",
        columnList:[]
    },
    text:{ // Translation         ACHTUNG! The translation entry keys have to have the same name as the corresponding table column names ( see function area.info.extractRelevantDataFromJSON() )
        de:{
            title:"Gebietsprofil",
            time: "Zeitschnitt",
            indicatorValues:"Alle Indikatorwerte für: ",
            download:"Herunterladen als .csv",
            category:"Kategorie",
            indicator:"Indikator",
            value:"Wert",
            relevanceYear:"Aktualität",
            comparison:"Vergleich mit ",
            germany:"Deutschland",
            state:"Bundesland",
            district:"Kreis",
            difference:"Differenz zu",
            for:"für"
        },
        en:{
            title:"Area information",
            time: "Time",
            indicatorValues:"All indicator values for: ",
            download:"Download as .csv",
            category:"Category",
            indicator:"Indicator",
            value:"Value",
            relevanceYear:"Topicality",
            comparison:"Comparison to ",
            germany: "Germany",
            state:"State",
            district: "District",
            difference:"Difference to",
            for:"for"
        }
    },

    open:function(ags,gen){
        console.log("Starting");
        this.parameters=this.getAllParameters(ags, gen); // getting the regular Parameters
        console.log("Getting parameter");
        $.when(RequestManager.getSpatialOverview(indikatorauswahl.getSelectedIndikator(),ags).done(function(data){    // Fetching the data. Async function, waiting for results before continuing
            //console.log(data);
            //console.log("Parent ebene: "+ Object.keys(data["spatial_info"]));
                area_info.parameters.parentSpatialUnits= data["spatial_info"];
                data= area_info.extractRelevantDataFromJSON(data,area_info.parameters.lan);
                area_info.parameters.data=data;
                area_info.parameters.relevance=data[1].relevanceMonth  + " / " + data[1].relevanceYear; // getting the relevance/topicality (Aktualität) from Data. All the Years are the same. Taking out from random data row
                let html= area_info.writeHTML(area_info.parameters,area_info.text);
                area_info.createDialogWindow(area_info.parameters,html,area_info.text);
                area_info.init(area_info.parameters, area_info.text);
                area_info.drawTable(area_info.parameters);
                console.info( area_info.parameters.parentSpatialUnits)
            })
        );
    },
    init:function(){  // set the .csv export
        //init csv download
        $("#area_info_csv_export")
            .unbind()
            .click(function(){
                Export_Helper.exportTable("dataTable");
            });
    },

    getAllParameters:function(ags,gen){ // fills the Parameter Object with variables
        let parameters={
            endpoint_id:"area_info_content",
            ags:"",
            spatialUnit:"",
            parentSpatialUnits:"",
            name:"",
            data:[],
            lan:"",
            time:0,
            relevance:"",
            columnList:[]
        };
        parameters.ags=ags;
        parameters.name=gen;
        parameters.spatialUnit=raeumliche_analyseebene.getSelectionId();
        parameters.lan=language_manager.getLanguage();
        parameters.time=zeit_slider.getTimeSet();
        parameters.columnList=this.getColumnList(parameters.spatialUnit);
        return parameters;
    },

    getColumnList:function(spatialUnit){  // Determining columns that will get displayed
        let columnList=["category","indicator", "value","unit"];
        if (spatialUnit=="ror" || spatialUnit=="krs" || spatialUnit=="lks" || spatialUnit=="kfs" || spatialUnit=="g50" ){
            columnList.push("valueBundesland","unit");
        }
        else if (spatialUnit=="vwg" || spatialUnit== "gem"){
            columnList.push("valueKreis","unit","valueBundesland","unit")
        }
        columnList.push("valueBRD","unit");
        console.log("ColumnList: "+columnList);
        return columnList;
    },

    extractRelevantDataFromJSON:function(data, lan){ // prepares the raw data for visualisation in a Table- creates single rows (objects) for each Indicator
        let tableData=[];
        data=data["values"];
        for (let index in data){
            for (let category in data[index]) {
                let categoryName = " ";

                if (lan == "de") { // check for Language!!!
                    categoryName = data[index][category]["cat_name"];
                } else {
                    categoryName = data[index][category]["car_name_en"];
                }
                if (data[index][category]["values"] != "") {
                    let firstRowOfNewCategory = {  // Should only display the Category Name, all other entries should be empty in the table
                        category: categoryName,
                        id: "",
                        indicator: "",
                        indicatorText: "",
                        value: "", // Value gets rounded based on the Indicator decimal spaces
                        unit: "",
                        relevanceYear: "",
                        relevanceMonth: "",
                        relevanceYearBRD: "",
                        relevanceMonthBRD: "",
                        valueBRD: "",  // Value gets rounded based on the Indicator decimal spaces
                        differenceToBRD: "",  // Value gets rounded based on the Indicator decimal spaces
                        relevanceYearBundesland: "",
                        relevanceMonthBundesland: "",
                        valueBundesland: "",
                        relevanceYearKreis: "",
                        relevanceMonthKreis: "",
                        valueKreis: "",
                        differenceToKreis: "",
                    };
                    tableData.push(firstRowOfNewCategory);
                }



                for (let indicator in data[index][category]["values"]){
                    indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"name");
                    let indicatorId=data[index][category]["values"][indicator]["id"],
                        indicatorName="",
                        indicatorText="";
                    if (lan=="de"){
                        indicatorName=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"ind_name");
                        indicatorText=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"info");
                    }
                    else if (lan=="en"){
                        indicatorName=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"ind_name_en");
                        indicatorText=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"info_en");
                    }
                    else{
                        console.log("Language not recognised! Area_info.js")
                    }

                    //console.log("keys in JSON: "+ Object.keys(data[index][category]["values"][indicator]));
                    let tableRow={
                        category:" ",
                        id:indicatorId,
                        indicator:indicatorName,
                        indicatorText:indicatorText,
                        value:this.roundNumber(indicatorId,data[index][category]["values"][indicator]["value"]), // Value gets rounded based on the Indicator decimal spaces
                        unit:data[index][category]["values"][indicator]["einheit"],
                        relevanceYear:data[index][category]["values"][indicator]["grundakt_year"],
                        relevanceMonth:data[index][category]["values"][indicator]["grundakt_month"],
                        relevanceYearBRD:data[index][category]["values"][indicator]["grundakt_year_brd"],
                        relevanceMonthBRD:data[index][category]["values"][indicator]["grundakt_month_brd"],
                        valueBRD:this.roundNumber(indicatorId,data[index][category]["values"][indicator]["value_brd"]),  // Value gets rounded based on the Indicator decimal spaces
                        differenceToBRD:this.roundNumber(indicatorId,data[index][category]["values"][indicator]["diff_brd"]),  // Value gets rounded based on the Indicator decimal spaces
                    };
                    // adding the Values that only appear on the smaller regions
                    if (data[index][category]["values"][indicator].hasOwnProperty("value_bld")){
                            console.log("Has Bundesland");
                        tableRow.valueBundesland=this.roundNumber(indicatorId, data[index][category]["values"][indicator]["value_bld"]);
                        tableRow.relevanceYearBundesland=data[index][category]["values"][indicator]["grundakt_year_bld"];
                        tableRow.relevanceMonthBundesland=data[index][category]["values"][indicator]["grundakt_month_bld"];
                        tableRow.differenceBundesland= this.roundNumber(indicatorId, data[index][category]["values"][indicator]["diff_bld"])
                    };
                    if (data[index][category]["values"][indicator].hasOwnProperty("value_krs")){
                        console.log("Has Kreis");
                        tableRow.valueKreis=this.roundNumber(indicatorId, data[index][category]["values"][indicator]["value_krs"]);
                        tableRow.relevanceYearKreis=data[index][category]["values"][indicator]["grundakt_year_krs"];
                        tableRow.relevanceMonthKreis=data[index][category]["values"][indicator]["grundakt_month_krs"];
                        tableRow.differenceKreis= this.roundNumber(indicatorId, data[index][category]["values"][indicator]["diff_krs"])
                    }



                    tableData.push(tableRow);
                }
            }


        }
        return tableData;

    },

    selectColumnsForTable:function(data, columnList){
        let newTableColumns=[];
        for (let ind=0;ind<data.length;ind++){
            let tableRow=[];
            for (let columnName in columnList){
                let column=data[ind][columnList[columnName]];
                tableRow.push(column)
            }
            newTableColumns.push(tableRow)

        }
        return newTableColumns;
    },

    getColumnDefsForDataTables:function(columnList){ // Format the columns for Data Tables here! (For options: https://datatables.net/reference/option/columnDefs)
        let columnDefs=[];
            for (let i =0;i<columnList.length;i++){
                let alignment="";
                console.log("writing column defs: column"+ columnList[i]);
                if (columnList[i]=="unit" || columnList[i]=="indicator" || columnList[i]== "category"){
                    alignment="dt-body-left dt-head-left"
                }
                else {
                    console.log("Right Align!"+ columnList[i])
                    alignment= "dt-body-right dt-head-left"
                }
                let def={
                    targets:i,
                    className: alignment
            }
                columnDefs.push(def);
        }
            return columnDefs;
    },

    writeHTML:function(parameters, text){ // writes the HTML for the Dialog Window
         // Decide if dropdown menu should be shown and format the corresponding Table Header Elements
        let headerHTML=area_info.getTableHeaderHTML(parameters,text);

        // Encoding the HTLM
        return he.encode(`
        <div class="jq_dialog" id="${parameters.endpoint_id}">
            <div class="flex" id="area_info_container">
                    <div > 
                        <div class="flex" >             
                        <h2 class="flexElement">${text[parameters.lan].indicatorValues}</h2>
                        <h2 class="flexElement"> ${parameters.name}</h2>
                        <h2 class="flexElement" > (AGS: ${parameters.ags})</h2>
                        </div> 
                    
                    <h3 class="flexElement">${text[parameters.lan].time}: ${parameters.time}</h3>
                    <h3 class="flexElement">${text[parameters.lan].relevanceYear}: ${parameters.relevance}</h3>
                    </div>
                    <div title="Tabelle als CSV exportieren" id="area_info_csv_export" data-id="csv_export" data-title="Tabelle als CSV exportieren">
                    </div>                              
            </div>
            <br/>
            <hr />
            <table id="dataTable" class="display" width="90%">
                    <thead>
                    ${headerHTML}
                    </thead>
            </table>
        </div>
        `);
    },

    getTableHeaderHTML:function(parameters, text){
        let headerFirstRow=`<tr id="firstHeaderRow">`,
            headerSecondRow=`<tr>`;  // We want to have some Headers span 2 columns (colspan="2"). Because DataTables needs a separate column header for every column,
                                    // we are adding empty "dummy columns". Result: first header Row w/ headers, second header row w empty placeholders
        for (let columnHeader in parameters.columnList){
            headerSecondRow+=`<th class="noPaddingsForTableHeader"> </th>`;
            switch (parameters.columnList[columnHeader]){
                case "category":
                    headerFirstRow+=`<th class="noPaddingsForTableHeader">${text[parameters.lan].category}</th> `;
                    break;
                case "indicator":
                    headerFirstRow+=`<th class="noPaddingsForTableHeader">${text[parameters.lan].indicator}</th> `;
                    break;
                case "value":
                    headerFirstRow+=`<th colspan="2" class="noPaddingsForTableHeader">${text[parameters.lan].value} ${text[parameters.lan].for} ${parameters.name}</th> `;
                    break;
                case "unit":
                    console.log("indUnit!");
                    break;
                case "valueBRD":
                    headerFirstRow+= `<th colspan="2" class="noPaddingsForTableHeader">${text[parameters.lan].value} ${text[parameters.lan].for}  ${text[parameters.lan].germany} (${parameters.data[1].relevanceYearBRD}) </th> `;   //All the Years are the same. Taking out from random data row
                    break;
                case "valueBundesland":
                    headerFirstRow+=`<th colspan="2" class="noPaddingsForTableHeader">${text[parameters.lan].value} ${text[parameters.lan].for} ${text[parameters.lan].state} ${parameters.parentSpatialUnits[0]["bld"]} (${parameters.data[1].relevanceYearBundesland})</th> `;  //All the Years are the same. Taking out from random data row
                    break;
                case "valueKreis":
                    headerFirstRow+=`<th colspan="2" class="noPaddingsForTableHeader">${text[parameters.lan].value} ${text[parameters.lan].for} ${text[parameters.lan].district} ${parameters.parentSpatialUnits[1]["krs"]} (${parameters.data[1].relevanceYearKreis})</th> `;  //All the Years are the same. Taking out from random data row
                    break;
                default:
                    headerFirstRow+="";
            }
        }
        headerFirstRow+=`</tr>`;
        headerSecondRow+=`</tr>`;
        return headerFirstRow+headerSecondRow;
    },

    createDialogWindow:function(parameters, html, text){
        //setting up the dialog Window
        dialog_manager.instructions.endpoint = `${parameters.endpoint_id}`;
        dialog_manager.instructions.html = html;
        dialog_manager.instructions.title = text[parameters.lan].title;
        dialog_manager.create();
    },

    drawTable:function(parameters){
        let columnList=parameters.columnList,
            tableData=area_info.selectColumnsForTable(parameters.data,columnList),  // getting only the data required for the Table
            language=area_info.getDataTablesLanguage(parameters.lan),
            columnDefs= area_info.getColumnDefsForDataTables(columnList);

        $("#dataTable").DataTable(
            {
                destroy:true,   // destroys the old table before redrawing. Not the most efficient way, though. Consider using dataTables.api
                responsive: true,
                data:tableData,
                "ordering": false,  // disable the ordering of rows
                "language":language,
                paging: false, //kerngruppe wants no paging
                "createdRow": function( row, data, dataIndex){
                    if( data[0] != " "){
                        $(row).css( "background-color", "darkgrey" );  // Changing the background color of first Cells of each Category. (nicer would ne $(row).addClass("grayBackground") - but this did not work for some reason....conflict w/ Bootstrap??)
                        }
                    },
                "columnDefs":columnDefs
            }
        );
    },
    getDataTablesLanguage:function(lan){   // returns the DataTables interface translations
        let language={};  // get the language translations @: http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/
        switch (lan) {
            case "de":

                language={
                    search: "Suchen",
                    lengthMenu:    "_MENU_ Einträge anzeigen",
                    info:           "_START_ bis _END_ von _TOTAL_ Einträgen",
                    infoEmpty:      "Keine Daten vorhanden",
                    infoFiltered:   "(gefiltert von _MAX_ Einträgen)",
                    infoPostFix:    "",
                    loadingRecords: "Wird geladen ..",
                    zeroRecords:    "Keine Einträge vorhanden",
                    paginate: {
                        first:      "Erste",
                        previous:   "Zurück",
                        next:       "Nächste",
                        last:       "Letzte",

                    },
                };
                break;
            default:
                console.log("Untermenschlich!!");
                break;
        }
        return language;
    },
    roundNumber:function(indicatorId,number){
        let decimalSpaces=indikatorauswahl.getIndikatorInfo(indicatorId,"rundung");
        return Math.round(parseFloat(number) * Math.pow(10, decimalSpaces)) / Math.pow(10, decimalSpaces)
    }
};

