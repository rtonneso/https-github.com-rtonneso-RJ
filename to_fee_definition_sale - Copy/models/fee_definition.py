from odoo import models, fields, api


class FeeDefinition(models.Model):
    _inherit = 'fee.definition'

    lst_price = fields.Float(related='product_id.lst_price', string='Unit Sales Price', store=True, readonly=True,
                             help="The unit price of the Fee applied on sales")
    sale_price = fields.Float(string='Total Sales Price', compute='_compute_sale_price', store=True)

    @api.depends('lst_price', 'quantity')
    def _compute_sale_price(self):
        for r in self:
            r.sale_price = r.lst_price * r.quantity

    def _prepare_so_lines_fee_mapping_data(self, sale_line_id):
        self.ensure_one()
        line_qty = sale_line_id.product_uom._compute_quantity(sale_line_id.product_uom_qty, sale_line_id.product_id.uom_id)
        quantity = self.quantity * line_qty
        fee_mapping_data = {
            'fee_definition_id': self.id,
            'line_id': sale_line_id.id,
            'order_id': sale_line_id.order_id.id,
            'quantity': quantity,
            }
        return {
            'quantity':quantity,
            'fee_mapping_data': fee_mapping_data,
            }
