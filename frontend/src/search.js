const search={

    text: {
        de:{noResult:"Kein Ergebnis für die Suchanfrage",
        serverError:"Es gab ein Problem mit dem Server"
        },
        en:{noResult:"The search did not produce any results",
        serverError:"There was an error on the server side"}
    },

    getDomObject:function(){
        $elem =  $('.ui.search');
        return $elem;
    },
    getResultObject:function(){
        $elem = $('.results');
        return $elem;
    },
    init:function(){
        //css settings for result
        this.getResultObject().css({'max-height':$('#toolbar').height()-50,'overflow-y':'auto', 'overflow-x':'hidden'});
        this.controller.set();
    },
    controller:{
        set:function(){
            search
                .getDomObject()
                .search({
                    type          : 'category',
                    minCharacters : 2,
                    error: {
                        noResults   : search.text[language_manager.getLanguage()].noResult,
                        serverError : search.text[language_manager.getLanguage()].serverError
                    },
                    cache: false,
                    apiSettings   : {
                        onResponse: function(Response) {
                            var
                                response = {
                                    results : {}
                                }
                            ;
                            // translate GitHub API response to work with search
                            $.each(Response.results, function(index, item) {
                                var
                                    language   = item.category || 'Unknown',
                                    maxResults = 15
                                ;
                                if(index >= maxResults) {
                                    return false;
                                }
                                // create new category
                                if(response.results[language] === undefined) {
                                    response.results[language] = {
                                        name    : language,
                                        results : []
                                    };
                                }
                                // add result to category
                                response.results[language].results.push({
                                    title       : item.titel,
                                    description : item.description,
                                    value         : item.value,
                                    category: item.category
                                });
                            });
                            return response;
                        },
                        url: url_backend,
                        method: 'POST',
                        data:{
                            values:function(){
                                let value = $('#search_input_field').val();
                                return '{"q":"'+value+'","option":"all","query":"search","language":"'+language_manager.getLanguage()+'"}';
                            }
                        },
                        cache:false
                    },
                    onSelect: function(result,response){
                            var cat = result.category;

                        if(cat === 'Indikatoren' || 'Indicators'){
                            indikatorauswahl.checkAvability(result.value,true);
                        }else if(cat ==='Orte' || 'Locations'){
                            var lat = result.value[0];
                            var lon = result.value[1];
                            var title = "<b>"+result.title+"</b></br>"+result.description;
                            MapHelper.setMarker(lon,lat,title);
                        }
                        setTimeout(function(){
                            $('#search_input_field').val('');
                            $('.ui.search').search('hide results');
                        },500);
                    }
                });
        }
    }
};
