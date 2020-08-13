# -*- coding: utf-8 -*-
# Copyright (C) Softhealer Technologies.
from odoo import models,fields,api

class sale_order_line(models.Model):
    _inherit="sale.order.line"
    
    tick=fields.Boolean(string="Select Product")

class sale_order(models.Model):
    _inherit="sale.order"

    def action_split(self):
        
        do_unlink =False
        for rec in self:
            for line in rec.order_line:
                if line.tick:
                    do_unlink=True
    
            if do_unlink:
                new_sale_order=rec.copy()
                for line in new_sale_order.order_line:
                    if line.tick == False:
                        line.unlink()
                    else:
                        line.tick=False
            for line in rec.order_line:
                if line.tick:
                    line.unlink()
    
    def action_extract(self):
        
        do_unlink =False
        for rec in self:
            for line in rec.order_line:
                if line.tick:
                    do_unlink=True
    
            if do_unlink:
                new_sale_order=rec.copy()
                for line in new_sale_order.order_line:
                    if line.tick == False:
                        line.unlink()
                    else:
                        line.tick=False
            for line in rec.order_line:
                if line.tick:
                    line.tick=False
                    