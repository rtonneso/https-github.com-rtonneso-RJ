from odoo import api, fields, models


class SaleImmediateConfirm(models.TransientModel):
    _name = 'sale.immediate.confirm'
    _description = 'Sales Immediate Confirm'

    order_id = fields.Many2one('sale.order', string="Sale Order")

    @api.model
    def default_get(self, fields):
        res = super(SaleImmediateConfirm, self).default_get(fields)
        if not res.get('order_id') and self._context.get('active_id'):
            res['order_id'] = self._context['active_id']
        return res

    def action_compute_supplementary_fees_and_confirm(self):
        self.ensure_one()
        self.order_id.action_compute_fees()
        self.order_id.action_confirm()
        return True

    def action_confirm_without_fees(self):
        self.ensure_one()
        self.order_id.with_context(force_no_supplementary_fees=True).action_confirm()
        return True

