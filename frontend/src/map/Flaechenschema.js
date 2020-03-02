//global variablen
let url_flaechenschema_mapserv = "https://monitor.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map", // ACHTUNG!!! Legende wird von maps.ioer.de geholt!!!!! Dumm, aber sonst zugriffverweigerung bei Legendeabfragen!!

    clickZoom=10,
    pointer='grab',

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
            traffic:"Verkehrsfläche",
            field:"Acker",
            grassland:"Grünland",
            orchard:"Steuobst",
            garden:"Gartenland",
            aboriculture:"Obstbau",
            wine:"Weinbau",
            otherAgriculture:"Sonstige Landwirtschaft",
            deciduous:"Laubholz",
            conifer:"Nadelholz",
            mixedForest:"Mischholz",
            copse:"Gehölz",
            heath:"Heide",
            moor:"Moor",
            swamp:"Sumpf",
            vegFree:"Unland, vegetationslose Fläche",
            notDefined:"Z.Z. unbestimmbare Fläche",
            watercourse:"Fließgewässer",
            standingWater:"Stehendes Gewässer",
            harbor:"Hafenbecken",
            sea: "Meer/Bodden",
            residential:"Wohnbau",
            mixedUse:"Mischnutzung",
            specialUse:"Besondere funktionale Prägung",
            industrial:"Industrie/Gewerbe",
            park:"Park/Grünanlage",
            allotment:"Kleingarten",
            weekendSettlement:"Wochenendsiedlung",
            golf:"Golfplatz",
            cemetery:"Friedhof",
            otherSettlement:"Sonstige Siedlungsfreifläche",
            streets:"Straßen (gewidmet)",
            road:"Fahrwege",
            rail:"Bahnverkehr",
            air:"Flugverkehr",
            roadTrace:"Verkehrsbegleitfläche Straße",
            railTrace: "Verkehrsbegleitfläche Bahn",
            airTrace:"Verkehrsbegleitfläche Flug"
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
            traffic:"Traffic infrastructure",
            field:"Agricultural field",
            grassland:"Grassland",
            orchard:"Orchard",
            garden:"Garden",
            aboriculture:"Aboriculture",
            wine:"Viniculture",
            otherAgriculture:"Other agricultural use",
            deciduous:"Deciduous",
            conifer:"Conifer",
            mixedForest:"Mixed",
            copse:"Copse",
            heath:"Heath",
            moor:"Moor",
            swamp:"Swamp",
            vegFree:"Vegetation-free area",
            notDefined:"Type not defined",
            watercourse:"Watercourse",
            standingWater:"Standing water",
            harbor:"Harbor basin",
            sea: "Sea/ lagoon",
            residential:"Residential",
            mixedUse:"Mixed use",
            specialUse:"Special functional use",
            industrial:"Industrial",
            park:"Park",
            allotment:"Garden allotment",
            weekendSettlement:"Weekend settlement",
            golf:"Golf course",
            cemetery:"Cemetery",
            otherSettlement:"Other settlement area",
            streets:"Street (dedicated)",
            road:"Road traffic",
            rail:"Rail traffic",
            air:"Air traffic",
            roadTrace:"Road traffic trace-area",
            railTrace: "Rail traffic trace-area",
            airTrace:"Air traffic trace-area"
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
        // change cursor to pointer if zoom level exceeded preset value
        Flaechenschema.manageZoom(clickZoom);
        map.on('zoomend', function(){Flaechenschema.manageZoom(clickZoom)});
        map.on('movestart', function(){
            $('.leaflet-container').css('cursor','grab');
                                     })
        map.on('moveend', function(){
            $('.leaflet-container').css('cursor',Flaechenschema.pointer);
        })

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
        map.off('click');
        fl_init = false
    }

    static onClick(e) {

        if (map.getZoom()>=clickZoom) {
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

            let html_value = $(data).text().match(/\d+/)[0],
                html_float = parseFloat(html_value),

                popup = new L.popup({
                    maxWith: 300
                }),
                content = Flaechenschema.getLandUseCode(html_float);
            popup.setContent(`<b> ${content.category}</b></br> ${content.type}`);
            popup.setLatLng(e.latlng);
            popup.openOn(map);
            map.openPopup(popup)
        })
    }

    }

    static manageZoom(clickZoom){
        if (map.getZoom()>=clickZoom){
            $('.leaflet-container').css('cursor','pointer');
            Flaechenschema.pointer='pointer';
        }
        else {
            $('.leaflet-container').css('cursor','grab');
            Flaechenschema.pointer='grab';
        }
    }

    static getLandUseCode(code){
        let lan=language_manager.getLanguage();
        let category="",
            type="";
        switch (true) {
            case (code >=  0 && code <=  7):
                category= text[lan].agriculture;
                type="";
                switch(true){
                    case (code==1):
                        type=text[lan].field;
                        break;
                    case (code==2):
                        type=text[lan].grassland;
                        break;
                    case (code==3):
                        type=text[lan].orchard;
                        break;
                    case (code==4):
                        type=text[lan].garden;
                        break;
                    case (code==5):
                        type=text[lan].aboriculture;
                        break;
                    case (code==6):
                        type=text[lan].wine;
                        break;
                    case (code==7):
                        type=text[lan].otherAgriculture;
                        break;
                }
                return {"category":category,"type":type};

            case (code >=  8 && code <=  11):
                category= text[lan].wooded;
                type="";
                switch(true){
                    case (code==8):
                        type=text[lan].deciduous;
                        break;
                    case (code==9):
                        type=text[lan].conifer;
                        break;
                    case (code==10):
                        type=text[lan].mixedForest;
                        break;
                    case (code==11):
                        type=text[lan].copse;
                        break;
                }

                return {"category":category,"type":type};

            case (code >=  12 && code <=  16):
                category= text[lan].not_cultivated;
                type="";
                switch(true){
                    case (code==12):
                        type=text[lan].heath;
                        break;
                    case (code==13):
                        type=text[lan].moor;
                        break;
                    case (code==14):
                        type=text[lan].swamp;
                        break;
                    case (code==15):
                        type=text[lan].vegFree;
                        break;
                    case (code==16):
                        type=text[lan].notDefined;
                        break;
                }
                return {"category":category,"type":type};

            case (code >=  17 && code <=  20):
                category= text[lan].water;
                type="";
                switch(true){
                    case (code==17):
                        type=text[lan].watercourse;
                        break;
                    case (code==18):
                        type=text[lan].standingWater;
                        break;
                    case (code==19):
                        type=text[lan].harbor;
                        break;
                    case (code==20):
                        type=text[lan].sea;
                        break;
                }
                return {"category":category,"type":type};

            case (code ==  21):
                category= text[lan].mining;
                type="";
                return {"category":category,"type":type};

            case (code >=  101 && code <=  104):
                category= text[lan].built_up;
                type="";
                switch(true){
                    case (code==101):
                        type=text[lan].residential;
                        break;
                    case (code==102):
                        type=text[lan].mixedUse;
                        break;
                    case (code==103):
                        type=text[lan].specialUse;
                        break;
                    case (code==104):
                        type=text[lan].industrial;
                        break;
                }
                return {"category":category,"type":type};

            case (code >=  121 && code <=  127):
                category= text[lan].urban_green;
                type="";
                switch(true){
                    case (code==121):
                        type=text[lan].park;
                        break;
                    case (code==122):
                        type=text[lan].allotment;
                        break;
                    case (code==123):
                        type=text[lan].weekendSettlement;
                        break;
                    case (code==124):
                        type=text[lan].golf;
                        break;
                    case (code==126):
                        type=text[lan].cemetery;
                        break;
                    case (code==127):
                        type=text[lan].otherSettlement;
                        break;
                }
                return {"category":category,"type":type};

            case (code >=  161 && code <=  168):
                category= text[lan].traffic;
                type="";
                switch(true){
                    case (code==161):
                        type=text[lan].streets;
                        break;
                    case (code==162):
                        type=text[lan].road;
                        break;
                    case (code==164):
                        type=text[lan].rail;
                        break;
                    case (code==165):
                        type=text[lan].air;
                        break;
                    case (code==166):
                        type=text[lan].roadTrace;
                        break;
                    case (code==167):
                        type=text[lan].railTrace;
                        break;
                    case (code==168):
                        type=text[lan].airTrace;
                        break;
                }
                return {"category":category,"type":type};

        }
    }


}


class FlaechenschemaLegende {
    constructor() {
        let legendeURL= "https://monitor.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map";
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