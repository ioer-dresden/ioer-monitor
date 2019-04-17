
const Area_info={
    parameters:{ // all the necessary Values
        endpoint_id: "statistics_content",
        ags:"",
        name:"",
        data:[],
        lan:""
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


    open:function(){
        this.parameters.data=this.getData(this.parameters.ags); // Getting the Data
        this.parameters.lan=language_manager.getLanguage();
        console.log("Data: "+this.parameters.data);
        const timeStamp = zeit_slider.getTimeSet(),
            lan=this.parameters.lan;


        //Write the HTML code for Statistics Dialog View
        const html = he.encode(`
        <div class="jq_dialog" id="${this.endpoint_id}">
            <div class="flex" id="area_info_container">
                    <div > 
                        <div class="flex" >             
                        <h2 class="flexElement">${this.text[lan].indicatorValues}</h2>
                        <h2 class="flexElement"> ${this.parameters.name}</h2>
                        <h3 class="flexElement" style="color: slategray">  (AGS: ${this.parameters.ags})</h3>
                        </div> 
                    
                    <h3 class="flexElement">${this.text[lan].time}: ${timeStamp}</h3>
                    </div>
                    <button id="downloadButton">
                        ${this.text[lan].download}
                    </button>                                    
            </div>
            <br/>
            <hr />
        </div>
        `);

        //setting up the dialog Window
        dialog_manager.instructions.endpoint = `${this.endpoint_id}`;
        dialog_manager.instructions.html = html;
        dialog_manager.instructions.title = this.text[lan].title;
        dialog_manager.create();

    },

    getData:function(ags){
        let downloadedData=[];
        $.when(RequestManager.getSpatialOverview(indikatorauswahl.getSelectedIndikator(),ags).done(function(data){

            downloadedData=data;
        }));

    }

};

