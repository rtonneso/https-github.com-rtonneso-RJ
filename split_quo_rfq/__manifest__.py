# -*- coding: utf-8 -*-
{
    "name" : "Split Quotation, Sales Order And RFQ, Purchase Order",
    "author" : "Softhealer Technologies",
    "website": "http://www.softhealer.com",
    "support": "info@softhealer.com",    
    "category": "Sales",
	"summary": """split purchase order lines app, extract po module, extract rfq, split purchase order, extract request for quotation, split sale order lines, extract so, extract quote, split sale order, extract quotation odoo""",
        
    "description": """split function helpful to split selected order lines and create new quotations and remove selected lines from the existing order. Extract function helpful to extract sale order lines without removing from the existing order.""",    
    "version":"13.0.1",
    "depends" : ["base","sale","purchase","sale_management"],
    "application" : True,
    "data" : [
        
              "security/split_quo_security.xml",        
              "views/split_view.xml",
            
            ],            
    "images": ["static/description/background.jpg",],  
    "live_test_url": "https://youtu.be/QhLWC8xv8PM",            
    "auto_install":False,
    "installable" : True,
    "price": 22,
    "currency": "EUR"    
}
