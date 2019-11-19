//global variablen
let url_flaechenschema_mapserv = "https://monitor.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map",
    flaechenschema_wms = new L.tileLayer.wms(url_flaechenschema_mapserv,
        {
            cache: Math.random(),
            version: '1.3.0',
            format: 'image/png',
            srs: "EPSG:3035",
            transparent: true,
            name: 'WMS Flächenschema',
        }),
    zusatzlayers = {
        bordersBld: L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
            format: 'image/png',
            transparent: true,
            name: "Landesgrenzen",
            attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG (' + (new Date).getFullYear() + ')</a>',
            minZoom:0,
            maxZoom:8,
        }),
        bordersKrs: L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
            format: 'image/png',
            transparent: true,
            name: "Kreisgrenzen",
            attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG (' + (new Date).getFullYear() + ')</a>',
            minZoom:9,
            maxZoom:13,
        }),

        bordersGem: L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
            format: 'image/png',
            transparent: true,
            name: "Gemeindegrenzen",
            attribution: '<a href="http://www.geodatenzentrum.de/geodaten/gdz_rahmen.gdz_div?gdz_spr=deu&gdz_akt_zeile=4&gdz_anz_zeile=4&gdz_unt_zeile=0&gdz_user_id=0">© GeoBasis- DE / BKG (' + (new Date).getFullYear() + ')</a>',
            minZoom:13,
            maxZoom:18
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
            fl_init = true;
        } else {
            Flaechenschema.remove();
            fl_init = false;
        }
    }

    static set() {
        //map_header.set();
        //map_header.show();
        map_header.updateText(`${Flaechenschema.getTxt()[language_manager.getLanguage()].title} (${zeit_slider.getTimeSet()})`);
        MapHelper.clearMap();
        flaechenschema_wms.setParams({layers: `flaechenschema_${zeit_slider.getTimeSet()}`});
        //hide all elements which are not needed
        helper.disableElement('.fl-unbind', "");
        helper.enableElement('.indicator_choice', "");
        toolbar.closeAllMenues();
        $("#btn_flaechenschema").css("background-color", farbschema.getColorHexActive());
        flaechenschema_wms.addTo(map);


        let additiveBLD=L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
                format:'image/png',
                transparent:true,
                minZoom:0,
                maxZoom:8
            }
        ),
            additiveKRS= L.WMS.source("http://sg.geodatenzentrum.de/wms_vg250", {
                    format:'image/png',
                    transparent:true,
                    minZoom:9,
                    maxZoom:12
                }
            );

        zusatzlayers.bordersBld.getLayer("vg250_lan").addTo(map);
        zusatzlayers.bordersKrs.getLayer("vg250_krs").addTo(map);
        zusatzlayers.bordersGem.getLayer("vg250_gem").addTo(map);

        this.setZoomBehavior();
        //zusatzlayers.bordersKrs
        let legende = new FlaechenschemaLegende();
        //this.setZoomBehavior();

        map.on('click', this.onClick);
    }

    static remove() {
        let indicator_set = indikatorauswahl.getSelectedIndikator();
        flaechenschema_wms.removeFrom(map);
        for (let zusatzMap in zusatzlayers){
            zusatzMap.removeFrom(map)
        }
        helper.enableElement('.fl-unbind', "");
        $("#btn_flaechenschema").css("background-color", farbschema.getColorHexMain());
        indikatorauswahl.setIndicator(indicator_set);
        if (indicator_set || typeof indicator_set !== "undefined") {
            additiveLayer.init();
        }
        map.off('click', this.onClick);
        fl_init = false
    }

    static addZusatzMaps(){
        let zoomLevel = map.getZoom();
        console.log("Zoom Level:" + zoomLevel);
        for (let mapLayer in zusatzlayers){
            console.log("Adding layer: "+ mapLayer);
            //this.setMaplayerTileParameters(zusatzlayers[mapLayer]);
            zusatzlayers[mapLayer].addTo(map);
            }
    }
    static setZoomBehavior(){
        for (let mapLayer in zusatzlayers){
            zusatzlayers[mapLayer].on('zoomend', this.addZusatzMaps());
        }
    }



    static onClick(e) {
        console.log("OnClick in Flaeschenschema!! ");
        let X = map.layerPointToContainerPoint(e.layerPoint).x,
            Y = map.layerPointToContainerPoint(e.layerPoint).y,
            BBOX = map.getBounds().toBBoxString(),
            SRS = 'EPSG:4326',
            WIDTH = map.getSize().x,
            HEIGHT = map.getSize().y,
            lat = e.latlng.lat,
            lng = e.latlng.lng,
            layername = 'WMS Flächenschema';

        let windowWidth = $(window).width();
        /*
                if (windowWidth > 2045) {
                    WIDTH = 2045;
                } else {
                    WIDTH = map.getSize().x;
                }
                */

        console.log("BBOX: " + BBOX);
        console.log("SRS: " + SRS);
        console.log("WIDTH: " + WIDTH + " HEIGHTH: " + HEIGHT);

        let URL = url_flaechenschema_mapserv + '&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX=' +
            BBOX + '&SRS=' +
            SRS + '&WIDTH=' + WIDTH + '&HEIGHT=' + HEIGHT +
            '&LAYERS=' + layername +
            '&STYLES=&FORMAT=image/png&TRANSPARENT=true&QUERY_LAYERS=' +
            layername + '&INFO_FORMAT=html&X=' + X + '&Y=' + Y;

        console.log("Setting the clicking click onclick:  " + URL);

        let getPixelValue = $.ajax({
            url: URL,
            cache: false,
            datatype: "html",
            type: "GET"
        });
        getPixelValue.done(function (data) {
            let html_value = $(data).text();
            console.log("Got the Pixel Value: " + html_value);
            let html_float = parseFloat(html_value);
            let pixel_value = null;
        })
    }
}


class FlaechenschemaLegende {
    constructor() {
        let image = `${url_flaechenschema_mapserv}&MODE=legend&layer=flaechenschema_${zeit_slider.getTimeSet()}&IMGSIZE=150+300`;
        legende.init();
        // hide all Elements except the needed ones ("datengrundlage_container")
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
        console.log("Trying to hide datenalterContainer");
        legende.getDatengrundlageObject().html(`<div> Abgeleitet aus ATKIS Basis-DLM (Verkehrstrassen gepuffert mit Breitenattribut), Quelle: ATKIS Basis-DLM <a href="https://www.bkg.bund.de"> © GeoBasis- DE / BKG (${helper.getCurrentYear()})</a> </div>
                                                    <br/>`) //set the data source

        legende.getLegendeColorsObject().empty().load(image, function () {
            let elements = $(this).find('img');
            elements.each(function (key, value) {
                console.log("Adding image");
                let src = $(this).attr('src'),
                    url = "https://monitor.ioer.de" + src;
                $(this).attr('src', url);
                console.log("URL for Land Use Map: " + url)
            });
        });
        legende.getDatenalterContainerObject().css("display", "none");
    }
}