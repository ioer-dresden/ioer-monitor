class MapHelper{
  static mapReset(){
      let url = window.location.href.replace(window.location.search,'');
      window.open(url,"_self");
  }
  static setMarker(lat,lng,title){
        if(!title){
            title = "<b>"+lat+" "+lon+"</b>"
        }
        let icon = L.icon({iconUrl:"frontend/assets/icon/marker-icon.png",shadowUrl:"frontend/assets/icon/marker-shadow.png"});
        let popup =L.popup().setLatLng([lat,lng]).setContent(title).openOn(map);
        map.setView(new L.LatLng(lat, lng),urlparamter.getUrlParameter('zoom'));
  }
  static getBldName(_ags){
        let ags = _ags.substring(0,2);
        switch(ags){
            case "01":
                return "Schleswig-Holstein";
            case "02":
                return "Hamburg";
            case "03":
                return "Niedersachsen";
            case "04":
                return "Bremen";
            case "05":
                return "Nordrhein-Westfalen";
            case "06":
                return "Hessen";
            case "07":
                return "Rheinland-Pfalz";
            case "08":
                return "Baden-Württemberg";
            case "09":
                return "Bayern";
            case "10":
                return "Saarland";
            case "11":
                return "Berlin";
            case "12":
                return "Brandenburg";
            case "13":
                return "Mecklenburg-Vorpommern";
            case "14":
                return "Sachsen";
            case "15":
                return "Sachsen-Anhalt";
            case "16":
                return "Thüringen";
        }
  }
  static clearMap(){
      map.eachLayer(function(_layer){
          // Try/catch block as a quick and dirty solution to avoid crashing when asking for non-existing layers. Happens because leaflet plugin leaflet.wms.js has a bit different syntax?? (needs _layer.getLayer(layername).removeFrom(map)). See the implementation in Flaeschenschema.js
          try {
              _layer.removeFrom(map);
          }
          catch (err){
              console.log("Error in Maphelper: layer does not exist:\n"+ err);

          }
      })
  }
}