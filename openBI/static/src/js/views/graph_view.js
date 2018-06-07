odoo.define('oechart.GraphView',function (require) {
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
            'change .panel input': 'build_options',
            'change .panel select': function () {
                this.select_set_state();
                this.build_options();
            },
            /**
             * Get the displayed map and creates a new page to print.
             */
            'click #printMap': () => {
                var mapWindow = window.open('', 'PRINT', 'height=400,width=600');
                mapWindow.document.write(document.getElementById('map_div').innerHTML);
                mapWindow.document.close();
                mapWindow.focus();
                mapWindow.print();
                mapWindow.close();
            },
        },
        /**
         * Creates an option data structure to update the map based on user inputs.
         */
        build_options: function () {
            var optionStruct = {};
            _.each($(".panel .list-group select"), e => {
                optionStruct[$(e).attr("name")] = $(e).val();
            });
            _.each($(".panel .list-group input"), e => {
                optionStruct[$(e).attr("name")] = $(e).val();
            });
            this.widget.updateMap(optionStruct);
        },
        select_set_state: () => {
            // Show subcontinents if 'All' isn't selected
            if($('.select-continents').val() !== "world") {

                // Set selected subcontinent to default if it is from an other continent
                if($('.select-subcontinents').find(':selected').data("tag") != $('.select-continents').val()) {
                    $('.select-subcontinents').val(" ");
                }

                // Show sub-continents select and options
                $('.select-subcontinents').parent().removeClass("hidden");
                $('.select-subcontinents').parent().show();
                $('.select-subcontinents option').show();
                
                //Hide all the subcontinents not from the selected continent
                $('.select-subcontinents option')
                    .filter(function () { return $(this).data("tag") != $('.select-continents').val() && $(this).val() != " " })
                    .hide();
            } else {
                $('.select-subcontinents').val(" ");
                $('.select-subcontinents').parent().addClass("hidden");
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


       