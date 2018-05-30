# -*- coding: utf-8 -*-
{
    'name': "openacademy",

    'summary': """
        Get strated module to learn developement in Odoo 9""",

    'description': """
        See the summary
    """,

    'author': "Alexis MANUEL",
    'website': "http://www.iraiser.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/openerp/addons/base/module/module_data.xml
    # for the full list
    'category': 'test',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        # 'views/views.xml',
        'views/templates.xml',
        'views/openacademy.xml',
        'views/partner.xml'
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}