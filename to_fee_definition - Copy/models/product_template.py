from odoo import models, fields, api


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    fee_definition_ids = fields.One2many('fee.definition', 'product_tmpl_id', string='Direct Fee Definitions',
                                    help="The fee definitions applied directly to this product on sales/purchase which do not contain nested child fees")

    fee_definitions_count = fields.Integer(string='Fees Count', compute='_compute_tmpl_fee_definitions_count', store=True)

    nested_fee_definition_ids = fields.Many2many('fee.definition', 'prod_tmpl_nested_fee_definition', string='Nested Fees',
                                                  compute='_compute_nested_fee_definition_ids', store=True,
                                                  help="All the fees applied to this product, including their nested child fees")

    @api.depends('fee_definition_ids')
    def _compute_tmpl_fee_definitions_count(self):
        for r in self:
            r.fee_definitions_count = len(r.fee_definition_ids)

    @api.depends('fee_definition_ids', 'product_variant_ids', 'product_variant_ids.product_tmpl_id', 'product_variant_ids.product_tmpl_id.fee_definition_ids')
    def _compute_nested_fee_definition_ids(self):
        for r in self:
            nested_fee_definition_ids = r.fee_definition_ids
            for product_id in r.fee_definition_ids.mapped('product_id'):
                nested_fee_definition_ids |= product_id._get_nested_fee_definitions()
            r.nested_fee_definition_ids = nested_fee_definition_ids
