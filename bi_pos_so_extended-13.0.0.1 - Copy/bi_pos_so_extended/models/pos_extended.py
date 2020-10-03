# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from itertools import groupby
from datetime import datetime, timedelta
import base64
import codecs
import urllib
from urllib.request import Request, urlopen
from odoo import api, fields, models,tools, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_is_zero, float_compare, DEFAULT_SERVER_DATETIME_FORMAT
from odoo.tools.misc import formatLang
from odoo.tools import html2plaintext
import odoo.addons.decimal_precision as dp
import logging
_logger = logging.getLogger(__name__)


class PosConfigurationInherit(models.Model):
	_inherit = 'pos.config'
	
	sale_state = fields.Selection([('draft', "Quotation"), ('sent', "Quotation Sent"), ('sale', "Sale Order")],string='Sale State', default='draft')
	sale_warehouse_id = fields.Many2one('stock.warehouse',string="Warehouse")

	allow_pos_payment = fields.Boolean('Allow POS Payments',default=False)
	allow_pos_invoice = fields.Boolean('Allow POS Invoice Payment and Validation',default=False)
	# invoice_import = fields.Boolean(string='Import Invoice', default=False)

class SaleOrderInherit(models.Model):
	_inherit = 'sale.order'

	digital_signature = fields.Binary(string='Signature')

	@api.model
	def sale_order_from_ui(self, data):

		order_line = []
		shipping_data = data.get('shipping_data', {})
		invoice_data = data.get('invoice_data', {})
		partner = data.get('partner', {})
		shipping_person_id = data.get('shipping_person_id')
		invoice_person_id = data.get('invoice_person_id')
		extra_note = data.get('extra_note')
		sign_img = data.get('sign_img')
		other_shipping_addrs = data.get('other_shipping_addrs')
		other_invoice_addrs = data.get('other_invoice_addrs')
		state = data.get('state')
		warehouse_id = data.get('warehouse_id')
		user_id = data.get('user_id')
		date_order = datetime.now()
		for line in data.get('line_data', False):
			order_line.append((0, 0, 
				{'product_id': line.get('product_id', False),
				'product_uom_qty': line.get('qty', 0.0),
				'price_unit': line.get('price', 0.0)}))
		
		new_shipping_addrs = int(shipping_person_id)
		new_invoice_addrs = int(invoice_person_id)
		new_shipping_partner = False
		new_invoice_partner = False
		if other_shipping_addrs:
			delivery_data = {
				'type':'delivery',
				'parent_id': partner['id'],
				'name': shipping_data.get('d_name', False),
				'mobile': shipping_data.get('mobile', False),
				'email': shipping_data.get('email', False),
				'street': shipping_data.get('address', False),
				'street2': shipping_data.get('street', False),
				'city': shipping_data.get('city', False),
				'zip': shipping_data.get('zip', False),
			}
			if delivery_data:
				new_shipping_partner = self.env['res.partner'].sudo().create(delivery_data)
				new_shipping_addrs = new_shipping_partner.id

		if other_invoice_addrs:
			invoice_delivery_data = {
				'type':'invoice',
				'parent_id': partner['id'],
				'name': invoice_data.get('d_name', False),
				'mobile': invoice_data.get('mobile', False),
				'email': invoice_data.get('email', False),
				'street': invoice_data.get('address', False),
				'street2': invoice_data.get('street', False),
				'city': invoice_data.get('city', False),
				'zip': invoice_data.get('zip', False),
			}
			if invoice_delivery_data:
				new_invoice_partner = self.env['res.partner'].sudo().create(invoice_delivery_data)
				new_invoice_addrs = new_invoice_partner.id
		if warehouse_id:
			values = {
					'partner_id': partner['id'] or False,
					'partner_invoice_id': new_invoice_addrs or False,
					'partner_shipping_id': new_shipping_addrs or False,
					'warehouse_id' : warehouse_id,
					'digital_signature' : base64.encodestring(urllib.request.urlopen(sign_img).read()),
					'note' : extra_note,
					'order_line': order_line,
					'user_id':user_id,
				}
		else:
			values = {
					'partner_id': partner['id'] or False,
					'partner_invoice_id': new_invoice_addrs or False,
					'partner_shipping_id': new_shipping_addrs or False,
					'digital_signature' : base64.encodestring(urllib.request.urlopen(sign_img).read()),
					'note' : extra_note,
					'order_line': order_line,
					'user_id':user_id,
				}
		if values:
			sale_order = self.env['sale.order'].sudo().create(values)

		if sale_order:
			if state == 'sent':
				email_act = sale_order.action_quotation_send()
				if email_act and email_act.get('context'):
					email_ctx = email_act['context']
					email_ctx.update(default_email_from=sale_order.company_id.email)
					sale_order.with_context(**email_ctx).message_post_with_template(email_ctx.get('default_template_id'))
			if state == 'sale':
				sale_order.action_confirm()

			return [sale_order.id,sale_order.name]

	def open_sale_order(self,open_id):
		res = {
				'view_mode': 'form',
				'res_id': open_id,
				'res_model': 'sale.order',
				'view_type': 'form',
				'type': 'ir.actions.act_window',
				'target':'new'
			}
		return res

