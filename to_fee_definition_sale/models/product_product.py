from odoo import models, fields, api


class ProductProduct(models.Model):
    _inherit = 'product.product'

    def _prepare_supplementary_fee_so_line(self, sale_order_id):
        self.ensure_one()
        return {
            'order_id': sale_order_id.id,
            'product_id': self.id,
            'product_uom': self.uom_id.id,
            'tax_id': [(6, 0, self.taxes_id.ids)],
            'sequence': sale_order_id.order_line[-1].sequence + 1,
            }

