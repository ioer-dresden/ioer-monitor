const geolocate={
    text:{
        de:{
            youAreIn:"Sie befinden sich innerhalb von",
            mFromThisPoint:"m ausgehend von diesem Punkt"
        },
        en:{
            youAreIn:"You are within",
            mFromThisPoint: "of this point"
        }
    },
    selector_id:"#geolocate",
    cirle:false,
    marker:false,
    active:false,
    getDOMContainer:function(){
        $elem = $(`${this.selector_id}`);
        return $elem;
    },
    locateElement:L.control({position: 'topright'}),
    init:function(){
        geolocate.locateElement.onAdd = function (map) {
            var div = L.DomUtil.create('div');
            div.id="geolocate_id";
            div.title = "Meinen Standort bestimmen";
            div.innerHTML = `<div id="${geolocate.selector_id.replace("#","")}" class="locate btn_map cursor"></div>`;

            L.DomEvent
                .on(div, 'click', function () {
                    if(!geolocate.active){
                        map.on('locationfound', geolocate.onLocationFound);
                        map.locate({
                            setView: true,
                            maxZoom: 16
                        });
                        geolocate.active=true;
                    }else {
                        map.stopLocate();
                        map.removeLayer(geolocate.marker);
                        geolocate.getDOMContainer().css("background-color",farbschema.getColorHexMain());
                        geolocate.active=false;
                    }
                });

            return div;
        };
        geolocate.locateElement.addTo(map);
    },
    onLocationFound:function(e) {
        var radius = Math.round(e.accuracy / 2);
        lan=language_manager.getLanguage();
        geolocate.marker = L.marker(e.latlng).addTo(map)
            .bindPopup(`${this.text[lan].youAreIn} ${radius} ${this.text[lan].mFromThisPoint}`).openPopup();
        geolocate.getDOMContainer().css("background-color", farbschema.getColorHexActive());
    }
};