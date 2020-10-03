from odoo import api, fields, models, _


class SaleOrder(models.Model):
    _inherit = "sale.order"

    order_line_fee_ids = fields.One2many('sale.order.line.fee', 'order_id', string='Order Line Fees Mapping')
    should_create_fees = fields.Boolean(string="Should Create Fee", compute='_compute_should_create_fees',
                                        help="Technical field to indicate if this order should have fee(s) created")

    @api.depends('order_line', 'order_line.should_create_fees')
    def _compute_should_create_fees(self):
        for r in self:
            if any(line.should_create_fees for line in r.order_line):
                r.should_create_fees = True
            else:
                r.should_create_fees = False

    def get_nested_fee_definitions(self):
        self.ensure_one()
        return self.order_line.get_nested_fee_definitions()

    def action_compute_fees(self):
        SOLine = self.env['sale.order.line']
        for order in self:
            # remove existing computation
            order.order_line.filtered(lambda l: l.fee_for_line_ids and l.state in ('draft', 'sent')).unlink()

            # find nested fee definition of all order lines
            fee_def_product_ids = order.get_nested_fee_definitions().mapped('product_id')

            for fee_def_product_id in fee_def_product_ids:
                line_data = fee_def_product_id._prepare_supplementary_fee_so_line(order)
                fee_for_line_ids = []
                product_uom_qty = 0.0
                name = fee_def_product_id.name + "\n" + _("Supplementary Fee related to:")
                for line in order.order_line.filtered(lambda l: l.fee_definition_ids and fee_def_product_id.id in l.fee_definition_ids.mapped('product_id').ids):
                    data = line._prepare_fee_for_line_data(fee_def_product_id)

                    name += data['name']
                    product_uom_qty += data['product_uom_qty']
                    fee_for_line_ids += data['fee_for_line_ids']

                line_data.update({
                    'name': name,
                    'fee_for_line_ids':fee_for_line_ids,
                    'product_uom_qty':product_uom_qty,
                    })
                SOLine.create(line_data)

    def action_confirm(self):
        for order in self:
            if order.should_create_fees and not order._context.get('force_no_supplementary_fees', False):
                view = self.env.ref('to_fee_definition_sale.view_sale_immediate_confirm')
                wiz = self.env['sale.immediate.confirm'].create({'order_id': order.id})
                return {
                    'name': _('Confirm Order without Supplementary Fees?'),
                    'type': 'ir.actions.act_window',
                        'view_mode': 'form',
                    'res_model': 'sale.immediate.confirm',
                    'views': [(view.id, 'form')],
                    'view_id': view.id,
                    'target': 'new',
                    'res_id': wiz.id,
                    'context': self.env.context,
                }
        return super(SaleOrder, self).action_confirm()

