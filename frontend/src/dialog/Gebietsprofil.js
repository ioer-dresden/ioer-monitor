class Gebietsprofil{
    static open(ags,gen){
        $.ajax({
            async:true,
            url:urlparamter.getURLMonitor()+"backend/dialog/gebietsprofil.php",
            type: "GET",
            dataType: "html",
            data: {
                'ags': ags,
                'name': gen,
                'indikator':indikatorauswahl.getSelectedIndikator(),
                'jahr':zeit_slider.getTimeSet()
            },
            success: function (data) {
                console.log();
                $('#gebietsprofil_content').html(data);
                let html = he.encode(`
                    <h4 id="${this.endpoint_id}" class="dialog jq_dialog">
                    ${data}`);
                //settings for the manager
                let instructions = {
                    endpoint:`${this.endpoint_id}`,
                    html:html,
                    title:"Indikatorwertübersicht",
                    width: main_view.getWidth()*0.8
                };
                dialog_manager.setInstruction(instructions);
                dialog_manager.create();
                this.controller.set();
            }
        });
    }
}
