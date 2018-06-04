odoo.define('oechart.Graphwidget', function (require) {
    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    

    GraphWidget.include({
        display_geo: function () {
            if(this.groupbys.length === 0) {
                return this.$el.append(QWeb.render('GraphView.error', {
                    title: _t("No location groupby selected"),
                    description: _t("No geo data available for this chart. " +
                        "Try to add a groupby on a location field. "),
                }));
            } 
            this.initMap();

            var self = this;
            google.charts.setOnLoadCallback(function () {
                self.drawRegionsMap(self.prepareDataMap(),{})
            });

        },
        initMap: function () {
            this.$el.empty();
            this.$el.append(QWeb.render('GeoChartView'));

            google.charts.load('current', {
                'packages':['geochart'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
        },
        prepareDataMap: function () {
            // prepare data for bar chart
            var data, values,
            measure = this.fields[this.measure].string;

            // zero groupbys
            if (this.groupbys.length === 0) {
                data = [{
                    values: [{
                        x: measure,
                        y: this.data[0].value}],
                    key: measure
                }];
            } 
            // one groupby
            if (this.groupbys.length === 1) {
                values = this.data.map(function (datapt) {
                    return {x: datapt.labels, y: datapt.value};
                });
                data = [
                    {
                        values: values,
                        key: measure,
                    }
                ];
            }
            return data;
            
        },
        drawRegionsMap: function (dataConstr, options) {
            features = [['Country', dataConstr[0].key]]
            dataConstr[0].values.forEach(e => {
                features.push([e.x[0],e.y]);
            });
            
            var data = google.visualization.arrayToDataTable(features);

            var chart = new google.visualization.GeoChart(document.getElementById('map_div'));
    
            chart.draw(data, options);
            return chart;
        },
        updateMap: function(optionStruct) {
            this.drawRegionsMap(this.prepareDataMap(),this.prepareOptions(optionStruct));
        },
        prepareOptions: (optionStruct) => {
            var resOptions = {}
            for(var key in optionStruct) {
                switch (key) {
                    case 'colorAxisFrom' :
                    case 'colorAxisTo' :
                        resOptions['colors'] = [optionStruct['colorAxisFrom'],optionStruct['colorAxisTo']]
                        break;
                    default:
                        resOptions[key] = optionStruct[key]
                        break;
                }

            }
            return resOptions;
        },
    });
});