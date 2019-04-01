//This file stores all the jquery Dialogs inside the Page
//indikatorenvergleich
//
function openGebietsprofil(ags,name){
    let $dialogContainer = $('#gebietsprofil_content'),
        $detachedChildren = $dialogContainer.children().detach();

    $( "#gebietsprofil_content").dialog({
        title: 'Indikatorwertübersicht',
        width: "80%",
        height: calculateHeight(),
        open: function(ev, ui){
            $('.ui-dialog-titlebar-close').attr('id','close_dialog');
            $detachedChildren.appendTo($dialogContainer);
            $('.ui-widget-overlay').addClass('custom-overlay');
            $.ajax({
                async:true,
                url: "backend/dialog/gebietsprofil.php",
                type: "GET",
                dataType: "html",
                data: {
                    'ags': ags,
                    'name': name,
                    'indikator':indikatorauswahl.getSelectedIndikator(),
                    'jahr':zeit_slider.getTimeSet()
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                },
                success: function (data) {
                    console.log();
                    $('#gebietsprofil_content').html(data);
                }
            });
        },
        close: function(){
            $('.ui-dialog-titlebar-close').removeAttr('id');
        }
    });
}
function calculateHeight(){
    const height = main_view.getHeight();
    if($('.right_content').is(':visible') || height >= 800){
        return height-210;
    }else{
        return height-100;
    }
}
