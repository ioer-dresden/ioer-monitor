const map_header ={
    text:{
        de:{
            germany:"Deutschland"
        },
        en:{
            germany:"Germany"
        }
    },
    getDOMObject:function(){
        $elem = $('.indikator_header');
        return $elem;
    },
    show:function(){
        this.getDOMObject().show();
    },
    hide:function(){
        this.getDOMObject().hide();
    },
    set:function(){
        const object = this;
        var interval = setInterval(function () {
            if (indikatorauswahl.getPossebilities()
                && raeumliche_analyseebene.getSelectionText()) {
                clearInterval(interval);
                let spatial_object = object.getDOMObject().find('#header_raumgl'),
                    indikator_text = object.getDOMObject().find('#header'),
                    indikator_name = function(){
                        let name = indikatorauswahl.getSelectedIndikatorText_Lang();
                        if(!name || typeof name ==="undefined"){
                            name = indikatorauswahl.getSelectedIndikatorText();
                        }
                        return name;
                    },
                    time = zeit_slider.getTimeSet(),
                    spatial_text = raeumliche_analyseebene.getSelectionText();
                    split_txt = function () {
                        let txt = "als";
                        if (language_manager.getLanguage() === "en") {
                            txt = "as";
                        }
                        return " " + txt + " ";
                    };

                if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                    if (!raumgliederung.getSelectionId() && gebietsauswahl.countTags() == 0) {
                        console.log("language in map_header: "+ language_manager.getLanguage());
                        spatial_text = raeumliche_analyseebene.getSelectionText() + " in "+ map_header.text[language_manager.getLanguage()].germany;

                        console.log("map Header if");
                        console.log("map header raeuml_analyseebene id:" +raeumliche_analyseebene.getSelectionId());
                        console.log("map header raeuml_analyseebene text "+ raeumliche_analyseebene.getSelectionText());
                    } else if (!raumgliederung.getSelectionId() && gebietsauswahl.countTags() > 0) {
                        spatial_text = gebietsauswahl.getSelectionAsString();
                        console.log("mapHeader else if");
                    } else {
                        spatial_text = gebietsauswahl.getSelectionAsString() + split_txt() + raumgliederung.getSelectionText();
                        console.log("Map header else");
                    }
                }
                indikator_text.text(indikator_name() + " (" + time + ")");
                spatial_object.text(spatial_text);
            }
        }, 100);
    },
    moveVertical:function(_position,_range){
        this.getDOMObject().css(_position,_range);
    },
    resetCSS:function(){
        this.getDOMObject().removeAttr("style");
    }
};