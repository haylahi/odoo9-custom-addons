{
    'name' : 'Odoo GeoChart',
    'version': '1.0',
    'summary': 'Enhance Odoo graph features',
    'category': 'Tools',
    'description':
        """
Odoo GeoChart
====================

This is an Odoo 9 addons to enhance native Odoo graph features by adding Google GeoChart funtionnalities.
        """,
    'data': [
        "views/webclient_templates.xml",
    ],
    'depends' : ['web'],
    "js": [
        "static/src/js/*.js",
    ],
    "css": [
        "static/src/css/*.css"
    ],
    'qweb' : [
        "static/src/xml/*.xml",
    ],
    'application': True,
}