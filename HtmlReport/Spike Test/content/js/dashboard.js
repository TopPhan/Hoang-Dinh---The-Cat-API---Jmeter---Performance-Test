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

    var data = {"OkPercent": 47.65013054830287, "KoPercent": 52.34986945169713};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2050711743772242, 5, 15000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.13366336633663367, 5, 15000, "Transaction Controller - Add Favorite Image"], "isController": true}, {"data": [0.15217391304347827, 5, 15000, "Transaction Controller - Delete Favorite Image"], "isController": true}, {"data": [0.485, 5, 15000, "GET-SEARCH-IMAGE"], "isController": false}, {"data": [0.14325842696629212, 5, 15000, "GET-IMAGE-FAVOURITED_ID"], "isController": false}, {"data": [0.1478494623655914, 5, 15000, "POST-FAVOURITES-IMAGE"], "isController": false}, {"data": [0.14655172413793102, 5, 15000, "DELETE-IMAGE-FAVOURITED"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 766, 401, 52.34986945169713, 719.0953002610959, 0, 13324, 455.0, 1036.1000000000017, 1787.8499999999976, 9914.680000000004, 2.112677998637516, 3.1992614461432596, 0.6314541959481264], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller - Add Favorite Image", 202, 150, 74.25742574257426, 6347.42574257426, 0, 20708, 4020.5, 17823.700000000103, 19978.7, 20321.76, 0.557013963954027, 2.224625144423794, 0.3580192388693719], "isController": true}, {"data": ["Transaction Controller - Delete Favorite Image", 184, 134, 72.82608695652173, 7081.722826086956, 0, 20291, 4033.5, 20023.5, 20061.25, 20130.350000000002, 0.5114748265433198, 0.8186974192064356, 0.2550098994006849], "isController": true}, {"data": ["GET-SEARCH-IMAGE", 200, 6, 3.0, 863.1300000000003, 403, 2691, 572.0, 1914.9000000000003, 2208.85, 2473.83, 0.5525365571999657, 1.7859179410692136, 0.19962541474775325], "isController": false}, {"data": ["GET-IMAGE-FAVOURITED_ID", 178, 127, 71.34831460674157, 464.19662921348305, 273, 1476, 436.5, 515.1, 600.9499999999994, 1271.3900000000021, 0.49548082517042585, 0.424607755945074, 0.12387020629260648], "isController": false}, {"data": ["POST-FAVOURITES-IMAGE", 186, 131, 70.43010752688173, 447.4892473118281, 327, 1585, 422.5, 513.9000000000001, 690.4000000000002, 1224.8199999999981, 0.5144943571586634, 0.44344019694622705, 0.1592640751203253], "isController": false}, {"data": ["DELETE-IMAGE-FAVOURITED", 174, 123, 70.6896551724138, 449.873563218391, 224, 756, 441.0, 500.5, 537.5, 732.0, 0.4843531658325029, 0.39522779038920836, 0.1314943165053084], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 9,979 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["The operation lasted too long: It took 10,253 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["404/Not Found", 121, 30.174563591022444, 15.796344647519582], "isController": false}, {"data": ["The operation lasted too long: It took 9,007 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["429/Too Many Requests", 21, 5.236907730673317, 2.741514360313316], "isController": false}, {"data": ["The operation lasted too long: It took 10,838 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["The operation lasted too long: It took 11,805 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["400/Bad Request", 245, 61.09725685785536, 31.98433420365535], "isController": false}, {"data": ["400", 2, 0.49875311720698257, 0.26109660574412535], "isController": false}, {"data": ["The operation lasted too long: It took 9,883 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["The operation lasted too long: It took 10,310 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["404", 2, 0.49875311720698257, 0.26109660574412535], "isController": false}, {"data": ["The operation lasted too long: It took 10,036 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["The operation lasted too long: It took 9,008 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}, {"data": ["The operation lasted too long: It took 9,697 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.24937655860349128, 0.13054830287206268], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 766, 401, "400/Bad Request", 245, "404/Not Found", 121, "429/Too Many Requests", 21, "400", 2, "404", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Transaction Controller - Add Favorite Image", 18, 12, "400", 2, "The operation lasted too long: It took 11,805 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,979 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 10,253 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,883 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1], "isController": false}, {"data": ["Transaction Controller - Delete Favorite Image", 10, 2, "404", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET-SEARCH-IMAGE", 200, 6, "429/Too Many Requests", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET-IMAGE-FAVOURITED_ID", 178, 127, "404/Not Found", 121, "429/Too Many Requests", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["POST-FAVOURITES-IMAGE", 186, 131, "400/Bad Request", 124, "429/Too Many Requests", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE-IMAGE-FAVOURITED", 174, 123, "400/Bad Request", 121, "429/Too Many Requests", 2, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
