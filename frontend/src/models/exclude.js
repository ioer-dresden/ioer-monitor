const exclude={
    text:{
        de:{
            disable_text:"Für die gewählte Raumgliederung nicht verfügbar",
            disable_text_raster:"Steht nur für die Räumliche Gliederung-Raster zur Verfügung"
        },
        en:{
            disable_text:"not available for the selected spatial unit",
            disable_text_raster:"Only available for Raster spatial subdivision"
        }
    },
    areas:["gem","stt","vwg"],
    class_performance:"disbale_performance",
    class_raster:"gebiete_disable",
    class_gebiete:"raster_disable",
    checkPerformanceAreas:function(){
        return $.inArray(base_raumgliederung.getBaseRaumgliederungId(), this.areas) === -1;
    },
    setPerformanceElements:function(){
        let elements = $(`.${this.class_performance}`);
        if(this.checkPerformanceAreas()){
           elements.each(function() {
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
            });
        }else{
            elements.each(function() {
                helper.disableElement(`#${$(this).attr("id")}`, exclude.text[language_manager.getLanguage()].disable_text);
            });
        }
    },
    setSpatialExtendelements:function(){
        let elements_raster = $(`.${this.class_raster}`),
            elements_gebiete= $(`.${this.class_gebiete}`);
        if(raeumliche_visualisierung.getRaeumlicheGliederung()==="raster"){
            elements_raster.each(function() {
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
                if ($(this).attr("id")==="ind_compare"){
                    // show indicator compare icon when in raster
                    $(this).css("display", "initial")
                }
            });
            elements_gebiete.each(function() {
                helper.disableElement(`#${$(this).attr("id")}`, exclude.text[language_manager.getLanguage()].disable_text);
                if ($(this).attr("id")==="panRight"){
                    // hide PanRight (table) when in raster
                    $(this).css("display", "none")
                }
            });
        }else{
            elements_raster.each(function() {
                helper.disableElement(`#${$(this).attr("id")}`, exclude.text[language_manager.getLanguage()].disable_text_raster);
                if ($(this).attr("id")==="ind_compare"){
                    // hide the Indicator comparison when in Vector mode
                    $(this).css("display", "none");
                }

            });
            elements_gebiete.each(function() {
                helper.enableElement(`#${$(this).attr("id")}`, $(this).data("title"));
                if ($(this).attr("id")==="panRight"){
                    // hide the Table Button when in Raster mode
                    $(this).css("display", "initial")
                }

            });
        }
    }
};