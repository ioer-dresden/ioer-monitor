const zeit_slider={
    jahre:'',
    parameter:'time',
    getContainerDOMObject:function(){
        $elem = $('#slider_zeit_container');
        return $elem;
    },
    getSliderDOMObject:function(){
        $elem = $( "#zeit_slider" );
        return $elem;
    },
    setParameter:function(_value){
        urlparamter.setUrlParameter(this.parameter,_value);
    },
    updateParam:function(_value){
        urlparamter.updateURLParameter(this.parameter,_value);
    },
    init:function(jahre) {
        const object = this;
        let time_param = this.getTimeSet(),
            value_set=jahre.length-1,
            slider = this.getSliderDOMObject();

        //show the time container
        object.jahre= jahre;
        object.show();

        if(!time_param){
            object.setParameter(jahre[value_set]);
        }
        //time param is set
        else{
            if(jahre.length == 1){
                object.updateParam(jahre[value_set]);
                alert_manager.alertOneTimeShift();
                object.hide();
            }
            else if($.inArray(parseInt(time_param),jahre)!= -1){
                object.updateParam(jahre[$.inArray(parseInt(time_param),jahre)]);
                value_set = $.inArray(parseInt(time_param),jahre);
            }
            else{
                if($.inArray(parseInt(time_param),jahre) == -1){
                    object.updateParam(jahre[value_set]);
                    alert_manager.alertNotInTimeShift();
                }
            }
        }

        //initializeFirstView the slider by given values
        slider
            .slider({
                orientation: "horizontal",
                min: 0,
                max: jahre.length-1,
                step: 1,
                value: value_set,
                stop: function (event, ui) {
                    object.updateParam(jahre[ui.value]);
                    if (raeumliche_visualisierung.getRaeumlicheGliederung() === 'gebiete') {
                        var time = object.getTimeSet(),
                            //disable SST and g50
                            stt = $('#Raumgliederung option[value="stt"]'),
                            g50 = $('#Raumgliederung option[value="g50"]');

                        if (time < 2014) {
                            stt.prop('disabled', true);
                            g50.prop('disabled', true);
                        } else {
                            stt.prop('disabled', false);
                            g50.prop('disabled', false);
                        }
                        //get the json and table
                        if (gebietsauswahl.countTags()==0) {
                            indikator_json.init();
                        }
                        else {
                            indikator_json.init(raumgliederung.getSelectedId());
                        }
                    }else{
                        indikator_raster.init();
                    }
                    map.dragging.enable();
                }
            })
            .mouseenter(function () {
                map.dragging.disable();
            })
            .mouseleave(function() {
                map.dragging.enable();
            });
        pips.set(slider,jahre);
    },
    show:function(){
        this.getContainerDOMObject().show();
    },
    hide:function(){
        this.getContainerDOMObject().hide();
    },
    getTimeSet:function(){
        return urlparamter.getUrlParameter(this.parameter);
    }
};