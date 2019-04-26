
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
            comparison:"Wergleich mit: "
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

        this.parameters=this.getAllParameters(ags,gen); // getting all parameters

        let timeStamp = this.parameters.time, // convenience shortening of parameter calls
            lan=this.parameters.lan;



        //Write the HTML code for Statistics Dialog View
        const html = he.encode(`
        <div class="jq_dialog" id="${this.endpoint_id}">
            <div class="flex" id="area_info_container">
                    <div > 
                        <div class="flex" >             
                        <h2 class="flexElement">${this.text[lan].indicatorValues}</h2>
                        <h2 class="flexElement"> ${this.parameters.name}</h2>
                        <h3 class="flexElement" style="color: slategray"> (AGS: ${this.parameters.ags})</h3>
                        </div> 
                    
                    <h3 class="flexElement"> ${this.text[lan].time}: ${timeStamp}</h3>
                    </div>
                    <button class="downloadButton">
                        ${this.text[lan].download}
                    </button>                                    
            </div>
            <br/>
            <hr />
            <table id="dataTable" class="display" width="90%"></table>
        </div>
        `);

        //setting up the dialog Window
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html = html;
        dialog_manager.instructions.title = this.text[lan].title;
        dialog_manager.create();

    },

    getAllParameters:function(ags,gen){
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
        parameters.data=this.getData(ags,parameters.lan);
        console.log("Data: "+parameters.data);
        return parameters;
    },

    getData:function(ags,lan){ // fetches the JSON raw data
        let downloadedData=[];
        $.when(RequestManager.getSpatialOverview(indikatorauswahl.getSelectedIndikator(),ags).done(function(data){
            area_info.prepareDataForTable(data,lan);
            downloadedData=data;

        }));
    },


    prepareDataForTable:function(data,lan){ // prepares the raw data for visualisation in a Table- creates single rows (objects) for each Indicator
        let tableData=[];
        console.log("Data length: "+ data.length);
        console.log("Data: "+data);
        for (let index in data){
            console.log("elem: "+ index);
            console.log("Name: "+ Object.keys(data[index]));
            let catalogIndex = toString(Object.keys(data[index]));
            for (let category in data[index]) {
                let categoryName=" ";
                console.log("Categorties: " + Object.keys(data[index][category]));
                if (lan=="de" ){ // check for Language!!!
                    categoryName=data[index][category]["cat_name"];
                }
                else{
                    categoryName=data[index][category]["car_name_en"];
                }
                console.log("Category name: "+categoryName);
                for (let indicator in data[index][category]["values"]){
                    console.log("Indicators: " + Object.keys(data[index][category]["values"][indicator]));
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
                        console.log("Category: "+ tableRow.categoryName+ " ID: "+tableRow.id+ " Name: "+tableRow.indicatorName+" Value: "+tableRow.value+ " Text: "+ tableRow.indicatorText);
                }
            }

        }


    },

    roundNumber:function(indicatorId,number){
        let decimalSpaces=indikatorauswahl.getIndikatorInfo(indicatorId,"rundung");
        return Math.round(parseFloat(number) * Math.pow(10, decimalSpaces)) / Math.pow(10, decimalSpaces)
        console.log("Rundung: "+rundung);
    },
    drawTable:function(data){
    }

};

