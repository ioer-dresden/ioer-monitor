
//global variablen
let url_flaechenschema_mapserv = "https://maps.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map",
    flaechenschema_wms = new L.tileLayer.wms(url_flaechenschema_mapserv,
        {
            cache: Math.random(),
            version: '1.3.0',
            format: 'image/png',
            srs: "EPSG:3035",
            transparent: true
            //layername: 'WMS Flächenschema',
        }),
    fl_init = false;
class Flaechenschema{
    static getTxt(){
        return {de:{title:"Monitor-Basiskarte Flächennutzung"},en:{title:"Monitor Land Use Basemap"}};
    }
    static getState(){
        return fl_init;
    }
    static init(){
        zeit_slider.init([2000,2006,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018]);
        if(!fl_init){
            Flaechenschema.set();
            fl_init=true;
        }else{
            Flaechenschema.remove();
            fl_init=false;
        }
    }
    static set(){
        map_header.set();
        map_header.show();
        MapHelper.clearMap();
        flaechenschema_wms.setParams({layers: `flaechenschema_${zeit_slider.getTimeSet()}`});
        //hide all elements which are not needed
        helper.disableElement('.fl-unbind',"");
        helper.enableElement('.indicator_choice',"");
        toolbar.closeAllMenues();
        $("#btn_flaechenschema").css("background-color",farbschema.getColorHexActive());
        flaechenschema_wms.addTo(map);
        let legende = new FlaechenschemaLegende();
        map.on('click', this.onClick);
    }
    static remove(){
        let indicator_set = indikatorauswahl.getSelectedIndikator();
        flaechenschema_wms.removeFrom(map);
        helper.enableElement('.fl-unbind',"");
        $("#btn_flaechenschema").css("background-color",farbschema.getColorHexMain());
        indikatorauswahl.setIndicator(indicator_set);
        if(indicator_set || typeof indicator_set !== "undefined"){
            additiveLayer.init();
        }
        map.off('click', this.onClick);
        fl_init=false
    }
    static onClick(e){
        console.log("OnClick in Flaeschenschema!! ");
        let X = map.layerPointToContainerPoint(e.layerPoint).x,
            Y = map.layerPointToContainerPoint(e.layerPoint).y,
            BBOX = map.getBounds().toBBoxString(),
            SRS = 'EPSG:4326',
            WIDTH = map.getSize().x,
            HEIGHT = map.getSize().y,
            lat = e.latlng.lat,
            lng = e.latlng.lng,
            layername='WMS Flächenschema';

        let windowWidth = $(window).width();
/*
        if (windowWidth > 2045) {
            WIDTH = 2045;
        } else {
            WIDTH = map.getSize().x;
        }
        */

        console.log("BBOX: "+BBOX);
        console.log("SRS: "+SRS);
        console.log("WIDTH: "+ WIDTH+" HEIGHTH: "+HEIGHT);

        let URL= url_flaechenschema_mapserv+ '&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX=' +
        BBOX + '&SRS=' +
        SRS + '&WIDTH=' + WIDTH + '&HEIGHT=' + HEIGHT +
            '&LAYERS=' + layername +
        '&STYLES=&FORMAT=image/png&TRANSPARENT=true&QUERY_LAYERS=' +
            layername + '&INFO_FORMAT=html&X=' + X + '&Y=' + Y;

        console.log("Setting the clicking click onclick:  "+ URL);

        let getPixelValue = $.ajax({
            url: URL,
            cache: false,
            datatype: "html",
            type: "GET"
        });
        getPixelValue.done(function (data) {
            let html_value = $(data).text();
            console.log("Got the Pixel Value: "+ html_value);
            let html_float = parseFloat(html_value);
            let pixel_value = null;
    })
    }
}

class FlaechenschemaLegende{
    constructor() {
        let time = zeit_slider.getTimeSet(),
            image = `${url_flaechenschema_mapserv}&MODE=legend&layer=flaechenschema_${time}&IMGSIZE=150+300`,
            header = Flaechenschema.getTxt();
        legende.init();
        legende.getDatenalterContainerObject().hide();
        legende.getIndicatorInfo().hide();
        legende.close();
        legende.getLegendeColorsObject().empty().load(image,function () {
            let elements = $(this).find('img');
            elements.each(function (key, value) {
                let src = $(this).attr('src'),
                    url = "https://maps.ioer.de" + src;
                $(this).attr('src', url);
            });
        });
        map_header.updateText(`${header[language_manager.getLanguage()].title} (${time})`);
    }
}