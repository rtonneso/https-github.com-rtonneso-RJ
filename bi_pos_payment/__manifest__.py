# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
    "name" : "POS Invoice and Register Payment",
    "version" : "13.0.0.4",
    "category" : "Point of Sale",
    "depends" : ['base','sale','point_of_sale'],
    "author": "BrowseInfo",
    'summary': 'point of sales payment methods pos invoice payment pos accounting payment pos register payment pos voucher payment pos Multiple and partial payments pos payment methods POS payments point of sales payments POS screen register payment on pos advance payment',
    "price": 49,
    "currency": 'EUR',
    "description": """
    pos invoice payment pos accounting payment pos register payment pos voucher payment pos payment 
    pos payment from pos screen invoice payment from POS screen register payment from pos screen
    pay invoice from POS screen accounting payment from POS screen
    point of sale invoice payment point of sale accounting payment point of sale register payment
    point of sale voucher payment point of sale payment payment from point of sale screen
    pos invoice payment from point of sale screen register payment from point of sale screen
    pay invoice from point of sale screen accounting payment from point of sale screen pos multiple invoice payment
    pos mass invoice payment point of sales multiple invoice payment point of sales mass invoice payment
    Purpose :- 
    """,
    "website" : "https://www.browseinfo.in",
    "data": [
        'views/custom_pos_view.xml',
    ],
    'qweb': [
        'static/src/xml/pos_payment.xml',
    ],
    "auto_install": False,
    "installable": True,
    "live_test_url": "https://youtu.be/fAfbBu8IgGU",
    "images":['static/description/Banner.png'],
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
