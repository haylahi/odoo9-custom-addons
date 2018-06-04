{
    'name' : 'OpenERP Google Chart',
    'version': '1.0',
    'summary': 'Enhance web charts with Google ones',
    'category': 'Tools',
    'description':
        """
OpenERP Google Chart
====================

This is an OpenERP 9 addons to enhance native OpenERP BI features.
        """,
    'data': [
        "views/webclient_templates.xml",
    ],
    'depends' : ['web'],
    "js": [
        "static/src/js/*.js"],
    "css": [
        "static/src/css/*.css"
    ],
    'qweb' : [
        "static/src/xml/*.xml",
    ],
    'application': True,
}