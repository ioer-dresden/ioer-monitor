
//global variablen
var url_flaechenschema_mapserv = "https://maps.ioer.de/cgi-bin/mapserv_dv?Map=/mapsrv_daten/detailviewer/mapfiles/flaechenschema.map",
    flaechenschema_wms = new L.tileLayer.wms(url_flaechenschema_mapserv,
        {
            cache: Math.random(),
            version: '1.3.0',
            format: 'image/png',
            srs: "EPSG:3035",
            transparent: true,
            attribution: '<a href="https://de.wikipedia.org/wiki/Amtliches_Liegenschaftskatasterinformationssystem">Abgeleitet aus ATKIS Basis-DLM (Verkehrstrassen gepuffert mit Breitenattribut), Quelle: ATKIS Basis-DLM © GeoBasis- DE / BKG ('+(new Date).getFullYear()+')</a>',
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
        console.info("set Flächenschema");
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
        MapHelper.clearMap();
        flaechenschema_wms.setParams({layers: `flaechenschema_${zeit_slider.getTimeSet()}`});
        //hide all elements which are not needed
        helper.disableElement('.fl-unbind',"");
        helper.enableElement('.indicator_choice',"");
        toolbar.closeAllMenues();
        $("#btn_flaechenschema").css("background-color",farbschema.getColorHexActive());
        flaechenschema_wms.addTo(map);
        let legende = new FlaechenschemaLegende();
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
        fl_init=false
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