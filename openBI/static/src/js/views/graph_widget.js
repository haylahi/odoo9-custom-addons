odoo.define('openBI.GraphWidget', function (require) {
    var core = require('web.core');
    var GraphWidget = require('web.GraphWidget');
    
    var _t = core._t;
    var QWeb = core.qweb;
    var map;
    

    GraphWidget.include({
        display_geo: function () {
            if(this.groupbys.length === 0) {
                return this.$el.append(QWeb.render('GraphView.error', {
                    title: _t("No location groupby selected"),
                    description: _t("No geo data available for this chart. " +
                        "Try to add a groupby on a location field. "),
                }));
            } 
            this.initMap();
        },
        initMap: function () {
            this.$el.empty();
            this.$el.append(QWeb.render('GraphMapView'));

            map = new google.maps.Map(document.getElementById('map_div'), {
                center: {lat: -34.397, lng: 150.644},
                zoom: 8
            });
        },
    });
});