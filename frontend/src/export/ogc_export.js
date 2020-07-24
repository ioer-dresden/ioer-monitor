const ogc_export= {
    service: "wms",
    endpoint_id: "ogc_dialog",
    /*  Dynamic Map-Service links disabled as of Kerngruppernsitzung 15.07.2020
    getLink:function(service){
        if(this.service==="wfs" || this.service==="wcs") {
            //return `https://monitor.ioer.de/cgi-bin/${this.service}?MAP=${indikatorauswahl.getSelectedIndikator()}_${this.service}`;
            return `https://monitor.ioer.de/monitor_api/user?id=${indikatorauswahl.getSelectedIndikator().toUpperCase()}&service=${service}<b>&key=<i  style="color:red;">Ihr API Key</i></b>`;
        }else{
            return `https://monitor.ioer.de/cgi-bin/wms?MAP=${indikatorauswahl.getSelectedIndikator().toUpperCase()}_wms`;
        }
    },
    */
    text: {
        de: {
            title: `WMS / WCS / WFS-Dienste`,
            use: `Die WMS/WCS/WFS-Dienste stehen Ihnen für die Verwendung der Karten in Ihrem eigenen GIS-System zur Verfügung. Voraussetzung ist die Zustimmung zu geltenden Nutzungsbedingungen.`,
            terms: 'Ich akzeptiere alle geltenden <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">Nutzungsbedingungen</a>',
            urlPart1: 'Die zu verwendende URL für den ',
            urlPart2: '-Dienst lautet:',
            noAPI: "Wenn Sie noch keinen API-Key besitzen, können Sie diesen durch eine einmalige Anmeldung generieren.",
            help: 'Falls Sie Hilfe benötigen, finden Sie hier eine Anleitung',
            accept: 'Akzeptieren'

        },
        en: {
            title: `WMS/WCS/WFS-Services`,
            use: `The WMS/WCS/WFS services are available to you to use the maps in your own GIS system. Prerequisite is the approval of applicable terms of use.`,
            terms: 'I accept all applicable <a target="_blank" href="http://www.ioer-monitor.de/fileadmin/Dokumente/PDFs/Nutzungsbedingungen_IOER-Monitor.pdf">terms of use</a>',
            urlPart1: 'The URL for the ',
            urlPart2: ' service to use is:',
            noAPI: 'If you do not have an API-key, you can generate it after registering for the service.',
            help: 'If you need help, you can find instructions here',
            accept: 'Accept'
        }
    },

        open: function (_service) {
            const object = this;
            this.service = _service;
            if (typeof indikatorauswahl.getSelectedIndikator() !== 'undefined') {
                let lan = language_manager.getLanguage(),
                    user_login = function () {
                        return `
                            <h4>${ogc_export.text[language_manager.getLanguage()].noAPI}</h4>
                            <div style="margin-top: 20px; margin-left: 20%;" class="cursor">
                                <a href="https://monitor.ioer.de/monitor_api" target="_blank">
                                     <i class="huge icons">
                                          <i class="big circle outline icon"></i>
                                          <i class="user icon"></i>
                                    </i>
                                </a>
                            </div>
                            <hr/>
                            <h4>${ogc_export.text[language_manager.getLanguage()].help}</h4>
                            <div style="margin-top: 20px; margin-left: 20%;" class="cursor">
                                <a href="frontend/assets/pdf/tutorial.${_service}.pdf" target="_blank">
                                     <i class="huge icons">
                                        <i class="big circle outline icon"></i>
                                        <i class="help icon"></i>
                                    </i>
                                </a>
                            </div>
                        `;
                    },
                    html = he.encode(`
                                     <div class="jq_dialog ogc_dialog" id="${object.endpoint_id}" xmlns="http://www.w3.org/1999/html">
                                        <h4>${object.text[lan].use}</h4>
                                        <div class="ogc_accecpt_container">
                                            <input title='${ogc_export.text[language_manager.getLanguage()].accept}' type="checkbox" name="allow" id="ogc_allow"/>
                                            <span>${object.text[lan].terms}</span>
                                        </div>
                                        <hr/>
                                        <div class="ogc_allow display-none" id="allow_container">
                                            
                                            <div id="wms_link_container" class="link_container">
                                                <h4>${object.text[lan].urlPart1}<b>WMS</b> ${object.text[lan].urlPart2}</h4>
                                                <h3 id="wms_link">https://monitor.ioer.de/cgi-bin/wms?MAP=${indikatorauswahl.getSelectedIndikator().toUpperCase()}_wms</h3>
                                            </div>
                                            <hr/>
                                            
                          
                                            <div id="wcs_link_container" class="link_container">   
                                                <h4>${object.text[lan].urlPart1}WCS ${object.text[lan].urlPart2}</h4>                                       
                                                <h3 id="wcs_link">https://monitor.ioer.de/monitor_api/user?id=${indikatorauswahl.getSelectedIndikator().toUpperCase()}&service=wcs<b>&key=<i  style="color:red;">Ihr API Key</i></b></h3>
                                            </div>
                                            <hr/>
                                            
                                            <div id="wfs_link_container" class="link_container">
                                            <h4>${object.text[lan].urlPart1}WFS ${object.text[lan].urlPart2}</h4>
                                                <h3 id="wfs_link">https://monitor.ioer.de/monitor_api/user?id=${indikatorauswahl.getSelectedIndikator().toUpperCase()}&service=wfs<b>&key=<i  style="color:red;">Ihr API Key</i></b></h3>
                                            </div>
                                            <hr/>
                                            </div>
                                                 ${user_login()}                                    
                                              </div> 
                                        </div>
                                        
                                    </div> 
                                  `);
                //settings for the manager
                let instructions = {
                    endpoint: `${this.endpoint_id}`,
                    html: html,
                    title: this.text[lan].title,
                    modal: false
                };


                dialog_manager.setInstruction(instructions);
                dialog_manager.create();

                // Modify the links being shown based on OGC-Service availability:
                let state_ogc = indikatorauswahl.getIndikatorInfo(indikatorauswahl.getSelectedIndikator(), "ogc");
                console.log("Export popup");
                console.info(state_ogc);
                if (state_ogc.wfs != "1"){
                    console.log("hiding wfs!");
                    $("#wfs_link_container").hide();
                }
                else {
                    $("#wfs_link_container").show();
                }
                if (state_ogc.wcs != "1"){
                    $("#wcs_link_container").hide();
                }
                else{
                    $("#wcs_link_container").show();
                }

                $('#ogc_allow')
                    .unbind()
                    .change(function () {
                        let container = $('#allow_container');
                        if ($(this).is(':checked')) {
                            container.show();
                        } else {
                            container.hide();
                        }
                    });

            } else {
                alert_manager.alertNoIndicatorChosen();
            }
        }
};