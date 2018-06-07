odoo.define('oechart.Graphwidget', function (require) {
    "use strict";
    
    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    
    // Global map options
    var mapOptions = {tooltip: { trigger: 'selection' }};

    /**
     * Extends web.GraphWidget with the include method.
     */
    GraphWidget.include({
        /**
         * Main method displaying the map on geo chart button click.
         */
        display_geo: function () {
            var self = this;

            self.initMap();
            google.charts.setOnLoadCallback(function () {
                self.drawRegionsMap(self.prepareDataMap());
            });
        },
        /**
         * Render the map view and load necessary packages.
         */
        initMap: function () {
            mapOptions = {tooltip: { trigger: 'selection' }};
            this.$el.empty();
            this.$el.append(QWeb.render('GeoChartView'));

            google.charts.load('current', {
                'packages':['geochart','table'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
        },
        /**
         * @returns features transformed data
         * 
         * Transform data in an understandable format for the map.
         */
        prepareDataMap: function () {

            // prepare data
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

            // Organize the data for the map
            var features = [['Country', data[0].key]]
            data[0].values.forEach(e => {
                features.push([e.x[0],e.y]);
            });

            return features;
        },
        /**
         * @argument dataStruct organized data
         * @argument options object with map parameters
         * 
         * Draw the map and the table.
         */
        drawRegionsMap: function (features) {
            var data = google.visualization.arrayToDataTable(features);

            var chart = new google.visualization.GeoChart(document.getElementById('map_div'));
            var table = new google.visualization.Table(document.getElementById('table_div'));
    
            chart.draw(data, mapOptions);
            table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
            
            google.visualization.events.addListener(table, 'select', () => {
                chart.setSelection(table.getSelection())
            });
            google.visualization.events.addListener(chart, 'select', () => {
                table.setSelection(chart.getSelection())
            });
        },
        /**
         * @param optionStruct object containing user inputs
         *  
         * Redraw the map
         */
        updateMap: function(optionStruct) {
            this.prepareOptions(optionStruct);
            this.drawRegionsMap(this.prepareDataMap());
        },
        /**
         * @param optionStruct object containing user inputs
         * 
         * Transforms user input into a map configuration
         */
        prepareOptions: (optionStruct) => {
            for(var key in optionStruct) {
                switch (key) {
                    case 'subcontinent':
                        if (optionStruct['subcontinent'] !== " ") { 
                            mapOptions['region'] = optionStruct['subcontinent'];
                        }
                        break;
                    case 'country':
                        if (optionStruct['country'] !== " ") { 
                            mapOptions['region'] = optionStruct['country'];
                        }
                        break;
                    case 'colorAxisFrom' :
                    case 'colorAxisTo' :
                        mapOptions['colors'] = [optionStruct['colorAxisFrom'],optionStruct['colorAxisTo']]
                        break;
                    default:
                        mapOptions[key] = optionStruct[key]
                        break;
                }
            }
        },
    })
});