odoo.define('oechart.Graphwidget', function (require) {
    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    

    GraphWidget.include({
        display_geo: function () {
            this.$el.empty();
            this.$el.append(QWeb.render('GeoChartView'));

            google.charts.load('current', {
                'packages':['geochart'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
            google.charts.setOnLoadCallback(drawRegionsMap);
    
            function drawRegionsMap() {
                var data = google.visualization.arrayToDataTable([
                    ['Country', 'Popularity'],
                    ['Germany', 200],
                    ['United States', 300],
                    ['Brazil', 400],
                    ['Canada', 500],
                    ['France', 600],
                    ['RU', 700]
                ]);
    
                var options = {};

                var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
        
                chart.draw(data, options);
                return chart;
            }
        }
    });
});