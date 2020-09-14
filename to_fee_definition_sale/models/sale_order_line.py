from odoo import api, fields, models, _


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    fee_definition_ids = fields.Many2many('fee.definition', string='Fee Definitions', compute='_compute_fee_definition_ids', store=True)

    fee_ids = fields.One2many('sale.order.line.fee', 'line_id', string='Fee Lines')
    fee_for_line_ids = fields.One2many('sale.order.line.fee', 'fee_line_id', string='Fee For Lines')

    should_create_fees = fields.Boolean(string="Should Create Fee", compute='_compute_should_create_fees',
                                        help="Technical field to indicate if this line should have fee(s) created")

    @api.depends('fee_definition_ids', 'fee_ids')
    def _compute_should_create_fees(self):
        for r in self:
            if r.fee_definition_ids and not r.fee_ids:
                r.should_create_fees = True
            else:
                r.should_create_fees = False

    @api.depends('product_id', 'product_id.product_tmpl_id.fee_definition_ids')
    def _compute_fee_definition_ids(self):
        for r in self:
            r.fee_definition_ids = r.product_id._get_direct_fee_definitions()

    def get_nested_fee_definitions(self):
        fee_def_ids = self.env['fee.definition']
        for product_id in self.mapped('product_id'):
            fee_def_ids += product_id._get_nested_fee_definitions()
        return fee_def_ids

    def get_direct_fee_definitions(self):
        return self.mapped('product_id')._get_direct_fee_definitions()

    def _prepare_fee_for_line_data(self, fee_def_product_id):
        self.ensure_one()
        name = _("\n - %s,") % (self.product_id.display_name,)
        product_uom_qty = 0.0
        fee_for_line_ids = []
        fee_def_ids = self.get_direct_fee_definitions().filtered(lambda d: d.product_id.id == fee_def_product_id.id)
        for fee_def in fee_def_ids:
            fee_def_data = fee_def._prepare_so_lines_fee_mapping_data(self)
            quantity = fee_def_data['quantity']
            product_uom_qty += quantity
            fee_for_line_ids.append((0, 0, fee_def_data['fee_mapping_data']))
        return {
            'name': name,
            'product_uom_qty':product_uom_qty,
            'fee_for_line_ids': fee_for_line_ids
            }

