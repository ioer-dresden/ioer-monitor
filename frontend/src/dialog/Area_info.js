
const Area_info={
    parameters:{
        endpoint_id: "statistics_content",
        ags:"",
        name:"",
        data:[]
    },

    text:{
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
        this.parameters.data=this.getData(this.parameters.ags);
        console.log("Data: "+this.parameters.data);

        
    },

    getData:function(ags){
        let downloadedData=[];
        $.when(RequestManager.getSpatialOverview(indikatorauswahl.getSelectedIndikator(),ags).done(function(data){

            downloadedData=data;
        }));

    }

};

