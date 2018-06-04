{
    'name' : 'OpenERP BI',
    'version': '1.0',
    'summary': 'Enhance Odoo BI features',
    'category': 'Tools',
    'description':
        """
OpenERP BI
====================

This is an OpenERP 9 addons to enhance native OpenERP BI features by adding new graph funtionnalities.
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