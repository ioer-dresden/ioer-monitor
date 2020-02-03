//global variablen
let url_flaechenschema_mapserv = "http://monitor.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map", // ACHTUNG!!! Legende wird von maps.ioer.de geholt!!!!! Dumm, aber sonst zugriffverweigerung bei Legendeabfragen!!
    text={ de:{
            landuse: "Flächennutzung",
            basemap: "Monitor-Basiskarte Flächennutzung",
            agriculture:"Landwirtschaft",
            wooded: "Wald und Gehölz",
            not_cultivated: "Unkultivierte Bodenfläche",
            water:"Wasserfläche",
            mining: "Abbau- und Haldenfläche",
            built_up: "Baulich geprägte Fläche",
            urban_green:"Siedlungsfreifläche",
            traffic:"Verkehrsfläche"
        },
        en:{
            landuse: "Land Use",
            basemap: "Monitor Land Use Basemap",
            agriculture:"Agricultural area",
            wooded: "Wooded area",
            not_cultivated: "Uncultivated area",
            water:"Water",
            mining: "Mining and stockpile area",
            built_up: "Built up area",
            urban_green:"Urban green space",
            traffic:"Traffic infrastructure"
    }
    },
    flaechenschema_wms = new L.tileLayer.wms(url_flaechenschema_mapserv,
        {
            //cache: Math.random(),
            version: '1.3.0',
            format: 'image/png',
            srs: "EPSG:3035",
            transparent: true,
            name: 'WMS Flächenschema'
        }),
    // defining the overlay map parameters. Basically separate layers needed to achieve different zoom behaviours for each layer. uses plugin leaflet.wms.js. Plugin needed to achieve 'single Tile WMS'. Otherwise the area labels are repeated in each Leaflet Tile.
    zusatzlayers = {
        bordersBld: L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
            format: 'image/png',
            transparent: true,
            name: "Landesgrenzen",
            attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG (' + (new Date).getFullYear() + ')</a>',
            minZoom:0,
            maxZoom:8,
            identify: false
        }),
        bordersKrs: L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
            format: 'image/png',
            transparent: true,
            name: "Kreisgrenzen",
            attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG (' + (new Date).getFullYear() + ')</a>',
            minZoom:9,
            maxZoom:11,
            identify: false
        }),

        bordersGem: L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
            format: 'image/png',
            transparent: true,
            name: "Gemeindegrenzen",
            attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG (' + (new Date).getFullYear() + ')</a>',
            minZoom:12,
            maxZoom:18,
            identify: false
        })
    },
    fl_init = false;

class Flaechenschema {
    static getTxt() {
        return {de: {title: "Monitor-Basiskarte Flächennutzung"}, en: {title: "Monitor Land Use Basemap"}};
    }

    static getState() {
        return fl_init;
    }

    static init() {
        zeit_slider.init([2000, 2006, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]);
        if (!fl_init) {
            Flaechenschema.set();
        } else {
            Flaechenschema.remove();
        }
    }

    static set() {
        //map_header.set();
        //map_header.show();
        map.off('click');
        map_header.updateText(`${Flaechenschema.getTxt()[language_manager.getLanguage()].title} (${zeit_slider.getTimeSet()})`);
        MapHelper.clearMap();
        flaechenschema_wms.setParams({layers: `flaechenschema_${zeit_slider.getTimeSet()}`});
        //hide all elements which are not needed
        helper.disableElement('.fl-unbind', "");
        helper.enableElement('.indicator_choice', "");
        toolbar.closeAllMenues();
        $("#btn_flaechenschema").css("background-color", farbschema.getColorHexActive());
        // Adding all extra overlay maps
        zusatzlayers.bordersBld.getLayer("vg250_lan").addTo(map);
        zusatzlayers.bordersKrs.getLayer("vg250_krs").addTo(map);
        zusatzlayers.bordersGem.getLayer("vg250_gem").addTo(map);

        flaechenschema_wms.addTo(map);
        //zusatzlayers.bordersKrs
        let legende = new FlaechenschemaLegende();

        map.on('click', this.onClick);
        fl_init = true;
    }

    static remove() {
        let indicator_set = indikatorauswahl.getSelectedIndikator();
        flaechenschema_wms.removeFrom(map);
        map.removeLayer(zusatzlayers.bordersBld.getLayer("vg250_lan"));
        // remove all the extra overlay layers. has a bit different syntax than flaeschenschema_wms, because uses plugin leaflet.wms.js
        zusatzlayers.bordersBld.removeSubLayer("vg250_lan");
        zusatzlayers.bordersKrs.removeSubLayer("vg250_krs");
        zusatzlayers.bordersGem.removeSubLayer("vg250_gem");

        helper.enableElement('.fl-unbind', "");
        $("#btn_flaechenschema").css("background-color", farbschema.getColorHexMain());
        indikatorauswahl.setIndicator(indicator_set);
        if (indicator_set || typeof indicator_set !== "undefined") {
            additiveLayer.init();
        }
        //map.off('click');
        fl_init = false
    }

