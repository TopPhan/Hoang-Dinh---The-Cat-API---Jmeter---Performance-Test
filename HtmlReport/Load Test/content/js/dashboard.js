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

    var data = {"OkPercent": 48.12878370941112, "KoPercent": 51.87121629058888};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16215718755751887, 5, 15000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.00819672131147541, 5, 15000, "Transaction Controller - Add Favorite Image"], "isController": true}, {"data": [0.0022123893805309734, 5, 15000, "Transaction Controller - Delete Favorite Image"], "isController": true}, {"data": [0.493956043956044, 5, 15000, "GET-SEARCH-IMAGE"], "isController": false}, {"data": [0.15559246954595793, 5, 15000, "GET-IMAGE-FAVOURITED_ID"], "isController": false}, {"data": [0.1574585635359116, 5, 15000, "POST-FAVOURITES-IMAGE"], "isController": false}, {"data": [0.15513392857142858, 5, 15000, "DELETE-IMAGE-FAVOURITED"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3634, 1885, 51.87121629058888, 567.1788662630709, 0, 19512, 440.0, 722.5, 1181.25, 2360.0500000000015, 2.018476222638927, 2.9485725279498416, 0.6012269088875164], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Transaction Controller - Add Favorite Image", 915, 905, 98.90710382513662, 19476.479781420752, 0, 21286, 19961.0, 20097.0, 20148.2, 20427.52, 0.5081932978468156, 2.091887761414077, 0.3380730747249647], "isController": true}, {"data": ["Transaction Controller - Delete Favorite Image", 904, 901, 99.66814159292035, 19848.335176991164, 0, 22078, 20027.0, 20122.0, 20222.25, 20815.100000000006, 0.5027126463372046, 0.8460945094214134, 0.2608099901904302], "isController": true}, {"data": ["GET-SEARCH-IMAGE", 910, 11, 1.2087912087912087, 730.4703296703285, 228, 4123, 479.5, 1544.6999999999998, 2070.2999999999993, 2591.1399999999994, 0.505452218657519, 1.655573528057875, 0.18256955400923588], "isController": false}, {"data": ["GET-IMAGE-FAVOURITED_ID", 903, 622, 68.88150609080841, 470.8903654485049, 334, 2506, 439.0, 540.0, 667.8, 1147.6400000000021, 0.5027013937020367, 0.4367056348971076, 0.12567534842550918], "isController": false}, {"data": ["POST-FAVOURITES-IMAGE", 905, 620, 68.50828729281768, 436.62651933701665, 222, 1829, 417.0, 517.0, 603.4999999999997, 891.979999999999, 0.5030874560562835, 0.436821079482537, 0.1556551677018409], "isController": false}, {"data": ["DELETE-IMAGE-FAVOURITED", 896, 618, 68.97321428571429, 471.318080357143, 234, 2541, 441.0, 533.3000000000001, 649.4499999999999, 1249.6299999999994, 0.49923721456836595, 0.4106628524957403, 0.13553510317383372], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 10,069 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["The operation lasted too long: It took 9,987 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["404/Not Found", 613, 32.51989389920424, 16.86846450192625], "isController": false}, {"data": ["The operation lasted too long: It took 10,031 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["The operation lasted too long: It took 10,110 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["The operation lasted too long: It took 9,009 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["429/Too Many Requests", 39, 2.0689655172413794, 1.0731975784259769], "isController": false}, {"data": ["The operation lasted too long: It took 10,000 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["The operation lasted too long: It took 15,006 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["The operation lasted too long: It took 9,945 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}, {"data": ["400/Bad Request", 1219, 64.6684350132626, 33.54430379746835], "isController": false}, {"data": ["404", 5, 0.26525198938992045, 0.1375894331315355], "isController": false}, {"data": ["The operation lasted too long: It took 10,052 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, 0.05305039787798409, 0.0275178866263071], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3634, 1885, "400/Bad Request", 1219, "404/Not Found", 613, "429/Too Many Requests", 39, "404", 5, "The operation lasted too long: It took 10,069 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Transaction Controller - Add Favorite Image", 11, 6, "The operation lasted too long: It took 9,945 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 10,069 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,987 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 9,009 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 10,000 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1], "isController": false}, {"data": ["Transaction Controller - Delete Favorite Image", 9, 8, "404", 5, "The operation lasted too long: It took 10,052 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 10,031 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "The operation lasted too long: It took 10,110 milliseconds, but should not have lasted longer than 6,000 milliseconds.", 1, "", ""], "isController": false}, {"data": ["GET-SEARCH-IMAGE", 910, 11, "429/Too Many Requests", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET-IMAGE-FAVOURITED_ID", 903, 622, "404/Not Found", 613, "429/Too Many Requests", 9, "", "", "", "", "", ""], "isController": false}, {"data": ["POST-FAVOURITES-IMAGE", 905, 620, "400/Bad Request", 611, "429/Too Many Requests", 9, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE-IMAGE-FAVOURITED", 896, 618, "400/Bad Request", 608, "429/Too Many Requests", 10, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
