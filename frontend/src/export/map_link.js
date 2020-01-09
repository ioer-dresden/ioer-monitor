const map_link={

    text:{
        de:{
            map:"Karte des Monitor der Siedlungs und Freiraumentwicklung",
            mailTextBegin:"Sehr geehrte Damen und Herren,%0AIhnen wird in dieser Email ein Link zu einer interaktiven Karte des Monitors der Siedlungs- und Freiraumentwicklung des Leibniz-Instituts für ökologische Raumentwicklung (http://www.ioer.de) gesendet. %0A%0ABitte nutzen Sie folgenden Weblink, um die Karte aufzurufen:",
            mailTextEnd:"%0A%0AMit freundlichen Grüßen %0A%0A",
            mapSaved:"Ihre Karte wurde gespeichert. Sie können diese im Viewer jeder Zeit unter Angabe der Kartennummer<br>",
            mapPublish:"<br>aufrufen oder über den folgenden Link direkt anderen zur Verfügung stellen:",
            mapLink:"Kartenlink versenden:"

        },
        en:{
            map:"Map of the settlement- and recreational area development",
            mailTextBegin:"Dear Ladies and Gentlemen, In this email you are receiving a link to an interactive map of the monitor of the settlement and recreational development of the Leibniz Institute for Ecological Spatial Development (http://www.ioer.de). %0A%0APlease click on the following Link to access the map:",
            mailTextEnd:"%0A%0Awith kind regards, %0A%0A",
            mapSaved:"Your map was saved. You can can access it anytime by entering the following map number in the map-link input field:<br>",
            mapPublish:"<br>You can also use the following link to access the map directly:",
            mapLink:"Send the map-link"
        }
    },
    init:function(){
        this.controller.set();
    },
    controller:{
        set:function(){
            $(document).on("click","#kartenlink",function(){

                let setting={"id":"set","val":urlparamter.getAllUrlParameter()};

                $.when(RequestManager.handleLink(setting)).done(function (data) {
                    let lan=language_manager.getLanguage();
                    if(data.state==="inserted") {
                        let rid=data.res[0]["id"],
                            link_a = urlparamter.getURLMonitor() + "?rid=" + rid,
                            mail_link = `mailto:?
                                     subject${map_link.text[lan].map} (www.ioer-monitor.de)
                                     &body=${map_link.text[lan].mailTextBegin} ${urlparamter.getURLMonitor()}?rid=${rid} ${map_link.text[lan].mailTextEnd}`;
                        swal({
                            title:`<img src="frontend/assets/icon/worldwide.png" style="display: block; margin-left: auto;margin-right: auto"/>`,
                            text: `<span class="text-black">${map_link.text[lan].mapSaved}
                                   <b style="color:red;">${rid}</b>
                                   ${map_link.text[lan].mapPublish}</span>
                                    <br/>
                                    <a href="${link_a}" target="_blank" style="margin-top:1vh;">${link_a}</a>
                                    <br/>
                                    <p style="margin-top: 1vh">${map_link.text[lan].mapLink}
                                        <a id="rid_mail_to" href="${mail_link}"
                                        style="background-color:#BDDDFD; padding-left:12px; padding-right:12px; color:#333; text-decoration:none;"
                                        class="button_standard_abschicken_a">E-Mail</a>
                                    </p>`,
                            html:true,
                            showCancelButton:false
                        });
                    }else{
                        alert_manager.alertError();
                    }
                });
            });

            $('#rid').keypress(function(e) {
                if(e.which === 13) {
                    e.preventDefault();
                    var link = $(this).val();
                    map_link.controller.loadRID(link);
                }
            });
        },
        loadRID(_rid){
            let setting = {"id":"get","val":_rid};
            $.when(RequestManager.handleLink(setting)).done(function (data) {
                if(data.state==="get") {
                    window.location.href = `${window.location.href.split('?')[0]}?${data.res[0]["array_value"]}`;
                }else{
                    alert_manager.alertError();
                }
            });
        }
    }
};