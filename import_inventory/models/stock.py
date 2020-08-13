# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

from odoo.exceptions import Warning
from odoo import models, fields, exceptions, api, _
import io
import tempfile
import binascii
import logging
_logger = logging.getLogger(__name__)

try:
    import csv
except ImportError:
    _logger.debug('Cannot `import csv`.')
try:
    import xlwt
except ImportError:
    _logger.debug('Cannot `import xlwt`.')
try:
    import base64
except ImportError:
    _logger.debug('Cannot `import base64`.')
# for xls 
try:
    import xlrd
except ImportError:
    _logger.debug('Cannot `import xlrd`.')


class gen_inv_2(models.Model):
    _name = "generate.inv"

    product_counter_main = fields.Integer("Counter")

    @api.model
    def default_get(self, fields):
        res = super(gen_inv_2, self).default_get(fields)
        inv_id = self.env['generate.inv'].sudo().search([],order="id desc",limit=1)
        if inv_id:
            res.update({
                'product_counter_main' : inv_id.product_counter_main
                })
        else:
            res.update({
                'product_counter_main' : ''
                })
        return res

class gen_inv(models.TransientModel):
    _name = "gen.inv"

    file = fields.Binary('File')
    inv_name = fields.Char('Inventory Name')
    location_ids = fields.Many2many('stock.location','rel_location_wizard',string= "Location")
    import_option = fields.Selection([('csv', 'CSV File'),('xls', 'XLS File')],string='Select',default='csv')
    import_prod_option = fields.Selection([('barcode', 'Barcode'),('code', 'Code'),('name', 'Name')],string='Import Product By ',default='code')
    location_id_option = fields.Boolean(string="Allow to Import Location on inventory line from file")
    is_validate_inventory = fields.Boolean(string="Validate Inventory")

    
    def import_csv(self):

        """Load Inventory data from the CSV file."""
        if self.import_option == 'csv':
            
            data = base64.b64decode(self.file)
            try:
                file_input = io.StringIO(data.decode("utf-8"))
            except UnicodeError:
                raise Warning('Invalid file!')

            if not self.location_ids:
                raise Warning(_('Please Select Location')) 
            """Load Inventory data from the CSV file."""
            ctx = self._context
            keys=['code', 'quantity','location']
            stloc_obj = self.env['stock.location']
            inventory_obj = self.env['stock.inventory']
            product_obj = self.env['product.product']
            stock_line_obj = self.env['stock.inventory.line']
            csv_data = base64.b64decode(self.file)
            data_file = io.StringIO(csv_data.decode("utf-8"))
            data_file.seek(0)
            file_reader = []
            csv_reader = csv.reader(data_file, delimiter=',')
            flag = 0

            generate_inv = self.env['generate.inv']
            counter_product = 0.0

            try:
                file_reader.extend(csv_reader)
            except Exception:
                raise exceptions.Warning(_("Invalid file!"))
            values = {}
            inventory_obj = self.env['stock.inventory']
            inventory_id = inventory_obj.create({'name':self.inv_name,'prefill_counted_quantity' : 'counted','location_ids':self.location_ids.ids})
            inventory_id.action_start()
            
            for i in range(len(file_reader)):
                if self.location_id_option == True : 
                    if i!= 0:
                        val = {}
                        try:
                             field = list(map(str, file_reader[i]))
                        except ValueError:
                             raise exceptions.Warning(_("Dont Use Charecter only use numbers"))
                        
                        values = dict(zip(keys, field))
                        
                        if self.import_prod_option == 'barcode':
                            prod_lst = product_obj.search([('barcode',  '=',values['code'])]) 
                        elif self.import_prod_option == 'code':
                            prod_lst = product_obj.search([('default_code',  '=',values['code'])]) 
                        else:
                            prod_lst = product_obj.search([('name', '=',
                                                        values['code'])])
                        stock_location_id = self.env['stock.location'].search([('name','=',values['location'])])
                        if not stock_location_id:
                            raise Warning(_('"%s" Location is not available.')%(values['location']))
         
                        
                        if prod_lst:
                            val['product'] = prod_lst[0].id
                            val['quantity'] = values['quantity']

                        if bool(val):
                            product_id = product_obj.browse(val['product'])
                            product_uom_id=product_obj.browse(val['product']).uom_id

                            
                            inventory_id.write({'product_ids' :[(4,val['product'])] })
                            search_line = self.env['stock.inventory.line'].search([('product_id','=',val['product']),('inventory_id','=',inventory_id.id),('location_id','=',stock_location_id.id)])
                            if search_line :
                                for inventory_line in search_line :
                                    inventory_line.write({'product_qty' : val['quantity']})

                            else :

                                stock_line_id = self.env['stock.inventory.line'].create({'product_id':val['product'] ,'inventory_id' : inventory_id.id, 'location_id' : stock_location_id.id, 'product_uom_id' : product_uom_id.id  ,'product_qty': val['quantity']})
                            
                            

                                stock_line_id._onchange_quantity_context()
                            

                            flag =1
                            for i in prod_lst:
                                counter_product += 1
                            g_inv_id = generate_inv.sudo().create({
                                'product_counter_main' : int(counter_product)
                            })

                        else:
                            raise Warning(_('Product Not Found  "%s"') % values.get('code'))

                else: 
                    if i!= 0:
                        val = {}
                        try:
                             field = list(map(str, file_reader[i]))
                        except ValueError:
                             raise exceptions.Warning(_("Dont Use Charecter only use numbers"))
                        
                        values = dict(zip(keys, field))
                        
                        if self.import_prod_option == 'barcode':
                            prod_lst = product_obj.search([('barcode',  '=',values['code'])]) 
                        elif self.import_prod_option == 'code':
                            prod_lst = product_obj.search([('default_code',  '=',values['code'])]) 
                        else:
                            prod_lst = product_obj.search([('name', '=',
                                                        values['code'])])         
                        if prod_lst:
                            val['product'] = prod_lst[0].id
                            val['quantity'] = values['quantity']
                        if bool(val):
                            product_id = product_obj.browse(val['product'])
                            product_uom_id=product_obj.browse(val['product']).uom_id
                            
                            
                            search_line = self.env['stock.inventory.line'].search([('product_id','=',val['product']),('inventory_id','=',inventory_id.id)])
                            if search_line :
                                for inventory_line in search_line :
                                    inventory_line._onchange_quantity_context()
                                    inventory_line.write({'product_qty' : val['quantity']})


                            else :
                            
                                stock_line_id = self.env['stock.inventory.line'].create({'product_id':val['product'] ,'inventory_id' : inventory_id.id, 'location_id' : self.location_ids.ids[0], 'product_uom_id' : product_uom_id.id  ,'product_qty': val['quantity']})
                            
                            
                                stock_line_id._onchange_quantity_context()
                           
                            
                            flag =1
                            for i in prod_lst:
                                counter_product += 1
                            g_inv_id = generate_inv.sudo().create({
                                'product_counter_main' : int(counter_product)
                            })

                        else:
                            raise Warning(_('Product Not Found  "%s"') % values.get('code'))
            
            if self.is_validate_inventory == True:
                inventory_id.action_validate()

            if flag ==1:
                return  {
                        'name': _('Success'),
                        'view_type': 'form',
                        'view_mode': 'form',
                        'res_model': 'generate.inv',
                        'view_id': self.env.ref('import_inventory.success_import_wizard').id,
                        'type': 'ir.actions.act_window',
                        'target': 'new'
                        }
            else:
                return True 




        else:
            
            stock_line_obj = self.env['stock.inventory.line']
            if not self.location_ids:
                raise Warning(_('Please Select Location'))
            fp = tempfile.NamedTemporaryFile(delete= False,suffix=".xlsx")
            fp.write(binascii.a2b_base64(self.file))
            fp.seek(0)
            values = {}
            workbook = xlrd.open_workbook(fp.name)
            sheet = workbook.sheet_by_index(0)
            product_obj = self.env['product.product']
        
            
            
            inventory_obj = self.env['stock.inventory']
            inventory_id = inventory_obj.create({'name':self.inv_name,'prefill_counted_quantity' : 'counted','location_ids':self.location_ids.ids})
            inventory_id.action_start()

            flag = 0
            generate_inv = self.env['generate.inv']
            counter_product = 0.0

            for row_no in range(sheet.nrows):
                if self.location_id_option == True : 
                    val = {}
                    if row_no <= 0:
                        fields = map(lambda row:row.value.encode('utf-8'), sheet.row(row_no))
                    else:
                        line = list(map(lambda row:isinstance(row.value, bytes) and row.value.encode('utf-8') or str(row.value), sheet.row(row_no)))
                        if line:
                            values.update({'code':line[0],'quantity':line[1],'line_location_id':line[2]})
                            
                            if self.import_prod_option == 'barcode':
                                prod_lst = product_obj.search([('barcode',  '=',values['code'])]) 
                            elif self.import_prod_option == 'code':
                                prod_lst = product_obj.search([('default_code',  '=',values['code'])]) 
                            else:
                                prod_lst = product_obj.search([('name', '=',
                                                        values['code'])])
                            stock_location_id = self.env['stock.location'].search([('name','=',values['line_location_id'])])
                            if not stock_location_id:
                                raise Warning(_('"%s" Location is not available.')%(values['line_location_id']))

                            if prod_lst:
                                val['product'] = prod_lst[0].id
                                val['quantity'] = values['quantity']
                            if bool(val):
                                product_id = product_obj.browse(val['product'])
                                product_uom_id=product_obj.browse(val['product']).uom_id

                                
                                inventory_id.write({'product_ids' :[(4,val['product'])] })
                                search_line = self.env['stock.inventory.line'].search([('product_id','=',val['product']),('inventory_id','=',inventory_id.id),('location_id','=',stock_location_id.id)])
                                if search_line :
                                    for inventory_line in search_line :
                                        inventory_line.write({'product_qty' : val['quantity']})

                                else :

                                    stock_line_id = self.env['stock.inventory.line'].create({'product_id':val['product'] ,'inventory_id' : inventory_id.id, 'location_id' : stock_location_id.id, 'product_uom_id' : product_uom_id.id  ,'product_qty': val['quantity']})
                                
                                

                                    stock_line_id._onchange_quantity_context()
                                


                                    

                                flag =1
                                for i in prod_lst:
                                    counter_product += 1
                                g_inv_id = generate_inv.sudo().create({
                                    'product_counter_main' : int(counter_product)
                                })

                            else:
                                raise Warning(_('Product Not Found  "%s"') % values.get('code'))
                else:
                    val = {}
                    if row_no <= 0:
                        fields = map(lambda row:row.value.encode('utf-8'), sheet.row(row_no))
                    else:
                        line = list(map(lambda row:isinstance(row.value, bytes) and row.value.encode('utf-8') or str(row.value), sheet.row(row_no)))
                        if line:
                            values.update({'code':line[0],'quantity':line[1]})
                            if self.import_prod_option == 'barcode':
                                prod_lst = product_obj.search([('barcode',  '=',values['code'])]) 
                            elif self.import_prod_option == 'code':
                                prod_lst = product_obj.search([('default_code',  '=',values['code'])]) 
                            else:
                                prod_lst = product_obj.search([('name', '=',
                                                        values['code'])])
                            if prod_lst:
                                val['product'] = prod_lst[0].id
                                val['quantity'] = values['quantity']
                            if bool(val):
                                product_id = product_obj.browse(val['product'])
                                product_uom_id=product_obj.browse(val['product']).uom_id
                                
                                search_line = self.env['stock.inventory.line'].search([('product_id','=',val['product']),('inventory_id','=',inventory_id.id)])
                                if search_line :
                                    for inventory_line in search_line :
                                        inventory_line._onchange_quantity_context()
                                        inventory_line.write({'product_qty' : val['quantity']})


                                else :
                                
                                    stock_line_id = self.env['stock.inventory.line'].create({'product_id':val['product'] ,'inventory_id' : inventory_id.id, 'location_id' : self.location_ids.ids[0], 'product_uom_id' : product_uom_id.id  ,'product_qty': val['quantity']})
                                
                                
                                    stock_line_id._onchange_quantity_context()
                                

                                flag =1
                                for i in prod_lst:
                                    counter_product += 1
                                g_inv_id = generate_inv.sudo().create({
                                    'product_counter_main' : int(counter_product)
                                })
                            else:
                                raise Warning(_('Product Not Found  "%s"') % values.get('code'))

            if self.is_validate_inventory == True:
                inventory_id.action_validate()

            if flag ==1:
                return  {
                        'name': _('Success'),
                        'view_type': 'form',
                        'view_mode': 'form',
                        'res_model': 'generate.inv',
                        'view_id': self.env.ref('import_inventory.success_import_wizard').id,
                        'type': 'ir.actions.act_window',
                        'target': 'new'
                        }
            else:
                return True
            
