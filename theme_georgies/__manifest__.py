{
  'name':'Georgies.com',
  'description': 'Georgies.com theme by Lichen',
  'category': 'Theme/Website',
  'version':'1.7',
  'author':'Lichen',
  'summary': 'Art, Ceramics',
  'sequence': 110,
  'data': [
      'views/layout.xml',
      'views/shop.xml',
      'views/events.xml',
      'views/blog.xml',
      'views/assets.xml',
      'views/snippets-georgies.xml',
      'views/snippets-odoo.xml',
      'views/records.xml',
      'views/distributor-locations.xml',
      'views/store-locations.xml'
  ],
  'images': [
    'static/description/georgies_screenshot.jpg'
  ],
  'installable': True,
  'auto_install': False,
  'depends': [
    'website',
    'website_sale',
    'website_blog',
    'website_event',
    'website_event_sale',
  ],
  'license': 'LGPL-3',
}
