const map_header = {
    text: {
        de: {
            germany: "Deutschland"
        },
        en: {
            germany: "Germany"
        }
    },
    getDOMObject: function () {
        $elem = $('.indikator_header');
        return $elem;
    },
    show: function () {
        this.getDOMObject().show();
    },
    hide: function () {
        this.getDOMObject().hide();
    },
    set: function () {
        const object = this;
        let indikator_text = object.getDOMObject().find('#header'),
            time = zeit_slider.getTimeSet();
        // add the Flaeschenschema.js header if Land-use basemap is switched on
        if (Flaechenschema.getState()) {
            indikator_text.text(Flaechenschema.getTxt()[language_manager.getLanguage()].title + " " + time);
        } else {
            let interval = setInterval(function () {
                let spatial_object = object.getDOMObject().find('#header_raumgl'),
                    spatial_text = raeumliche_analyseebene.getSelectionText();

                if (indikatorauswahl.getPossebilities()
                    && raeumliche_analyseebene.getSelectionText()) {
                    clearInterval(interval);
                    let
                        indikator_name = function () {
                            let name = indikatorauswahl.getSelectedIndikatorText_Lang();
                            if (!name || typeof name === "undefined") {
                                name = indikatorauswahl.getSelectedIndikatorText();
                            }
                            return name;
                        },
                        split_txt = function () {
                            let txt = "als";
                            if (language_manager.getLanguage() === "en") {
                                txt = "as";
                            }
                            return " " + txt + " ";
                        };

                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                        if (!raumgliederung.getSelectionId() && gebietsauswahl.countTags() == 0) {
                            spatial_text = raeumliche_analyseebene.getSelectionText() + " in " + map_header.text[language_manager.getLanguage()].germany;
                        } else if (!raumgliederung.getSelectionId() && gebietsauswahl.countTags() > 0) {
                            spatial_text = gebietsauswahl.getSelectionAsString();
                        } else {
                            spatial_text = gebietsauswahl.getSelectionAsString() + split_txt() + raumgliederung.getSelectionText();
                        }
                    }
                    indikator_text.text(indikator_name() + " (" + time + ")");
                    spatial_object.text(spatial_text);
                }
            }, 500);
        }
    },
    updateText: function (_text) {
        this.getDOMObject().find("#header_raumgl").empty();
        this.getDOMObject().find("#header").text(_text);
    },
    moveVertical: function (_position, _range) {
        this.getDOMObject().css(_position, _range);
    },
    resetCSS: function () {
        this.getDOMObject().removeAttr("style");
    }
};