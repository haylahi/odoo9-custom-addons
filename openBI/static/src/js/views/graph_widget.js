odoo.define('oechart.Graphwidget', function (require) {
    "use strict";

    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    
    /**
     * Extends web.GraphWidget with the include method.
     */
    GraphWidget.include({
        /**
         * Main method displaying the map on geo chart button click.
         */
        display_geo: function () {
            this.initMap();

            var self = this;
            google.charts.setOnLoadCallback(function () {
                self.drawRegionsMap(self.prepareDataMap(), {tooltip: { trigger: 'selection' }});
            });
        },
        /**
         * Render the map view and load necessary packages.
         */
        initMap: function () {
            this.$el.empty();
            this.$el.append(QWeb.render('GeoChartView'));

            google.charts.load('current', {
                'packages':['geochart','table'],
                'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
            });
        },
        /**
         * @returns data transformed data
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
            return data;
        },
        /**
         * @argument dataStruct organized data
         * @argument options object with map parameters
         * 
         * Draw the map and the table.
         */
        drawRegionsMap: function (dataStruct, options) {
            var features = [['Country', dataStruct[0].key]]
            dataStruct[0].values.forEach(e => {
                features.push([e.x[0],e.y]);
            });
            
            var data = google.visualization.arrayToDataTable(features);

            var chart = new google.visualization.GeoChart(document.getElementById('map_div'));
            var table = new google.visualization.Table(document.getElementById('table_div'));
    
            chart.draw(data, options);
            table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
            
            google.visualization.events.addListener(table, 'select', () => {
                chart.setSelection(table.getSelection())
            });
        },
        /**
         * @param optionStruct object containing user inputs
         *  
         * Redraw the map
         */
        updateMap: function(optionStruct) {
            this.drawRegionsMap(this.prepareDataMap(),this.prepareOptions(optionStruct));
        },
        /**
         * @param optionStruct object containing user inputs
         * @returns resOptions object use to configure the drawn map
         * 
         * Transforms user input into a map configuration
         */
        prepareOptions: (optionStruct) => {
            var resOptions =  {tooltip: { trigger: 'selection' }};
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