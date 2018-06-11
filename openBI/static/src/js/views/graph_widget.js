odoo.define('oechart.Graphwidget', function (require) {
  "use strict";
  
  var core = require('web.core');
  var GraphWidget = require('web.GraphWidget');
  
  var _t = core._t;
  var QWeb = core.qweb;
  
  // Global map options
  let mapOptions = {tooltip: { trigger: 'selection' }};

  /**
   * Extends web.GraphWidget with the include method.
   */
  GraphWidget.include({
    /**
     * Main method displaying the map on geo chart button click.
     */
    display_geo: function () {
        let self = this;

        self.initMap();
        google.charts.setOnLoadCallback(() => { self.drawRegionsMap(self.prepareDataMap()) });
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
        $('#error-div').hide();
    },
    /**
     * @returns features transformed data
     * 
     * Transform data in an understandable format for the map.
     */
    prepareDataMap: function () {

      // prepare data
      let data, values, features,
      measure = this.fields[this.measure].string;
      features = [];

      // zero groupbys
      if (this.groupbys.length === 0) {
        data = [{
          values: [{
            x: measure,
            y: this.data[0].value}],
          key: measure
        }];
        features = [[this.groupbys[0], data[0].key]]
      } 

      // one groupby
      if (this.groupbys.length === 1) {
        values = this.data.map(function (datapt) {
          return {x: datapt.labels[0], y: datapt.value};
        });
        data = [
          {
            values: values,
            key: measure,
          }
        ];
        features = [[this.groupbys[0], data[0].key]]
      }
      
      if (this.groupbys.length > 1) {
        if(isNaN(this.data[0].labels[0])) {
          data = [
            {
              values: this.data.map(d => { return { x:d.labels[0], y: d.value } }),
              key: measure,
            }
          ]
          features = [[this.groupbys[0], data[0].key]]
        } else {
          data = [
            {
              values: this.data.map(d => { return { x:[d.labels[0],d.labels[1]], y: d.value } }),
              key: measure,
            }
          ]
          features = [[this.groupbys[0],this.groupbys[1], data[0].key]]
        }
      }
      
      // Organize the data for the map
      console.log(data);
      data[0].values.forEach(e => {
        e.x.constructor === Array ? features.push([e.x[0],e.x[1],e.y]): features.push([e.x,e.y]);
      });
      console.log(features)


      return features;
    },
    /**
     * @argument dataStruct organized data
     * @argument options object with map parameters
     * 
     * Draw the map and the table.
     */
    drawRegionsMap: function (features) {
      let data = google.visualization.arrayToDataTable(features);

      let chart = new google.visualization.GeoChart(document.getElementById('map_div'));
      let table = new google.visualization.Table(document.getElementById('table_div'));

      chart.draw(data, mapOptions);
      table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});

      this.addMapEvents(chart, table);
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
      for(let key in optionStruct) {
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
    addMapEvents: (chart, table) => {
      google.visualization.events.addListener(table, 'select', () => {
        chart.setSelection(table.getSelection())
      });
      google.visualization.events.addListener(chart, 'select', () => {
        table.setSelection(chart.getSelection())
      });
      google.visualization.events.addListener(chart, 'error', function (err) {
        jQuery('<a/>', {
          href: '#',
          class: 'close',
          text: 'x',
          'data-dismiss': 'alert',
        }).appendTo(
          jQuery('<div/>', {
            id: 'error_msg',
            class: 'alert alert-danger alert-dismissible fade in',
            text: err.message
          }).appendTo('#error_div')
        );
      });
    }
  })
});