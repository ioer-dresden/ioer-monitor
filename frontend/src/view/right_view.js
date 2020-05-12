const right_view = {
    getDOMObject: function(){
        $elem = $('.right_content');
        return $elem;
    },
    getCloseIconObject:function(){
        $elem= $('#table_close');
        return $elem;
    },
    open:function(){
        console.log("Is the right view visible? "+ this.isVisible());
        const view = this;
        let btn_group_map = $('#btn-group-map');
        //show only the table view, if the user set a indicator
        if(typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
            //set the mobile view
            if (view_state.getViewState() === "responsive") {
                if (!this.isVisible()) {
                    console.log("showing responsive in right view");
                    view.show();
                    left_view.hide();
                    view.getCloseIconObject().hide();
                    legende.close();
                    panner.setMapBackground();
                    btn_group_map.hide()
                    panner.hide();
                    exclude.setSpatialExtendelements();
                } else {
                    console.log("hiding responsive in right view");
                    view.hide();
                    left_view.show();
                    legende.getShowButtonObject().show();
                    panner.setTableBackground();
                    panner.show();
                    btn_group_map.show();
                    exclude.setSpatialExtendelements();
                    }
            } else {
                $('#mapwrap').addClass('splitter_panel');
                console.log("Splitter panel! in right view");
                view.show();
                panner.hide();
                view.getCloseIconObject().show();
                main_view.resizeSplitter(table.getWidth());
            }
        }else{
            alert_manager.alertNoIndicatorChosen();
        }

        //disable divider
        view.getCloseIconObject()
            .unbind()
            .click(function(){
                view.close();
                exclude.setSpatialExtendelements();
            });
    },
    close:function(){
        this.hide();
        $('#mapwrap').removeClass('splitter_panel');
        panner.show();
        console.log("closing right view");
        legende.resize();
        map.invalidateSize();
    },
    isVisible:function(){
        let state = true;
        if(this.getDOMObject().is(':hidden')){
            state = false;
        }
        return state;
    },
    hide:function(){
        this.getDOMObject().hide();
    },
    show:function(){
        this.getDOMObject().show();
    },
    getWidth:function(){
        return this.getDOMObject().width();
    }
};