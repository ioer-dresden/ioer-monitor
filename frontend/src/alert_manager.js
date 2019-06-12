//collecteions of alerts using sweet alert for bootstrap: https://sweetalert2.github.io/
const alert_manager= {
    text:{
        de:{
            exitWithESC:"Verlassen Sie die Funktion mit ESC",
            reload:"Die Anwendung wurde aktualisiert",
            noIndicator:"kein Indikator gewählt",
            selectIndicator:"Bitte wählen Sie erst einen Indikator aus",
            error:"Fehler",
            problem:"Es ist ein Problem Aufgetreten",
            tryAgainFeedback:"Bitte versuchen Sie es später nochmal oder kontaktieren Sie uns über das Feedback Formular.",
            notAvailable:"Der Indikator ist im gewählten Zeitschnitt nicht vorhanden",
            forIndicator:"Für den Indikator ",
            yearSetTo:" wurde das Jahr auf ",
            angepasst:" angepasst",
            anzupassen:" anzupassen",
            noSpatial:"Der Indikator ist in der gewählten Raumgliederung nicht vorhanden.",
            adjustSpatialSelection:"Es wäre möglich den Indikator auf die Raumgliederung ",
            cancel:"Abbrechen",
            increasedLoad:"Erhöhte Rechenleistung",
            refineSelection:"Sie können durch eine Verfeinerung ihrer Auswahl, wie beispielsweise die Wahl eines Bundeslandes, den Prozess beschleunigen.",
            unsupportedBrowser:"Ihr Browser wird nicht unterstützt, bitte verwendet Sie einen aktuellen Browser wie "

        },
        en:{
            exitWithESC:"Leave the function with ESC",
            reload:"The Application was reloaded",
            noIndicator:"no Indicator chosen",
            selectIndicator:"Please select an Indicator",
            error:"Error",
            problem:"There has been a problem",
            tryAgainFeedback:"Please try again later, or contact us using the Feedback form",
            notAvailable:"The Indicator is not available in the selected timespan",
            forIndicator:"Fo the Indicator ",
            yearSetTo:" the Year was set to ",
            angepasst:"",
            anzupassen:"",
            noSpatial:"The indicator is not available in the selected spatial resolution",
            adjustSpatialSelection:"It would be possible to set the spatial selection to ",
            cancel:"Cancel",
            increasedLoad:"Increased computational requirements",
            refineSelection:"You can accelerate the Process by refining your selection, e.g. choosing one State.",
            unsupportedBrowser:"Your Browser is not being supported. Please use a newer one like  "
        }
    },
    lan:language_manager.getLanguage(),

    leaveESCInfo: function (title,message) {
        let _title=function(){
             let name = alert_manager.text[language_manager.getLanguage()].exitWithESC;
             if(title){name = title;}
             return name;
        },
            _text=function(){
                let name = "";
                if(message){name = message;}
                return name;
            };
        swal({
            title: _title(),
            text:_text()
        });
    },
    alertUpdate: function (version) {
        swal({
                title: alert_manager.text[language_manager.getLanguage()].reload,
                text: '',
                type: "info",
                html: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    localStorage.setItem("v", version);
                    location.reload(true);
                }
            }
        );
    },
    alertNoIndicatorChosen:function(){
        setTimeout(function(){
            swal(
                alert_manager.text[language_manager.getLanguage()].noIndicator,
                alert_manager.text[language_manager.getLanguage()].selectIndicator,
                "info"
            )
        },500);
    },
    alertError:function(error){
        let error_span = `<b style="color: red">${alert_manager.text[language_manager.getLanguage()].error}: ${error}</b>`;
        $('#loading_circle').remove();
        setTimeout(function(){
            swal({
                title:alert_manager.text[language_manager.getLanguage()].problem,
                text:`<span>${alert_manager.text[language_manager.getLanguage()].tryAgainFeedback}</span>
                      <br/>
                      <hr/>
                      ${error ? error_span: ""}`,
                html:true,
                type:"error"
            });
            progressbar.remove();
        },500);
    },
    alertNotInTimeShift:function(){
        console.log("Not in time");
        setTimeout(function () {
            swal(
                alert_manager.text[language_manager.getLanguage()].notAvailable,
                alert_manager.text[language_manager.getLanguage()].forIndicator + $('#Indikator option:selected').text() + alert_manager.text[language_manager.getLanguage()].yearSetTo + Math.max.apply(Math, indikatorauswahl.getFilteredPossibleYears()) + alert_manager.text[language_manager.getLanguage()].angepasst,
                'success'
            );
        }, 500);
    },
    alertNotinSpatialRange:function(raumglTXT,selection){
        $.when(raumgliederung.removeParameter())
            .then(progressbar.remove())
            .then(setTimeout(function () {
                swal({
                        title: alert_manager.text[language_manager.getLanguage()].noSpatial,
                        text: alert_manager.text[language_manager.getLanguage()].adjustSpatialSelection + raumglTXT + alert_manager.text[language_manager.getLanguage()].anzupassen,
                        type: 'info',
                        cancelButtonText: alert_manager.text[language_manager.getLanguage()].cancel,
                        showCancelButton: true,
                    },
                    function (isConfirm) {
                        if (isConfirm) {
                            $.when(gebietsauswahl.removeParamter())
                                .then(raeumliche_analyseebene.updateParamter(selection))
                                .then(gebietsauswahl.clear())
                                .then(raumgliederung.hide())
                                .then(indikator_json.init(selection));
                        }
                    }
                );
            }, 500));
    },
    alertNotAsRaster:function(){
        $.when(setTimeout(function(){
            swal({
                    title: alert_manager.text[language_manager.getLanguage()].noSpatial,
                    type: "warning",
                    cancelButtonText: alert_manager.text[language_manager.getLanguage()].cancel,
                    showCancelButton: false,
                }
            );
        },500));
    },
    alertServerlast:function(choice){
        setTimeout(function(){
            swal({
                    title: alert_manager.text[language_manager.getLanguage()].increasedLoad,
                    text: alert_manager.text[language_manager.getLanguage()].refineSelection,
                    type: "warning",
                    cancelButtonText: alert_manager.text[language_manager.getLanguage()].cancel,
                    showCancelButton: true,
                },
                function (isConfirm) {
                    if (isConfirm) {
                        $.when(raeumliche_analyseebene.updateParamter(choice))
                            .then($('#dropdown_datenalter').hide())
                            .then(indikator_json.init())
                            .then(right_view.close());
                    }else{
                        $('#'+raeumliche_analyseebene.getSelectionId()+"_raumgl").prop("selected",true);
                    }
                }

            )
        },500);
    },
    alertIE:function() {
        $('#Modal').remove();
        $('head').append('<style>.swal-overlay{background-color: lightgray}</style>')
        swal({
            title: '<img src="frontend/assets/icon/worldwide.png"/>',
            text: alert_manager.text[language_manager.getLanguage()].unsupportedBrowser+' <b><a href="https://www.mozilla.org/de/firefox/new/" target="_blank">' +
                  'Firefox</a></b> oder <b><a href="https://www.google.com/intl/de_ALL/chrome/" target="_blank">Chrome</a></b>',
            html:true,
            showCancelButton: false,
            showConfirmButton: false
        });
    }
};
