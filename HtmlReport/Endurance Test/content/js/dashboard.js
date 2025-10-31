/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 48.19201995012469, "KoPercent": 51.80798004987531};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16110546261207134, 5, 15000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0023506637168141595, 5, 15000, "Transaction Controller - Add Favorite Image"], "isController": true}, {"data": [0.0011092623405435386, 5, 15000, "Transaction Controller - Delete Favorite Image"], "isController": true}, {"data": [0.49625935162094764, 5, 15000, "GET-SEARCH-IMAGE"], "isController": false}, {"data": [0.15487094088259784, 5, 15000, "GET-IMAGE-FAVOURITED_ID"], "isController": false}, {"data": [0.15650124757416134, 5, 15000, "POST-FAVOURITES-IMAGE"], "isController": false}, {"data": [0.1556852932999722, 5, 15000, "DELETE-IMAGE-FAVOURITED"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14436, 7479, 51.80798004987531, 543.7331670822928, 0, 17057, 446.0, 788.0, 1159.1499999999996, 1888.0, 2.0049523823809183, 2.9327059558724367, 0.5971577196308948], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller - Add Favorite Image", 3616, 3606, 99.72345132743362, 19844.8219026549, 0, 22198, 19966.0, 20132.3, 20301.6, 20990.98, 0.5022052030458968, 2.0846993171342527, 0.3360264813595206], "isController": true}, {"data": ["Transaction Controller - Delete Favorite Image", 3606, 3601, 99.86134220743206, 19968.548530227486, 0, 25890, 20027.0, 20166.3, 20337.199999999997, 21045.86, 0.5009507088674805, 0.846029663912225, 0.2607218958803264], "isController": true}, {"data": ["GET-SEARCH-IMAGE", 3609, 27, 0.7481296758104738, 684.4242172346912, 215, 4208, 495.0, 1358.0, 1710.0, 2352.6000000000013, 0.5013426787646439, 1.6502829648525998, 0.1810733768544574], "isController": false}, {"data": ["GET-IMAGE-FAVOURITED_ID", 3603, 2487, 69.02581182348044, 492.06661115736915, 199, 2786, 442.0, 585.0, 787.0, 1452.92, 0.5008433573825256, 0.43492253178784535, 0.12517608751678166], "isController": false}, {"data": ["POST-FAVOURITES-IMAGE", 3607, 2478, 68.69975048516773, 471.4053229830891, 224, 2642, 426.0, 583.2000000000003, 774.1999999999998, 1455.5200000000004, 0.5010319981231094, 0.43484395286708516, 0.1550164598196507], "isController": false}, {"data": ["DELETE-IMAGE-FAVOURITED", 3597, 2477, 68.86294134000556, 498.1898804559363, 219, 6502, 449.0, 617.0, 795.0, 1494.06, 0.4999031324761368, 0.4115427055227969, 0.13567815918072032], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 10,007 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.013370771493515177, 0.006927126627874758], "isController": false}, {"data": ["400/Bad Request", 4889, 65.3697018317957, 33.86672208367969], "isController": false}, {"data": ["The operation lasted too long: It took 17,057 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.013370771493515177, 0.006927126627874758], "isController": false}, {"data": ["The operation lasted too long: It took 9,947 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.013370771493515177, 0.006927126627874758], "isController": false}, {"data": ["The operation lasted too long: It took 9,955 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.013370771493515177, 0.006927126627874758], "isController": false}, {"data": ["404", 4, 0.05348308597406071, 0.02770850651149903], "isController": false}, {"data": ["The operation lasted too long: It took 9,975 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.013370771493515177, 0.006927126627874758], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.thecatapi.com:443 failed to respond", 2, 0.026741542987030353, 0.013854253255749516], "isController": false}, {"data": ["404/Not Found", 2457, 32.851985559566785, 17.01995012468828], "isController": false}, {"data": ["The operation lasted too long: It took 9,904 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.013370771493515177, 0.006927126627874758], "isController": false}, {"data": ["429/Too Many Requests", 121, 1.6178633507153364, 0.8381823219728457], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14436, 7479, "400/Bad Request", 4889, "404/Not Found", 2457, "429/Too Many Requests", 121, "404", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.thecatapi.com:443 failed to respond", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Transaction Controller - Add Favorite Image", 10, 3, "The operation lasted too long: It took 17,057 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,947 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,955 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": ["Transaction Controller - Delete Favorite Image", 10, 7, "404", 4, "The operation lasted too long: It took 10,007 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,975 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,904 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "", ""], "isController": false}, {"data": ["GET-SEARCH-IMAGE", 3609, 27, "429/Too Many Requests", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET-IMAGE-FAVOURITED_ID", 3603, 2487, "404/Not Found", 2457, "429/Too Many Requests", 29, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.thecatapi.com:443 failed to respond", 1, "", "", "", ""], "isController": false}, {"data": ["POST-FAVOURITES-IMAGE", 3607, 2478, "400/Bad Request", 2438, "429/Too Many Requests", 40, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE-IMAGE-FAVOURITED", 3597, 2477, "400/Bad Request", 2451, "429/Too Many Requests", 25, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.thecatapi.com:443 failed to respond", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
