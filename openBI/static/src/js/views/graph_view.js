odoo.define('openBI.GraphView',function (require) {
    var core = require('web.core');
    var GraphView = require('web.GraphView')

    var _t = core._t;
    var QWeb = core.qweb;

    GraphView.include({
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
        }
    })
});