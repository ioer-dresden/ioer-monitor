const panner = {
    getObject:function(){
        $elem = $('#panRight');
        return $elem;
    },
    getContainer:function(){return $('.panner')},
    hide:function(){
        this.getContainer().hide();
    },
    show:function(){
        this.getContainer().show();
        exclude.setSpatialExtendelements();
    },
    create:function(){
        $('#Modal').append(`
        <div id="panRight" 
            class="panner tablebackground checker cursor ${exclude.class_gebiete}" 
            data-scroll-modifier='1' data-title="Öffnen Sie die Tabellenansicht" 
            title="Öffnen Sie die Tabellenansicht"></div>
            
        <div id="${raster_split.selector_toolbar.replace("#","")}" 
        class=" cursor ${exclude.class_raster} panner splitterbackground" 
        data-title="vergleichen Sie 2 Indikatoren oder Zeitschnitte miteinander" 
        title="vergleichen Sie 2 Indikatoren oder Zeitschnitte miteinander"></div>
            
      `);
    },
    init:function(){
        this.create();
        this.controller.set();
        if(raeumliche_visualisierung.getRaeumlicheGliederung()!=='raster') {
            if(this.getObject().hasClass('mapbackground')){
                this.getObject().removeClass('mapbackground').addClass('tablebackground');
            }
        }
    },
    setTableBackground:function(){
        this.getObject().removeClass('mapbackground').addClass('tablebackground');
    },
    setMapBackground:function(){
        $('.tablebackground').toggleClass('mapbackground');
    },
    isVisible:function(){
        let state = false;
        if(this.getObject().is(":visible")){
            state = true;
        }
        return state;
    },
    controller:{
        set:function(){
            //bind the click functionality
            panner.getObject()
                .click(function(){
                    if(raeumliche_visualisierung.getRaeumlicheGliederung()===("gebiete")) {
                        right_view.open();
                    }
                });
        }
    }
};