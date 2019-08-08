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
            console.log("starting new export. rows: " + TableHelper.countTableRows());
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

    /*
    Needed to overcome the ca 3000 row limit @ TableExport.js library.
    TODO In future should switch over fully to own .csv export, abandon TableExport.js rewrite export helper
     */
    exportToCSV: function (table) {
        let tableid = table.attr('id');
        console.log("exporting new! " + tableid);
        let filename = indikatorauswahl.getSelectedIndikator() + "_" + gebietsauswahl.getSelectionAsString() + "_" + zeit_slider.getTimeSet();
        console.log("got filename: " + filename);
        let extension = ".csv";

        tab = document.getElementById(tableid);//.getElementsByTagName('table'); // id of table
        console.log("Got the table element by id");
        if (tab == null) {
            console.log("Table is null!!");
            return false;
        }
        if (tab.rows.length == 0) {
            console.log("Table has no rows!!")
            return false;
        }
        console.log("done with zero null checks");
        let csv = []; // Holds all rows of data
        let rows = document.querySelectorAll("table tr:not(.hidden_row)"); // exclude ignored rows

        for (let i = 0; i < rows.length; i++) { // Format Table Text here!
            let row = [], cols = rows[i].querySelectorAll(" th:not(.tableexport-ignore), td:not(.tableexport-ignore)"); // exclude ignored columns
            for (let j = 0; j < cols.length; j++)
                row.push(cols[j].innerText);

            csv.push(row.join(";"));
        }

        let tab_text = csv.join("\n"); // joins array into text, each row in a new line
        tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
        tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
        tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomoves input params

        try {
            console.log("trying to start download");
            let blob = new Blob(["\ufeff", tab_text], {type: "text/csv"});
            //Export_Helper.downloadFile(blob,filename, extension);
            console.log("Export finished???");

            window.URL = window.URL || window.webkitURL;
            link = window.URL.createObjectURL(blob);
            a = document.createElement("a");
            if (document.getElementById("caption") != null) {
                a.download = document.getElementById("caption").innerText;
            } else {
                a.download = filename + extension;
            }

            a.href = link;

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

        } catch (e) {
        }


        return false;
    }
};