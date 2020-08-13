# -*- coding: utf-8 -*-
# Part of Odoo. See COPYRIGHT & LICENSE files for full copyright and licensing details.

from odoo import fields, models, api


class ResUsers(models.Model):
    _inherit = 'res.users'

    display_density = fields.Selection([
        ('default', 'Default'),
        ('comfortable', 'Comfortable'),
        ('compact', 'Compact'),
    ], string="Display Density", default='default')