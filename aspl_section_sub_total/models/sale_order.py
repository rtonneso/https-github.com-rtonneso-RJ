# -*- coding: utf-8 -*-
from odoo import models, fields, api


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    section_ids = fields.One2many(
        'section.line', 'sale_order_id', "Sections")

    @api.model
    def create(self, vals):
        res = super(SaleOrder, self).create(vals)
        section_dict = {}
        line_total = []
        for line in res.order_line:
            if not line.display_type:
                line_total.append(line.price_subtotal)
            elif line.display_type == 'line_section':
                section_dict[line.name] = line_total
                line_total = []
            if line.display_type == 'line_section':
                section_dict[line.name] = line_total
        for sections in section_dict:
            section_vals = {
                'section_name': sections,
                'total': sum(section_dict[sections]),
                'sale_order_id': res.id,
                'currency_id': res.currency_id and res.currency_id.id or False
            }
            res.write({
                'section_ids': [(0, 0, section_vals)]
            })
        for l in res.order_line:
            if l.display_type == 'line_section':
                if l.name in section_dict:
                    l.section_total = \
                        str(l.currency_id.symbol) + ' ' + \
                        "{:0.2f}".format(sum(section_dict[l.name]))
        return res

    def write(self, vals):
        res = super(SaleOrder, self).write(vals)
        if vals.get('order_line'):
            section_dict = {}
            line_total = []
            self.section_ids.unlink()
            for line in self.order_line:
                if not line.display_type:
                    line_total.append(line.price_subtotal)
                elif line.display_type == 'line_section':
                    section_dict[line.name] = line_total
                    line_total = []

                if line.display_type == 'line_section':
                    section_dict[line.name] = line_total
            for sections in section_dict:
                section_vals = {
                    'section_name': sections,
                    'total': sum(section_dict[sections]),
                    'sale_order_id': self.id,
                    'currency_id': self.currency_id and self.currency_id.id
                                   or False,
                }
                self.write({
                    'section_ids': [(0, 0, section_vals)]
                })
            for l in self.order_line:
                if l.display_type == 'line_section':
                    if l.name in section_dict:
                        l.section_total = \
                            str(l.currency_id.symbol) + ' ' + \
                            "{:0.2f}".format(sum(section_dict[l.name]))
        return res


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    section_total = fields.Char('Section total', default='0.00')