    static onClick(e) {
        let X = map.layerPointToContainerPoint(e.layerPoint).x,
            Y = map.layerPointToContainerPoint(e.layerPoint).y,
            BBOX = map.getBounds().toBBoxString(),
            SRS = 'EPSG:4326',
            WIDTH = map.getSize().x,
            HEIGHT = map.getSize().y,
            lat = e.latlng.lat,
            lng = e.latlng.lng,
            layername = `flaechenschema_${zeit_slider.getTimeSet()}`;

        let windowWidth = $(window).width();

                if (windowWidth > 2045) {
                    WIDTH = 2045;
                } else {
                    WIDTH = map.getSize().x;
                }

        let URL = url_flaechenschema_mapserv + '&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX=' +
            BBOX + '&SRS=' +
            SRS + '&WIDTH=' + WIDTH + '&HEIGHT=' + HEIGHT +
            '&LAYERS=' + layername +
            '&STYLES=&FORMAT=image/png&TRANSPARENT=true&QUERY_LAYERS=' +
            layername + '&INFO_FORMAT=html&X=' + X + '&Y=' + Y;

        let getPixelValue = $.ajax({
            url: URL,
            cache: false,
            datatype: "html",
            type: "GET"
        });

        getPixelValue.done(function (data) {

            let html_value = $(data).text().match(/\d+/)[0];
            let html_float = parseFloat(html_value);

            let popup = new L.popup({
                maxWith: 300
            });
            popup.setContent(` ${text[language_manager.getLanguage()].landuse}:</br>  <b> ${Flaechenschema.getLandUseCode(html_float)}</b>` );
            popup.setLatLng(e.latlng);
            popup.openOn(map);
            map.openPopup(popup)
        })

    }
    static getLandUseCode(code){
        switch (true) {
            case (code >=  0 && code <=  7):
                return text[language_manager.getLanguage()].agriculture;

            case (code >=  8 && code <=  11):
                return text[language_manager.getLanguage()].wooded;

            case (code >=  12 && code <=  16):
                return text[language_manager.getLanguage()].not_cultivated;

            case (code >=  16 && code <=  20):
                return text[language_manager.getLanguage()].water;

            case (code ==  21):
                return text[language_manager.getLanguage()].mining;

            case (code >=  100 && code <=  104):
                return text[language_manager.getLanguage()].built_up;

            case (code >=  120 && code <=  127):
                return text[language_manager.getLanguage()].urban_green;

            case (code >=  161 && code <=  168):
                return text[language_manager.getLanguage()].traffic;


        }
    }


}



class FlaechenschemaLegende {
    constructor() {
        let legendeURL= "http://maps.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map";
        let image = `${legendeURL}&MODE=legend&layer=flaechenschema_${zeit_slider.getTimeSet()}&IMGSIZE=150+300`;
        legende.init();
        // hide all Elements except the needed ones ("datengrundlage_container")
        legende.getEinheitObject().remove();
        let infoChildren = legende.getIndicatorInfoContainer().children();
        let child;
        let keepLegendElements = [legende.getDatengrundlageContainer().attr('id')]; // here include all the elements (from "indicator_info" <div>) that are to be kept
        for (child of infoChildren) {
            try {
                if (!(keepLegendElements.includes(child.id))) {
                    child.style.display = "none"
                }
            } catch {
                console.log("Did not manage to hide child")
            }
        }
        legende.getDatenalterContainerObject().css("visibility", "hidden");
        legende.getDatengrundlageObject().html(`<div> Abgeleitet aus ATKIS Basis-DLM (Verkehrstrassen gepuffert mit Breitenattribut), Quelle: ATKIS Basis-DLM <a href="https://www.bkg.bund.de"> © GeoBasis- DE / BKG (${helper.getCurrentYear()})</a> <br/> <a href=" http://sg.geodatenzentrum.de/web_public/nutzungsbedingungen.pdf"> Nutzungsbedingungen</a> </div>
                                                    <br/>`) //set the data source
        legende.getLegendeColorsObject().empty().load(image, function () {

            let elements = $(this).find('img');
            elements.each(function (key, value) {
                let src = $(this).attr('src'),
                    url = "https://maps.ioer.de" + src;
                $(this).attr('src', url);
            });
        });

        legende.getDatenalterContainerObject().css("display", "none");
    }
}