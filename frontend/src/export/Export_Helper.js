class Export_Helper{
    static svgString2DataURL( width, height,element,text,callback) {

        var source = (new XMLSerializer()).serializeToString(d3.select(element).node());

        var doctype = '<?xml version="1.0" standalone="no"?>'
            + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

        // create a file blob of our SVG.
        var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
        var url = window.URL.createObjectURL(blob);

        var image = new Image();
        image.onload = function () {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            context.fillStyle = '#ffffff';
            if (callback) callback(canvas.toDataURL("image/png"),text)
        };
        image.src = url;
    }
    static svgString2Image( width, height, element, callback ) {

        var source = (new XMLSerializer()).serializeToString(d3.select(element).node());

        var doctype = '<?xml version="1.0" standalone="no"?>'
            + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

        // create a file blob of our SVG.
        var blob = new Blob([ doctype + source], { type: 'image/svg+xml;charset=utf-8' });
        var url = window.URL.createObjectURL(blob);

        var image = new Image();
        image.onload = function() {
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            context.clearRect ( 0, 0, width, height );
            context.drawImage(image, 0, 0, width, height);
            canvas.toBlob( function(blob) {
                var filesize = Math.round( blob.length/1024 ) + ' KB';
                if ( callback ) callback( blob, filesize );
            });


        };

        image.src = url;
    }
    static saveIMAGE(dataBlob, filesize) {
        saveAs(dataBlob, indikatorauswahl.getSelectedIndikator()+"_"+raeumliche_analyseebene.getSelectionId()+"_"+zeit_slider.getTimeSet() +'.png');
    }
    static savePDF(dataBlob, text) {
        //docu: https://parall.ax/products/jspdf/doc
        let doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        let dataURL = dataBlob;

        doc.setFontSize(20);
        doc.text(35, 25, text.header);
        doc.setFontSize(10);
        doc.text(35, 57,text.sub_header);
        //data.addImage(base64_source, image format, X, Y, width, height)
        doc.addImage(dataURL, 'PNG', 15, 40, 180, 160);
        doc.save(indikatorauswahl.getSelectedIndikator()+"_"+raeumliche_analyseebene.getSelectionId()+"_"+zeit_slider.getTimeSet() + ".pdf");
    }

    static dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    static downloadFile(text_data, filename, extension){
        try {
            console.log("trying to start download");
            let blob = new Blob(["\ufeff", text_data], {type: "text/csv"});
            //Export_Helper.downloadFile(blob,filename, extension);
            console.log("Export finished???");

            window.URL = window.URL || window.webkitURL;
            let link = window.URL.createObjectURL(blob);
            let a = document.createElement("a");
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
    }

    static exportTable(tableid){
        let filename = indikatorauswahl.getSelectedIndikator() + "_" + gebietsauswahl.getSelectionAsString() + "_" + zeit_slider.getTimeSet();
        let extension = ".csv";
        let tab = document.getElementById(tableid);//.getElementsByTagName('table'); // id of table
        if (tab == null) {
            console.log("Table is null!!");
            return false;
        }
        if (tab.rows.length == 0) {
            console.log("Table has no rows!!");
            return false;
        }
        let csv = []; // Holds all rows of data
        let rows = tab.querySelectorAll("table tr:not(.hidden_row)"); // exclude ignored rows

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
        this.downloadFile(tab_text,filename, extension);
    }
}