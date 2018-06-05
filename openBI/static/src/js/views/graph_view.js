odoo.define('oechart.GraphView',function (require) {
    var core = require('web.core');
    var GraphView = require('web.GraphView')

    var _t = core._t;
    var QWeb = core.qweb;

    GraphView.include({
        events: {
            'click #updateMap': function(e) {
                optionStruct = {};
                _.each($(".panel .list-group select"), function(e) {
                    if($(e).val() !== "") {
                        optionStruct[$(e).attr("name")] = $(e).val();
                    }
                });
                _.each($(".panel .list-group input"), function(e) {
                    if($(e).val() !== "") {
                        optionStruct[$(e).attr("name")] = $(e).val();
                    }
                });
                this.widget.updateMap(optionStruct);
            },
            'click #printMap': () => {
                var mapWindow = window.open('', 'PRINT', 'height=400,width=600');
                mapWindow.document.write(document.getElementById('map_div').innerHTML);
                mapWindow.document.close();
                mapWindow.focus();
                mapWindow.print();
                mapWindow.close();
            }
        },
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
        },
        updateMap: function (e) {
            
        }
    })
});


       