# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from itertools import groupby
from datetime import datetime, timedelta

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError, AccessError
from odoo.tools import float_is_zero, float_compare, DEFAULT_SERVER_DATETIME_FORMAT
from odoo.tools.misc import formatLang
from odoo.tools import html2plaintext
import odoo.addons.decimal_precision as dp


class GlobalSearch(models.Model):
    _name = 'global.search'
    _description = 'Global Search'


    def _default_user_ids(self):
        return [(6, 0, [self._uid])]

    def erro_fun(self):
        for search in self:
            raise AccessError(_('Something went wrong!!!'))

    name = fields.Char('Global Search Name')
    user_id = fields.Many2many('res.users', string='User', required=False,domain="[('share', '=', False)]",default=_default_user_ids)
    model_id = fields.Many2one('ir.model', string='Model', required=True, copy=False, default=lambda self: self.env['ir.model'].sudo().search([],limit=1))
    field_ids = fields.Many2many('ir.model.fields',domain="[('ttype','in',['char','many2one','selection','text'])]")

    @api.onchange('model_id')
    def onchange_model_id(self):
        for field in self:
            if field.model_id:
                for field_ in field.field_ids:
                    if field.model_id != field_.model_id :
                        # reset task when changing project
                        field.field_ids = False
                return {'domain': {
                    'field_ids': [('model_id', '=', field.model_id.id)]
                }}

