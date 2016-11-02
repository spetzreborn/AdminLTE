$(document).ready(function() {
    updateSummaryData();

    // Create charts
    var chartData = {
        labels: [],
        datasets: [
            {
                label: "All Queries",
                data: [],
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(0, 166, 90,.8)",
                pointColor: "rgba(0, 166, 90,.8)"
            },
            {
                label: "Ad Queries",
                data: [],
                fillColor: "rgba(0,192,239,0.5)",
                strokeColor: "rgba(0,192,239,1)",
                pointColor: "rgba(0,192,239,1)"
            }
        ]
    };

    var animate = false;
    timeLineChart = new Chart($("#queryOverTimeChart"), {
        type: "line",
        data: chartData,
        pointDot : false,
        animation : animate
    });

    queryTypeChart = new Chart($("#queryTypeChart"), {
        type: "doughnut",
        data: chartData,
        animation : animate
    });

    forwardDestinationChart = new Chart($("#forwardDestinationChart"), {
        type: "doughnut",
        data: chartData,
        animation : animate
    });

    updateQueriesOverTime();

    updateQueryTypes();

    updateTopClientsChart();

    updateForwardDestinations();

    updateTopLists();
});

function updateSummaryData(runOnce) {
    $.getJSON("api.php?summary", function LoadSummaryData(data) {
        if ($("h3#ads_blocked_today").text() != data.ads_blocked_today) {
            $("h3#ads_blocked_today").addClass("glow");
        }
        if ($("h3#dns_queries_today").text() != data.dns_queries_today) {
            $("h3#dns_queries_today").addClass("glow");
        }
        if ($("h3#ads_percentage_today").text() != data.ads_percentage_today) {
            $("h3#ads_percentage_today").addClass("glow");
        }

        window.setTimeout(function(){
            $("h3#ads_blocked_today").text(data.ads_blocked_today);
            $("h3#dns_queries_today").text(data.dns_queries_today);
            $("h3#domains_being_blocked").text(data.domains_being_blocked);
            $("h3#ads_percentage_today").text(data.ads_percentage_today + "%");
            $("h3.statistic.glow").removeClass("glow");
        }, 500);
    }).done(function() {
        setTimeout(updateSummaryData, 10000);
    }).fail(function() {
        setTimeout(updateSummaryData, (1000 * 60 * 5));
    });;
}

function updateQueriesOverTime() {
    $.getJSON("api.php?overTimeData", function(data) {
        for (hour in data.ads_over_time) {
            timeLineChart.data.datasets[0].data.push(data.domains_over_time[hour]);
            timeLineChart.data.datasets[1].data.push(data.ads_over_time[hour]);
            timeLineChart.data.labels.push(hour + ":00");
        }
        timeLineChart.update();
        $('#queries-over-time .overlay').remove();
        //$('#queries-over-time').append(timeLineChart.generateLegend());
    });
}

function updateTopClientsChart() {
    $.getJSON("api.php?summaryRaw&getQuerySources", function(data) {
        var clienttable =  $('#client-frequency').find('tbody:last');
        for (domain in data.top_sources) {
            clienttable.append('<tr> <td>' + domain +
                '</td> <td>' + data.top_sources[domain] + '</td> <td> <div class="progress progress-sm"> <div class="progress-bar progress-bar-blue" style="width: ' +
                data.top_sources[domain] / data.dns_queries_today * 100 + '%"></div> </div> </td> </tr> ');
        }

        $('#client-frequency .overlay').remove();
    });
}

function updateQueryTypes() {
    $.getJSON("api.php?getQueryTypes", function(data) {
        var colors = [];
        $.each($.AdminLTE.options.colors, function(key, value) { colors.push(value); });
        $.each(data, function(key , value) {
            queryTypeChart.addData({
                value: value,
                color: colors.shift(),
                label: key.substr(6,key.length - 7)
            });
        });
        $('#query-types .overlay').remove();
        //$('#query-types').append(queryTypeChart.generateLegend());
    });
}

function updateForwardDestinations() {
    $.getJSON("api.php?getForwardDestinations", function(data) {
        var colors = [];
        $.each($.AdminLTE.options.colors, function(key, value) { colors.push(value); });
        $.each(data, function(key , value) {
            forwardDestinationChart.addData({
                value: value,
                color: colors.shift(),
                label: key
            });
        });
        $('#forward-destinations .overlay').remove();
        //$('#forward-destinations').append(forwardDestinationChart.generateLegend());
    });
}

function updateTopLists() {
    $.getJSON("api.php?summaryRaw&topItems", function(data) {
        var domaintable = $('#domain-frequency').find('tbody:last');
        var adtable = $('#ad-frequency').find('tbody:last');

        for (domain in data.top_queries) {
            domaintable.append('<tr> <td>' + domain +
                '</td> <td>' + data.top_queries[domain] + '</td> <td> <div class="progress progress-sm"> <div class="progress-bar progress-bar-green" style="width: ' +
                data.top_queries[domain] / data.dns_queries_today * 100 + '%"></div> </div> </td> </tr> ');
        }
        for (domain in data.top_ads) {
            adtable.append('<tr> <td>' + domain +
                '</td> <td>' + data.top_ads[domain] + '</td> <td> <div class="progress progress-sm"> <div class="progress-bar progress-bar-yellow" style="width: ' +
                data.top_ads[domain] / data.ads_blocked_today * 100 + '%"></div> </div> </td> </tr> ');
        }

        $('#domain-frequency .overlay').remove();
        $('#ad-frequency .overlay').remove();
    });
}
