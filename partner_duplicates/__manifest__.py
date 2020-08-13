# -*- coding: utf-8 -*-
{
    "name": "Contacts Duplicates Real Time Search",
    "version": "13.0.2.0.2",
    "category": "Extra Tools",
    "author": "Odoo Tools",
    "website": "https://odootools.com/apps/13.0/contacts-duplicates-real-time-search-384",
    "license": "Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False,
    "depends": [
        "contacts"
    ],
    "data": [
        "views/res_config_settings.xml",
        "views/res_partner_view.xml",
        "data/data.xml",
        "security/ir.model.access.csv"
    ],
    "qweb": [
        
    ],
    "js": [
        
    ],
    "demo": [
        
    ],
    "external_dependencies": {},
    "summary": "The tool for real-time control of contacts' duplicates",
    "description": """

For the full details look at static/description/index.html

* Features * 

- Real-time duplicates search

- Configurable duplicates' criteria

- Rigid or soft duplicates

- Compatible with Odoo standard features
 
* Extra Notes *

- Performance issues

- How rules work


    """,
    "images": [
        "static/description/main.png"
    ],
    "price": "86.0",
    "currency": "EUR",
    "live_test_url": "https://odootools.com/my/tickets/newticket?&url_app_id=13&ticket_version=13.0&url_type_id=3",
}