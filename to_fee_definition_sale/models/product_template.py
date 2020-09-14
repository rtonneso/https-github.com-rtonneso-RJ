from odoo import models, fields, api


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    total_sales_direct_fee = fields.Float(string='Total Direct Fee', compute='_compute_total_sales_direct_fee', store=True)
    total_sales_nested_fee = fields.Float(string='Total Direct Fee', compute='_compute_total_sales_nested_fee', store=True)

    @api.depends('fee_definition_ids', 'fee_definition_ids.sale_price')
    def _compute_total_direct_fee(self):
        for r in self:
            r.total_sales_direct_fee = sum(r.fee_definition_ids.mapped('sale_price'))

    @api.depends('nested_fee_definition_ids', 'nested_fee_definition_ids.sale_price')
    def _compute_total_sales_nested_fee(self):
        for r in self:
            r.total_sales_nested_fee = sum(r.nested_fee_definition_ids.mapped('sale_price'))

