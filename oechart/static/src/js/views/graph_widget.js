odoo.define('oechart.Graphwidget', function (require) {
    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    

    GraphWidget.include({
        display_geo: function () {
            this.$el.append(QWeb.render('GraphView.error', {
                title: _t("No implementation"),
                description: "The GeoChart functionnality is not yet functionnal. Please try again later."
            }));
            return;
        }
    });
});