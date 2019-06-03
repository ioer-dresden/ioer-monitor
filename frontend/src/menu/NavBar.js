class NavBar{
    constructor(){
        this.html =  `<div class="navbar-default navbar">
          <div class="navbar-primary">
              <nav class="navbar navbar-static-top" role="navigation">
                  <div class="navbar-header w-100">
                      <a class="navbar-brand" href="https://www.ioer.de" target="_blank"/>
                      <a class="float-left navbar-header-text mobile_hidden" href="http://www.ioer-monitor.de"><p id="nav-title">Monitor der Siedlungs- und Freiraumentwicklung (IÖR-Monitor)</p></a>
                      <div class="navbar-text float-right language" id="language" data-value="de"><i class="gb uk flag"></i></div>
                       <div id="nav_click" class="h-100">
                           <div class="navbar-text float-right help" id="help">
                                <p>Hilfe</p>
                                <div id="help-content" class="help-content">
                                    <div>
                                        <div class="cursor"><i class="road icon"></i><a id="webtour" title="unternehmen Sie eine Tour durch die Funktionalitäten des IÖR-Monitors">Monitor Tour</a></div>
                                        <div class="cursor"><i class="envelope icon"></i><a id="feedback_a" onclick="feedback.open();">Feedback</a></div>
                                    </div>
                                </div>
                            </div>
                      </div>
                  </div>
              </nav>
          </div>
      </div>`;
        console.log("Setting Navbar in Navbar.js");
        NavBar.getContainer().append(this.html);
        NavBarController.set();
        language_manager.setLanguage($("#language").data("value"));
        console.log("NavBarController value::: "+ $("#language").data("value"));
    }
    static getContainer() {
        $elem = $('#navbar');
        return $elem;
    }
}

class NavBarController{
    static set(){
        const help_content = $("#help-content");
        $('#language')
            .unbind()
            .click(function(){
                language_manager.setLanguage($(this).data("value"));
                console.log("Element ID: "+ $(this).get(0).id);
                console.log("language value of NavBar: "+ $(this).data("value"));
                language_manager.setElements();
                if($(this).data("value")==="en"){
                    $(this)
                        .data('value',"de")
                        .find('i')
                        .removeClass("gb uk")
                        .addClass("de");
                    NavBar.getContainer().find('#nav-title').text('Monitor of Settlement and Open Space Development');
                }else{
                    $(this)
                        .data('value',"en")
                        .find("i")
                        .removeClass("de")
                        .addClass("gb uk");
                    NavBar.getContainer().find('#nav-title').text('Monitor der Siedlungs- und Freiraumentwicklung (IÖR-Monitor)');
                }
            });
        $("#nav_click")
        //for mobile devices, without hover
            .click(function(){
                if(help_content.is(":visible")){
                    help_content.hide();
                }else{
                    help_content.show();
                }
            });
    }
}