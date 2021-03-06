odoo.define('web_geochart.GraphView',function (require) {
  "use strict";

  var core = require('web.core');
  var GraphView = require('web.GraphView')

  var _t = core._t;
  var QWeb = core.qweb;

  /**
   * Extend the web.GraphView widget with the include method.
   */
  GraphView.include({
    events: {
      'change .mapView .panel input': 'build_options',
      'change .mapView .panel select': function () {
        this.select_set_state();
        this.build_options();
      },
      /**
       * Get the displayed map and creates a new page with the image.
       */
      'click .mapView #getMapImage': function () {
        let mapWindow = window.open('', '_blank');
        mapWindow.document.write(document.getElementById('mapImage').innerHTML);
        mapWindow.document.close();
        mapWindow.focus();
      },
    },
    /**
     * Creates an option data structure to update the map based on user inputs.
     */
    build_options: function () {
      let optionStruct = {};
      _.each($(".panel .list-group select"), e => {
        optionStruct[$(e).attr("name")] = $(e).val();
      });
      _.each($(".panel .list-group input"), e => {
        optionStruct[$(e).attr("name")] = $(e).val();
      });
      this.widget.updateMap(optionStruct);
    },
    /**
     * Manages 'Display settings' select input states at each value change
     */
    select_set_state: () => {
      // Show subcontinents if 'World' isn't selected
      if($('.select-continents').val() !== "world") {

        // Set selected subcontinent to default if it is from an other continent
        if($('.select-subcontinents').find(':selected').data("tag") != $('.select-continents').val()) {
          $('.select-subcontinents').val(" ");
        }

        // Set selected country to default if it is from an other subcontinent or continent
        if($('.select-countries').find(':selected').data("ctag") != $('.select-continents').val() || ($('.select-countries').find(':selected').data("tag") != $('.select-subcontinents').val() && $('.select-subcontinents').val() != " ")) {
          $('.select-countries').val(" ");
        } 

        // Show sub-continents select and options
        $('.select-subcontinents').parent().removeClass("hidden");
        $('.select-subcontinents').parent().show();
        $('.select-subcontinents option').show();
        
        // Hide all the subcontinents not from the selected continent
        $('.select-subcontinents option')
          .filter(function () { return $(this).data("tag") != $('.select-continents').val() && $(this).val() != " " })
          .hide();
        
        // Show countries select and options
        $('.select-countries').parent().removeClass("hidden");
        $('.select-countries').parent().show();
        $('.select-countries option').show();

        // Hide all the countries not from the selected subcontinent or continent
        if ($('.select-subcontinents').val() != " ") {
          $('.select-countries option')
            .filter(function () { return $(this).data("tag") != $('.select-subcontinents').val() && $(this).val() != " " })
            .hide();
        } else {
          $('.select-countries option')
            .filter(function () { return $(this).data("ctag") != $('.select-continents').val() && $(this).val() != " " })
            .hide();
        }
      } else {
          // Hide subcontinents and country select if 'World' is chosen
          $('.select-subcontinents').val(" ");
          $('.select-subcontinents').parent().addClass("hidden");
          $('.select-countries').val(" ");
          $('.select-countries').parent().addClass("hidden");
      }
    },
    /**
     * @param $node
     * 
     * Override web.GraphView.render_buttons method with new buttons rendering 
     * (the geo chart button is rendered in addition to existing ones)
     */
    render_buttons: function ($node) {
      if ($node) {
        var context = {measures: _.pairs(_.omit(this.measures, '__count__'))};
        this.$buttons = $(QWeb.render('newGraphView.buttons', context));
        this.$measure_list = this.$buttons.find('.oe-measure-list');
        this.update_measure();
        this.$buttons.find('button').tooltip();
        this.$buttons.click(this.on_button_click.bind(this));

        this.$buttons.appendTo($node);
      }
    },
    /**
     * @param event object containing the event target
     * 
     * Override web.GraphView.on_button_click method with new events binding
     * (bind the display_geo method in graph_widget.js to the geo chart button)
     */
    on_button_click: function (event) {
      var $target = $(event.target);
      if ($target.hasClass('oe-bar-mode')) {this.widget.set_mode('bar');}
      if ($target.hasClass('oe-line-mode')) {this.widget.set_mode('line');}
      if ($target.hasClass('oe-pie-mode')) {this.widget.set_mode('pie');}
      if ($target.hasClass('oe-geo-mode')) {this.widget.set_mode('geo');}
      if ($target.parents('.oe-measure-list').length) {
        var parent = $target.parent(),
          field = parent.data('field');
          
        this.active_measure = field;
        parent.toggleClass('selected');
        event.stopPropagation();
        this.update_measure();
        this.widget.set_measure(this.active_measure);
      }
    }
  })
});


       