# -*- encoding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Web Customize',
    'category': "Themes/Backend",
    'license': 'OPL-1',
    'version': '1.1',
    'summary': 'Customize Backend Theme add New Flexible Features.',
    'description': 'Customize Backend Theme add New Flexible Features.',
    'author': 'Synconics Technologies Pvt. Ltd.',
    'website': 'www.synconics.com',
    'depends': ['web_enterprise'],
    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
    ],
    'qweb': ['static/src/xml/*.xml'],
    'images': [
        'static/description/main_screen.png',
        'static/description/allure_screenshot.png',
    ],
   'price': 65.0,
   'currency': 'EUR',
   'installable': True,
   'auto_install': False,
   'bootstrap': True,
   'application': True,
}