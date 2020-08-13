# -*- coding: utf-8 -*-
from odoo.exceptions import Warning
from odoo import models, fields, exceptions, api, _
import io
import tempfile
import binascii
import logging
import os 
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
try:
    import xlrd
except ImportError:
    _logger.debug('Cannot `import xlrd`.')

from odoo import api, fields, models, _

class StockImport(models.TransientModel):
    _name = 'import.stock'
    _description = "Stock Import Inventory"

    name = fields.Char(string="Name",required=True)
    location_id = fields.Many2one('stock.location',required=True)
    account_date = fields.Date(string="Accounting Date")
    valuation_state = fields.Selection([('draft','Progress'),('validate','Validate')],default="draft")
    import_file = fields.Binary('Select File',required=True)
    file_name = fields.Char('File Name')
    location_option = fields.Selection([('name', 'Name'),('barcode', 'Barcode'),('external','External ID')],string='Location Search',default='name')
    import_prod_option = fields.Selection([('name', 'Name'),('barcode', 'Barcode'),('ref', 'Internal Reference '),('external','External ID')],string='Product Search',default='name')
    file_type = fields.Selection([('csv','CSV'),('xls','XLS')],default='xls',string="Type",required=True)
    inventory_option = fields.Selection([('update','Update Inventory'),('add','Add Inventory')],default='add',string="Inventory Operation")
    create_product = fields.Boolean('Create Product With Import Stock')
    skip_validation = fields.Selection([('skip','Skip Validation'),('restrict','Restrict With Validation')],default="skip")


    def import_file_button(self):
        inventory_obj = self.env['stock.inventory']
        company_id = self.env['res.users'].browse(self._context.get('uid')).company_id
        validate_res = self.env['import.validation'].create({'name' : 'validate'})
        flag = False
        if self.inventory_option == 'add' :
                stock_inventory = inventory_obj.create({'name':self.name,'location_ids':[self.location_id.id],'accounting_date' : self.account_date})
                stock_inventory.action_start()

        elif self.inventory_option == 'update' :
            stock_inventory = inventory_obj.search([('name','=',self.name),('location_ids','=',self.location_id.id)],limit=1)
            if not stock_inventory :
                raise Warning(_('"%s" Inventory is not available.')%(self.name))

            if stock_inventory.state == 'draft' :
                stock_inventory.action_start()


        file_name_list = ['with_external_id.xls','with_external_id.csv']

        if self.file_type == 'xls' :

            file_name = str(self.file_name)
            if self.import_file:
                if '.' not in file_name:
                    raise Warning(_('Please upload valid xls or csv file.!'))
                extension = file_name.split('.')[1]
                if extension !=  'xls':
                    raise Warning(_('Please upload xls file.!'))
            
            fp = tempfile.NamedTemporaryFile(delete= False,suffix=".xlsx")
            fp.write(binascii.a2b_base64(self.import_file))
            fp.seek(0)
            values = {}
            workbook = xlrd.open_workbook(fp.name)
            sheet = workbook.sheet_by_index(0)

            product = self.env['product.product']
            for no in range(sheet.nrows):
                warning = False
                if no <= 0:
                    fields = map(lambda row:row.value.encode('utf-8'), sheet.row(no))
  
                else :

                    data = list(map(lambda row:isinstance(row.value, bytes) and row.value.encode('utf-8') or str(row.value), sheet.row(no)))

                    if data :

                        values.update({'name':data[0],'uom':data[1],'location':data[2],'lot':data[3],'qty':data[4],'ref' : data[5],'category':data[6],'price' :data[7],'cost' : data[8]})

                        if self.import_prod_option == 'external':
                            if self.file_name not in file_name_list:
                                raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))
                            else:
                                values.update({'product_ext_id':data[9]})

                        if self.location_option == 'external':
                            if self.file_name not in file_name_list:
                                raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))
                            else:
                                values.update({'location_ext_id':data[10]})
                        product_rec = False
                        if self.import_prod_option == 'name' :

                            product_rec = product.search([('name', '=',
                                                            values['name'])],limit=1)

                            if not product_rec and self.create_product == False:
                                if self.skip_validation == 'skip' :
                                    warning = True
                                    self.env['import.validation.line'].create({'element' : values['name'] + ' Product is not available.','validation_id' : validate_res.id})

                                else :
                                    raise Warning(_('"%s" Product is not available.')%(values['name']))

                            if not product_rec and self.create_product == True:
                                category = self.env['product.category'].search([('name','=',values['category'])],limit=1)

                                if not category :
                                    category = self.env['product.category'].create({'name' :values['category'] })
                                if values['lot'] :
                                    product_rec = product.create({'name' : values['name'],'categ_id' :category.id ,'default_code' : values['ref'],'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost'] })

                                else :
                                    product_rec = product.create({'name' : values['name'],'categ_id' :category.id ,'default_code' : values['ref'],'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})


                        if self.import_prod_option == 'barcode':

                            product_rec = product.search([('barcode', '=',
                                                            values['name'])],limit=1)

                            if not product_rec and self.create_product == False:
                                if self.skip_validation == 'skip' :
                                    warning = True
                                    self.env['import.validation.line'].create({'element' : values['name'] + ' Product is not available for this barcode.','validation_id' : validate_res.id})
                                else :
                                    raise Warning(_('"%s" Product is not available for this barcode.')%(values['name']))

                            if not product_rec and self.create_product == True:
                                category = self.env['product.category'].search([('name','=',values['category'])],limit=1)
                                
                                if not category :
                                    category = self.env['product.category'].create({'name' :values['category'] })
                                if values['lot'] :
                                    product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'barcode' : values['name'],'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost']})

                                else :
                                    product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'barcode' : values['name'],'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})



                        if self.import_prod_option == 'ref':

                            product_rec = product.search([('default_code', '=',
                                                            values['name'])],limit=1)

                            if not product_rec and self.create_product == False:
                                if self.skip_validation == 'skip' :
                                    warning = True
                                    self.env['import.validation.line'].create({'element' : values['name'] + ' Product is not available for this internal reference.','validation_id' : validate_res.id})
                                else :
                                    raise Warning(_('"%s" Product is not available for this internal reference  .')%(values['name']))


                            if not product_rec and self.create_product == True:
                                category = self.env['product.category'].search([('name','=',values['category'])],limit=1)
                                
                                if not category :
                                    category = self.env['product.category'].create({'name' :values['category'] })
                                if values['lot'] :
                                    product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'default_code' : values['name'],'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost']})

                                else :
                                    product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'default_code' : values['name'],'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})

                        if self.import_prod_option == 'external':
                            if self.file_name not in file_name_list:
                                raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))

                            else:
                                if values.get('product_ext_id'):
                                    product_rec = self.env.ref(values.get('product_ext_id'))
                                else:
                                    product_rec = False
                                
                                if not product_rec and self.create_product == False:
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values['name'] + 'Product is not available for this external id.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('"%s" Product is not available for this external id.')%(values['name']))

                                if not product_rec and self.create_product == True:
                                    category = self.env['product.category'].search([('name','=',values['category'])],limit=1)
                                    
                                    if not category :
                                        category = self.env['product.category'].create({'name' :values['category'] })
                                    if values['lot'] :
                                        product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost']})

                                    else :
                                        product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})

                        uom_rec = self.env['uom.uom'].search([('name','=',values['uom'])],limit=1)
                            
                        if not uom_rec :
                            if self.skip_validation == 'skip' :
                                warning = True
                                self.env['import.validation.line'].create({'element' : values['uom'] + ' Uom is not available.','validation_id' : validate_res.id})
                            else :

                                raise Warning(_('"%s" Uom is not available.')%(values['uom']))


                        location_res =False
                        if self.location_option == 'name' :
                            location_res = self.env['stock.location'].search([('name','=',values['location']),('company_id','=',company_id.id)],limit=1)


                            if not location_res :
                                if self.skip_validation == 'skip' :
                                    warning = True
                                    self.env['import.validation.line'].create({'element' : values['location'] + ' Location is not available.','validation_id' : validate_res.id})
                                else :
                                    raise Warning(_('"%s" Location is not available.')%(values['location']))
                        

                        if self.location_option == 'barcode' :

                            location_res = self.env['stock.location'].search([('barcode','=',values['location']),('company_id','=',company_id.id)],limit=1)


                            if not location_res :
                                if self.skip_validation == 'skip' :
                                    warning = True
                                    self.env['import.validation.line'].create({'element' : values['location'] + ' Location is not available for this barcode.','validation_id' : validate_res.id})
                                else :
                                    raise Warning(_('"%s" Location is not available for this barcode.')%(values['location']))

                        if self.location_option == 'external' :

                            if self.file_name not in file_name_list:
                                raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))

                            else:
                                if values.get('location_ext_id'):
                                    location_res = self.env.ref(values.get('location_ext_id'))
                                else:
                                    location_res = False

                                if not location_res :
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : str(location_res) + ' Location is not available for this external id.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('Location is not available for this (%s) external id.')%(location_res))


                        if self.import_prod_option == 'external':

                            if self.file_name not in file_name_list:
                                raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))

                            else:
                                if values.get('location_ext_id'):
                                    location_res = self.env.ref(values.get('location_ext_id'))
                                else:
                                    location_res = False

                                if not location_res :
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values.get('product_ext_id') + 'Location is not available for this external id.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('"%s" Location is not available for this external id.')%(values.get('product_ext_id')))

                        if warning == True :
                            flag = True
                            continue

                        lot_num_rec = False

                        if product_rec:
                            if product_rec.tracking != 'none':

                                lot_num_rec = self.env['stock.production.lot'].search([('name','=',values['lot'])],limit=1)

                                if not lot_num_rec :

                                    lot_num_rec = self.env['stock.production.lot'].create({'name': values['lot'],'product_id':product_rec.id , 'company_id' :self.env['res.users'].browse(self.env.uid).partner_id.company_id.id })

                        if lot_num_rec : 
                            self.env['stock.inventory.line'].create({'product_id' :product_rec.id,'product_uom_id': uom_rec.id,'location_id':location_res.id,'prod_lot_id':lot_num_rec.id,'product_qty':values['qty'],'inventory_id':stock_inventory.id})
                        else :
                            self.env['stock.inventory.line'].create({'product_id' :product_rec.id,'product_uom_id': uom_rec.id,'location_id':location_res.id,'product_qty':values['qty'],'inventory_id':stock_inventory.id})

            if self.valuation_state == 'validate' :

                stock_inventory.action_validate()


        elif self.file_type == 'csv' :

            file_name = str(self.file_name)
            if self.import_file:
                if '.' not in file_name:
                    raise Warning(_('Please upload valid xls or csv file.!'))
                extension = file_name.split('.')[1]
                if extension !=  'csv':
                    raise Warning(_('Please upload csv file..!'))

            csv_data = base64.b64decode(self.import_file)
            data_file = io.StringIO(csv_data.decode("utf-8"))
            data_file.seek(0)
            file_reader = []
            csv_reader = csv.reader(data_file, delimiter=',')
            product = self.env['product.product']
            values = {}
            keys = ['name','uom','location','lot','qty','ref','category','price','cost','product_ext_id','location_ext_id']
            try:
                file_reader.extend(csv_reader)
            except Exception:
                raise exceptions.Warning(_("Invalid file...!"))


            for no in range(len(file_reader)):
                warning = False
                if no!= 0:
                        val = {}
                        try:
                             field = list(map(str, file_reader[no]))
                        except ValueError:
                             raise exceptions.Warning(_("Dont Use Charecter only use numbers"))

                        values = dict(zip(keys, field))


                        if values :
                            product_rec = False
                            if self.import_prod_option == 'name' :

                                product_rec = product.search([('name', '=',
                                                            values['name'])],limit=1)

                                if not product_rec and self.create_product == False:
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values['name'] + 'Product is not available.','validation_id' : validate_res.id})

                                    else :
                                        raise Warning(_('"%s" Product is not available.')%(values['name']))

                                if not product_rec and self.create_product == True:
                                    category = self.env['product.category'].search([('name','=',values['category'])],limit=1)
                                    
                                    if not category :
                                        category = self.env['product.category'].create({'name' :values['category'] })
                                    if values['lot'] :
                                        product_rec = product.create({'name' : values['name'],'categ_id' :category.id ,'default_code' : values['ref'],'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost'] })

                                    else :
                                        product_rec = product.create({'name' : values['name'],'categ_id' :category.id ,'default_code' : values['ref'],'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})


                            if self.import_prod_option == 'barcode':

                                product_rec = product.search([('barcode', '=',
                                                                values['name'])],limit=1)

                                if not product_rec and self.create_product == False:
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values['name'] + 'Product is not available for this barcode.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('"%s" Product is not available for this barcode.')%(values['name']))

                                if not product_rec and self.create_product == True:
                                    category = self.env['product.category'].search([('name','=',values['category'])],limit=1)
                                    
                                    if not category :
                                        category = self.env['product.category'].create({'name' :values['category'] })
                                    if values['lot'] :
                                        product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'barcode' : values['name'],'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost']})

                                    else :
                                        product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'barcode' : values['name'],'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})



                            if self.import_prod_option == 'ref':

                                product_rec = product.search([('default_code', '=',
                                                                values['name'])],limit=1)

                                if not product_rec and self.create_product == False:
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values['name'] + 'Product is not available for this internal reference.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('"%s" Product is not available for this internal reference  .')%(values['name']))


                                if not product_rec and self.create_product == True:
                                    category = self.env['product.category'].search([('name','=',values['category'])],limit=1)
                                    
                                    if not category :
                                        category = self.env['product.category'].create({'name' :values['category'] })
                                    if values['lot'] :
                                        product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'default_code' : values['name'],'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost']})

                                    else :
                                        product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'default_code' : values['name'],'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})

                            if self.import_prod_option == 'external':
                                if self.file_name not in file_name_list:
                                    raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))
                                else:

                                    if values.get('product_ext_id'):
                                        product_rec = self.env.ref(values.get('product_ext_id'))
                                    else:
                                        product_rec = False

                                    if not product_rec and self.create_product == False:
                                        if self.skip_validation == 'skip':
                                            warning = True
                                            self.env['import.validation.line'].create({'element' :"("+ values['name'] + ') Product is not available for this external id.','validation_id' : validate_res.id})
                                        else :
                                            raise Warning(_('Product is not available for this (%s) external id...!')%product_rec)


                                    if not product_rec and self.create_product == True:
                                        category = self.env['product.category'].search([('name','=',values['category'])],limit=1)

                                        if not category :
                                            category = self.env['product.category'].create({'name' :values['category'] })
                                        if values['lot'] :
                                            product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'type' : 'product','tracking' : 'lot','lst_price' : values['price'],'standard_price' :values['cost']})

                                        else :
                                            product_rec = product.create({'name' : values['ref'],'categ_id' :category.id ,'type' : 'product','lst_price' : values['price'],'standard_price' :values['cost']})

                        
                        
                            uom_rec = self.env['uom.uom'].search([('name','=',values['uom'])],limit=1)
                            
                            if not uom_rec :
                                if self.skip_validation == 'skip' :
                                    warning = True
                                    self.env['import.validation.line'].create({'element' : values['uom'] + ' Uom is not available.','validation_id' : validate_res.id})
                                else :

                                    raise Warning(_('"%s" Uom is not available.')%(values['uom']))



                            location_res =False
                            if self.location_option == 'name' :
                                location_res = self.env['stock.location'].search([('name','=',values['location']),('company_id','=',company_id.id)],limit=1)


                                if not location_res :
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values['location'] + 'Location is not available.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('"%s" Location is not available.')%(values['location']))
                            

                            if self.location_option == 'barcode' :

                                location_res = self.env['stock.location'].search([('barcode','=',values['location']),('company_id','=',company_id.id)],limit=1)


                                if not location_res :
                                    if self.skip_validation == 'skip' :
                                        warning = True
                                        self.env['import.validation.line'].create({'element' : values['location'] + ' Location is not available for this barcode.','validation_id' : validate_res.id})
                                    else :
                                        raise Warning(_('"%s" Location is not available for this barcode.')%(values['location']))
                            
                            if self.location_option == 'external' :

                                if self.file_name not in file_name_list:
                                    raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))
                                else:

                                    if values.get('location_ext_id'):
                                        location_res = self.env.ref(values.get('location_ext_id'))
                                    else:
                                        location_res = False

                                    if not location_res :
                                        if self.skip_validation == 'skip' :
                                            warning = True
                                            self.env['import.validation.line'].create({'element' : str(location_res) + ' Location is not available for this external id.','validation_id' : validate_res.id})
                                        else :
                                            raise Warning(_('Location is not available for this (%s) external id.')%(location_res))


                            if self.import_prod_option == 'external':

                                if self.file_name not in file_name_list:
                                    raise Warning(_('Please upload (with_external_id.csv) or (with_external_id.xls) file..!'))

                                else:
                                    if values.get('location_ext_id'):
                                        location_res = self.env.ref(values.get('location_ext_id'))
                                    else:
                                        location_res = False

                                    if not location_res :
                                        if self.skip_validation == 'skip' :
                                            warning = True
                                            self.env['import.validation.line'].create({'element' : str(values.get('location_ext_id')) + ' Location is not available for this external id.','validation_id' : validate_res.id})
                                        else :
                                            raise Warning(_('"%s" Location is not available for this external id.')%(str(values.get('location_ext_id'))))
                                                 
                            if warning == True :
                                flag = True
                                continue
                            lot_num_rec = False
                            if product_rec:
                                if product_rec.tracking != 'none':

                                    lot_num_rec = self.env['stock.production.lot'].search([('name','=',values['lot'])],limit=1)

                                    if not lot_num_rec :

                                        lot_num_rec = self.env['stock.production.lot'].create({'name': values['lot'],'product_id':product_rec.id , 'company_id': self.env['res.users'].browse(self.env.uid).partner_id.company_id.id })

                            if lot_num_rec : 
                                self.env['stock.inventory.line'].create({'product_id' :product_rec.id,'product_uom_id': uom_rec.id,'location_id':location_res.id,'prod_lot_id':lot_num_rec.id,'product_qty':values['qty'],'inventory_id':stock_inventory.id})
                            else :
                                self.env['stock.inventory.line'].create({'product_id' :product_rec.id,'product_uom_id': uom_rec.id,'location_id':location_res.id,'product_qty':values['qty'],'inventory_id':stock_inventory.id})

                            if self.valuation_state == 'validate' :

                                stock_inventory.action_validate()

        if flag == True :
            return {
                            'view_mode': 'form',
                            'res_id': validate_res.id,
                            'res_model': 'import.validation',
                            'type': 'ir.actions.act_window',
                            'target':'new'
                    }
