
const area_info={
    parameters:{ // all the necessary Values, assigned in getAllParameters function
        endpoint_id: "",
        ags:"",
        name:"",
        data:[],
        lan:"",
        time:0
    },

    text:{ // Translation
        de:{
            title:"Gebietsprofil",
            time: "Zeitpunkt",
            indicatorValues:"Alle Indikatorwerte für: ",
            download:"Herunterladen als .csv",
            category:"Kategorie",
            indicator:"Indicator",
            value:"Wert",
            relevance:"Aktualität",
            comparison:"Wergleich mit: ",
        },
        en:{
            title:"Area information",
            time: "Time",
            indicatorValues:"All indicator values for: ",
            download:"Download as .csv",
            category:"Category",
            indicator:"Indicator",
            value:"Value",
            relevance:"Topicality",
            comparison:"Comparison with: "
        }
    },

    open:function(ags,gen){
        this.parameters=this.getAllParameters(ags, gen); // getting the regular Parameters

        $.when(RequestManager.getSpatialOverview(indikatorauswahl.getSelectedIndikator(),ags).done(function(data){    // Fetching the data. Async function, waiting for results before continuing
                data= area_info.prepareDataForTable(data,area_info.parameters.lan);
                area_info.parameters.data=data;
                let html= area_info.writeHTML(area_info.parameters,area_info.text);
                area_info.createDialogWindow(area_info.parameters,html,area_info.text);
                area_info.drawTable(data,area_info.parameters.lan,area_info.text);
            })
        );



    },

    getAllParameters:function(ags,gen){ // fills the Parameter Object with variables
        let parameters={
            endpoint_id:"area_info_content",
            ags:"",
            name:"",
            data:[],
            lan:"",
            time:0};


        parameters.ags=ags;
        parameters.name=gen;
        parameters.lan=language_manager.getLanguage();
        parameters.time=zeit_slider.getTimeSet();
        return parameters;
    },


    prepareDataForTable:function(data,lan){ // prepares the raw data for visualisation in a Table- creates single rows (objects) for each Indicator
        let tableData=[];
        for (let index in data){
            let catalogIndex = toString(Object.keys(data[index]));
            for (let category in data[index]) {
                let categoryName=" ";

                if (lan=="de" ){ // check for Language!!!
                    categoryName=data[index][category]["cat_name"];
                }
                else{
                    categoryName=data[index][category]["car_name_en"];
                }
                for (let indicator in data[index][category]["values"]){
                    indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"name");
                    indicatorId=data[index][category]["values"][indicator]["id"];
                    indicatorName="";
                    indicatorText="";
                    if (lan=="de"){
                        indicatorName=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"ind_name");
                        indicatorText=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"info");
                    }
                    else{
                        indicatorName=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"ind_name_en");
                        indicatorText=indikatorauswahl.getIndikatorInfo(data[index][category]["values"][indicator]["id"],"info_en");
                    }
                    let tableRow={
                        categoryName:categoryName,
                        id:indicatorId,
                        indicatorName:indicatorName,
                        indicatorText:indicatorText,
                        value:this.roundNumber(indicatorId,data[index][category]["values"][indicator]["value"]), // Value gets rounded based on the Indicator decimal spaces
                        unit:data[index][category]["values"][indicator]["einheit"],
                        relevanceYear:data[index][category]["values"][indicator]["grundakt_year"],
                        relevanceMonth:data[index][category]["values"][indicator]["grundakt_month"],
                        relevanceYearBRD:data[index][category]["values"][indicator]["grundakt_year_brd"],
                        relevanceMonthBRD:data[index][category]["values"][indicator]["grundakt_month_brd"],
                        valueBRD:data[index][category]["values"][indicator]["value_brd"],
                        differenceToBRD:data[index][category]["values"][indicator]["diff_brd"],
                        relevanceYearKreis:data[index][category]["values"][indicator]["grundakt_year_krs"],
                        relevanceMonthKreis:data[index][category]["values"][indicator]["grundakt_month_krs"],
                        valueKreis:data[index][category]["values"][indicator]["value_krs"],
                        differenceToKreis:data[index][category]["values"][indicator]["diff_krs"]};
                    this.roundNumber(tableRow.id);
                    categoryName=" ";
                    tableData.push(tableRow);
                }
            }


        }
        return tableData;

    },

    // TODO REINI CONTINUE WRITING SELECTING FUNCTION FOR THE  DATA TABLE COLUMNS

    selectColumnsForTable:function(data, columnList){
        newTableColumns=[];
        for (let elem in data){
            rowColumns=[];
            for (let columnName in columnList){}
            column=data[elem].columnList[columnName]
        }
    },

    writeHTML:function(parameters, text){
        return he.encode(`
        <div class="jq_dialog" id="${parameters.endpoint_id}">
            <div class="flex" id="area_info_container">
                    <div > 
                        <div class="flex" >             
                        <h2 class="flexElement">${text[parameters.lan].indicatorValues}</h2>
                        <h2 class="flexElement"> ${parameters.name}</h2>
                        <h3 class="flexElement" style="color: slategray"> (AGS: ${parameters.ags})</h3>
                        </div> 
                    
                    <h3 class="flexElement"> ${text[parameters.lan].time}: ${parameters.time}</h3>
                    </div>
                    <button class="downloadButton">
                        ${text[parameters.lan].download}
                    </button>                                    
            </div>
            <br/>
            <hr />
            <table id="dataTable" class="display" width="90%"></table>
        </div>
        `);
    },

    createDialogWindow:function(parameters, html, text){
        //setting up the dialog Window
        dialog_manager.instructions.endpoint = `${parameters.endpoint_id}`;
        dialog_manager.instructions.html = html;
        dialog_manager.instructions.title = text[parameters.lan].title;
        dialog_manager.create();
    },

    drawTable:function(data, lan, text){
        console.log("This is our DATA:  "+data);
        $("#dataTable").DataTable(
            {
                data:data,
                columns:[
                    { title: text[lan].category },
                    { title: text[lan].indicator},
                    { title: text[lan].value},
                    { title: text[lan].relevance},
                    { title: text[lan].comparison}
                ]
            }
        )
    },

    roundNumber:function(indicatorId,number){
        let decimalSpaces=indikatorauswahl.getIndikatorInfo(indicatorId,"rundung");
        return Math.round(parseFloat(number) * Math.pow(10, decimalSpaces)) / Math.pow(10, decimalSpaces)
    },

};

