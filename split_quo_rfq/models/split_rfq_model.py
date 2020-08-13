# -*- coding: utf-8 -*-
# Copyright (C) Softhealer Technologies.
from odoo import models,fields,api

class purchase_order_line(models.Model):
    _inherit="purchase.order.line"
    
    tick=fields.Boolean(string="Select Product")


class purchase_order(models.Model):
    _inherit="purchase.order"
    


    def action_split(self):
        
        do_unlink =False;
        for line in self.order_line:
            if line.tick:
                do_unlink=True

        if do_unlink:
            new_purchase_order=self.copy()
            for line in new_purchase_order.order_line:
                if line.tick == False:
                    line.unlink()
                else:
                    line.tick=False
        for line in self.order_line:
            if line.tick:
                line.unlink();
    

    def action_extract(self):
        
        do_unlink =False;
        for line in self.order_line:
            if line.tick:
                do_unlink=True

        if do_unlink:
            new_purchase_order=self.copy()
            for line in new_purchase_order.order_line:
                if line.tick == False:
                    line.unlink()
                else:
                    line.tick=False
        for line in self.order_line:
            if line.tick:
                line.tick=False;