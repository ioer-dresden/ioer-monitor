const csv_export = {
    ignoreClass: "tableexport-ignore",
    state: false,
    getButtonDomObject: function () {
        $elem = $('#csv_export');
        return $elem;
    },
    init: function () {
        this.controller.set();
    },
    controller: {
        set: function () {
            const csv_button = csv_export.getButtonDomObject();
            let csv = {
                fileExtension: ".csv",
                separator: ";",
                mimeType: "data:application/csv;charset=UTF-8"
            };
            helper.enableElement("#" + csv_button.attr("id"), csv_button.data("title")); // show .csv export button
            csv_button
                .unbind()
                .click(function () {
                    let background_default = csv_button.css("background"),
                        setLoadIcon = function () {
                            csv_button.css("background", "white");
                            csv_button.append('<i class="spinner loading icon"></i>');
                        },
                        resetLoadIcon = function () {
                            csv_button.css("background", background_default);
                            csv_button.empty();

                        };
                    $.when(setLoadIcon())
                        .then(csv_export.state = true)
                        .then(function () {
                                console.log("Starting the csv export, ");
                                TableHelper.destroyStickyTableHeader();
                                //csv_export.exportToCSV(table.getTableBodyValues());
                                Export_Helper.exportTable(table.getDOMObject().attr("id"));
                                resetLoadIcon();
                                TableHelper.setStickTableHeader();
                                csv_export.state = false;
                            }
                        );
                });


        }
    },
};