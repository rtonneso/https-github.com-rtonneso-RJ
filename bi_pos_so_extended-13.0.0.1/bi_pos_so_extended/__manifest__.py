# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
	"name" : " Quotation sale order and pay Invoice in POS app Odoo",
	"version" : "13.0.0.1",
	"category" : "",
	'summary': 'Create Sale from POS Import Sale order in POS sale order pos create invoice pos Quotation point of Sales confirm sales order invoice pos Quotation invoice payment point of sales make Quotation from pos screen create SO pos screen pos screen invoice pay',
	"description": """
	Using this module you can create sale order from POS
	you can import sale order in POS you can also pay invoice directly from POS.
    
    odoo create sale order from POS make so from POS add sale order from POS generate Sale Order from POS
    odoo pay invoice pos sale order from pos pay invoice from Point of sales
    odoo pay sales order from pos invoice payment from pos invoice pay from pos
    odoo pos invoice payment partial payment pos 
    odoo partial invoice payment pos pos partial invoice payment
    odoo make Quotation from pos Quotation from pos
    odoo pos Quotation invoice payment point of sales
    odoo point of sales invoices make and confirm Quotation from pos
    odoo point of sale Quotation invoicing odoo invoicing Quotation in pos
    odoo pos Quotation invoice pos sale order Quotation invoice so in pos 

    odoo pos invoice payment pos accounting payment pos register payment pos voucher payment pos payment 
    odoo pos payment from pos screen invoice payment from POS screen register payment from pos screen
    odoo pay invoice from POS screen accounting payment from POS screen
    odoo point of sale invoice payment point of sale accounting payment point of sale register payment
    odoo point of sale voucher payment point of sale payment payment from point of sale screen
    odoo pos invoice payment from point of sale screen register payment from point of sale screen
    odoo pay invoice from point of sale screen accounting payment from point of sale screen pos multiple invoice payment
    odoo pos mass invoice payment point of sales multiple invoice payment point of sales mass invoice payment
odoo Create Sales Order from Point of Sale Create SO from POS Create sales from Point of Sales
		odoo Add Quotation form POS Create Quotation from Point of Sales
		odoo Create Sales from POS Generate sales order from POS
		odoo Add Quotatuon from POS Create sales order from POS

		odoo import Sales Order from Point of Sale import Sale from Point of Sale
		odoo import Sales from Point of Sale import SO from POS
		odoo Import SO from point of sale import sales from Point of Sale
		odoo Import sale order from POS import Quotation form POS
		odoo import Quotation from Point of Sales import Sales from POS
		odoo import sales order from POS import Quotatuon from POS, 
		odoo import sales order from POS odoo import quote from pos odoo import quote from point of sale
		odoo point of sale save quotation point of sale add quotation point of sale create quotation odoo
		odoo point of sales save quotation point of sales add quotation point of sales create quotation odoo
		odoo pos save quotation pos add quotation pos create quotation odoo
		This odoo apps helps to import order and import product from specific sale order or import whole sales order in point of sales system using POS touch screen. After installing this odoo modules you can see all the created quotation and sales order in pos screen using import order button you can easily import specific order as point of sales order. User will also have selection to choose which products and how much quantity of product they want to import on point of sale order.
	
	""",
	"author": "BrowseInfo",
	"website" : "https://www.browseinfo.in",
	"price": 20,
	"currency": 'EUR',
	"depends" : ['base','sale_management','point_of_sale','bi_pos_import_sale','bi_pos_payment'],
	"data": [
		# 'security/ir.model.access.csv',
		'views/pos_extended.xml',
	],
	'qweb': [
		'static/src/xml/pos_view.xml',
		'static/src/xml/backend_sign.xml',
	],
	"auto_install": False,
	"installable": True,
	"live_test_url":'https://youtu.be/SrP_0_qM658',
	"images":["static/description/Banner.png"],
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
