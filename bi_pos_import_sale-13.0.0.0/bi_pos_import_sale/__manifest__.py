# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
	'name':"POS Import Sales Order- Import Sales in Point of Sales",
	'version':'13.0.0.0',
	'category':'Point of Sale',
	'summary':'POS import Sales order in POS add sales in pos screen import sale order from pos add sales order pos sales so import pos import sale on pos import sale on point of sale import sale on point of sale import sales in pos import so from pos import sale in pos',
	'description':""" This module is used to import sale orders in POS
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
	'author':"BrowseInfo",
	'website':'https://www.browseinfo.in',
	"price": 29,
	"currency": 'EUR',
	'depends':['base','sale_management','point_of_sale'],
	'data':['views/assets.xml','views/pos_extend.xml'],
	'qweb': ['static/src/xml/pos_view.xml'],
	"auto_install": False,
	'installable': True,
	"live_test_url":'https://youtu.be/-UBmVQrFM8I',
    "images":['static/description/Banner.png'],			
}
