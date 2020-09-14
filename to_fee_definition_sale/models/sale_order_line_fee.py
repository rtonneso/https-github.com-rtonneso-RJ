from odoo import fields, models


class SaleOrderLineFee(models.Model):
    _name = 'sale.order.line.fee'
    _description = "Sale Order Line Fee"

    order_id = fields.Many2one('sale.order', string='Sales Order', ondelete='cascade')
    line_id = fields.Many2one('sale.order.line', string='Fee For Line', ondelete='cascade')
    fee_line_id = fields.Many2one('sale.order.line', string='Order Line', ondelete='cascade')
    fee_definition_id = fields.Many2one('fee.definition', string='Fee Definition', ondelete='set null')
    quantity = fields.Float(string='Quantity')
    lst_price = fields.Float(related='fee_definition_id.lst_price')
