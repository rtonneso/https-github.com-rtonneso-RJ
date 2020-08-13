# -*- coding: utf-8 -*-
from odoo import models, fields, api


class SectionLine(models.Model):
	_name = 'section.line'

	section_name = fields.Char('Section')
	total = fields.Monetary('Total')
	sale_order_id = fields.Many2one('sale.order', string="Sales Order")
	purchase_order_id = fields.Many2one(
		'purchase.order', string="Purchase Order")
	currency_id = fields.Many2one('res.currency', string='Currency')