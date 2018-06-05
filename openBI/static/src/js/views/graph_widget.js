odoo.define('oechart.Graphwidget', function (require) {
    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    

    GraphWidget.include({
        display_geo: function () {
            this.initMap();

            var self = this;
            google.charts.setOnLoadCallback(function () {
                self.drawRegionsMap(self.prepareDataMap(),{});
                //self.buildDataTable();
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
            
            if (this.groupbys.length > 1) {
                var xlabels = [],
                    series = [],
                    label, serie, value;
                values = {};
                for (var i = 0; i < this.data.length; i++) {
                    label = this.data[i].labels[0];
                    serie = this.data[i].labels[1];
                    value = this.data[i].value;
                    if ((!xlabels.length) || (xlabels[xlabels.length-1] !== label)) {
                        xlabels.push(label);
                    }
                    series.push(this.data[i].labels[1]);
                    if (!(serie in values)) {values[serie] = {};}
                    values[serie][label] = this.data[i].value;
                }
                series = _.uniq(series);
                data = [];
                var current_serie, j;
                for (i = 0; i < series.length; i++) {
                    current_serie = {values: [], key: series[i]};
                    for (j = 0; j < xlabels.length; j++) {
                        current_serie.values.push({
                            x: xlabels[j],
                            y: values[series[i]][xlabels[j]] || 0,
                        });
                    }
                    data.push(current_serie);
                }
            }
            return data;
            
        },
        drawRegionsMap: function (dataStruct, options) {
            features = [['Country', dataStruct[0].key]]
            dataStruct[0].values.forEach(e => {
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