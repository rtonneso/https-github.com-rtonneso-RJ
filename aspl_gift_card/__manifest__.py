# -*- coding: utf-8 -*-
#################################################################################
# Author      : Acespritech Solutions Pvt. Ltd. (<www.acespritech.com>)
# Copyright(c): 2012-Present Acespritech Solutions Pvt. Ltd.
# All Rights Reserved.
#
# This program is copyright property of the author mentioned above.
# You can`t redistribute it and/or modify it.
#
# You should have received a copy of the License along with this program.
#################################################################################

{
    'name': 'POS Gift Card',
    'version': '1.0.1',
    'category': 'Point of Sale',
    'summary': 'This module allows user to purchase giftcard,use giftcard and also recharge giftcard.',
    'description': """
    User can purchase giftcard, use giftcard and also recharge giftcard.
""",
    'author': "Acespritech Solutions Pvt. Ltd.",
    'website': "http://www.acespritech.com",
    'price': 26.00,
    'currency': 'EUR',
    'version': '1.0.1',
    'depends': ['web', 'point_of_sale', 'base'],
    'images': ['static/description/main_screenshot.png'],
    'data': [
        'security/ir.model.access.csv',
        'views/aspl_gift_card.xml',
        'views/point_of_sale.xml',
        'views/gift_card.xml',
        'data/data.xml',
    ],
    'qweb': ['static/src/xml/pos.xml'],
    'installable': True,
    'auto_install': False,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: