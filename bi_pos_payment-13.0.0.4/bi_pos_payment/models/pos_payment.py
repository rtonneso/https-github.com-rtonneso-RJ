# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.


from odoo import fields, models, api, _
from odoo.exceptions import Warning
import random
from datetime import date, datetime

class PaymentNote(models.Model):
	_inherit = 'account.payment'
	
	notes_pos = fields.Text('Notes')


class POSConfigPayment(models.Model):
	_inherit = 'pos.config'
	
	allow_pos_payment = fields.Boolean('Allow POS Payments')
	allow_pos_invoice = fields.Boolean('Allow POS Invoice Payment and Validation')

class pos_create_customer_payment(models.Model):
	_name = 'pos.create.customer.payment'

	def create_customer_payment(self, partner_id, journal, amount, note):
		payment_object = self.env['account.payment']
		partner_object = self.env['res.partner']							
		vals = {'payment_type':'inbound', 
				'partner_type':'customer', 
				'notes_pos':note, 
				'partner_id':partner_id, 
				'journal_id':int(journal), 
				'amount':amount, 
				'payment_date': datetime.today(), 
				'payment_method_id':1 
			}
		a = payment_object.create(vals) # Create Account Payment
		a.post() # Confirm Account Payment

		
		return True
		
	def create_customer_payment_inv(self, partner_id, journal, amount, invoice, note):
		payment_object = self.env['account.payment']
		partner_object = self.env['res.partner']
		inv_obj = self.env['account.move'].search([('id','=',invoice['id'])])
		
		inv_ids = []
		for inv in inv_obj:
			inv_ids.append(inv.id)
							
		vals = {'payment_type':'inbound', 
				'partner_type':'customer', 
				'partner_id':partner_id, 
				'journal_id':int(journal), 
				'amount':amount, 
				'notes_pos':note,
				'invoice_ids': [(6,0,inv_ids)],
				'payment_date': datetime.today(), 
				'payment_method_id':1 }
		
		a = payment_object.create(vals) # Create Account Payment
		a.post() # Confirm Account Payment

		
		return True
	

