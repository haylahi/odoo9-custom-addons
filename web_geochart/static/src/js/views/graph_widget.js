odoo.define('web_geochart.Graphwidget', function (require) {
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

        this.$el.empty();
        this.$el.append(QWeb.render('GeoChartView'));
        this.sort_map_options();

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
      
      // more than one groupby
      if (this.groupbys.length > 1) {

        // We want to map 2 columns of data if the first groupby is not a number, else 3 
        if(isNaN(this.data[0].labels[0])) {
          // We reduce the values to the first groupby
          data = [
            {
              values: this.data.reduce((acc, cur) => {
                if (acc.map(e => e.x).includes(cur.labels[0])) {
                  acc.filter(e => e.x == cur.labels[0]).map(e => e.y += cur.value)
                } else {
                  acc.push({ x:cur.labels[0], y: cur.value })
                }
                return acc;
              }, []),
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
      
      // If there is an array at first position, then we have to map 3 columns of data per row (else 2) 
      data[0].values.forEach(e => {
        e.x.constructor === Array ? features.push([e.x[0],e.x[1],e.y]): features.push([e.x,e.y]);
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
      let data = google.visualization.arrayToDataTable(features);

      let map = new google.visualization.GeoChart(document.getElementById('map_div'));
      let table = new google.visualization.Table(document.getElementById('table_div'));

      this.addMapEvents(map, table);

      map.draw(data, mapOptions);
      table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});

      
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
    /**
     * @param map object 
     * @param table object
     * 
     * Add Listeners on select event to trigger the tooltip and on error event to delete base error message to display bootstrap's one
     */
    addMapEvents: (map, table) => {
      google.visualization.events.addListener(table, 'select', () => {
        map.setSelection(table.getSelection())
      });
      google.visualization.events.addListener(table, 'error', function (err) {
        google.visualization.errors.removeAll(document.getElementById("table_div"))
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
      google.visualization.events.addListener(map, 'select', () => {
        table.setSelection(map.getSelection())
      });
      google.visualization.events.addListener(map, 'error', function (err) {
        google.visualization.errors.removeAll(document.getElementById("map_div"))
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
    },
    /**
     * Sort the continents, subcontinents and countries on page load.
     */
    sort_map_options: () => {
      let sorted;
      $(".mapView .select-sortable")
        .map(function () { 
          sorted = $(this)
                      .children()
                      .sort(function(a,b) {
                        if (a.text > b.text) return 1;
                        else if (a.text < b.text) return -1;
                        else return 0
                      });
          $(this)
            .empty()
            .append(sorted);
        });
      $(".mapView .select-continents").val("world")
    },
  })
});