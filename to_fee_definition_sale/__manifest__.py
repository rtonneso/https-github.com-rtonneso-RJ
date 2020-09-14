{
    'name': "Sales Supplementary Fees",
    'name_vi_VN': "Phụ Phí Bán Hàng",

    'summary': """
Sell products and compute their supplementary fees""",
    'summary_vi_VN': """
Bán sản phẩm và phụ phí đi kèm""",
    'description': """
Key Features
============

1. Fee Definition
    * It is a document to model a fee associated a product during sales / purchases. For example, when you sell a transportation service,
    you may also want to charge the customer for road toll. In such the case, you could define your service and its associated fees as below:
        * Transportation Service X: is a service product
        * Road Toll 1: is another service product that present the Road Toll
        * On the Transportation Service X, select Road Toll 1 as a fee for the Transportation Service X
2. Fee is also a Product, hence, it is seamlessly integrated with Odoo accounting
3. Nested / Recursive Fee structure support. For example,
    * Transportation Service X may have the following fees structure:
        * Dirty Cargo handling Fee at terminals. This fee is also a product in Odoo and may have its own fees defined as below
            * Environment Protection Fee
            * Cargo Stowage fee
        * Road Toll during transportation
    * When calculating fees for the Transportation Service X, this module could offer the following:
        * Direct Fees: which are Dirty Cargo handling Fee and Road Toll
        * Sub fees: Environment Protection Fee, Cargo Stowage
        * Recursive Fees: all the above
4. supplementary fees computation on Sales Quotation
    * A new button "Compute Supplementary Fees" provided on the Sales Quotation form. When user click on the button, Odoo will find recursively 
      all the fees associated with the all the products of sales quotation and adding the into the quotation as new lines
    * Upon confirmation of the quotation (to make it a sales order), Odoo will check if Supplementary Fees have been added.
      If not, it will ask user to confirm if Supplementary Fees should be computed and added to the sales order.

Editions Supported
==================
1. Community Edition
2. Enterprise Edition

    """,
'description_vi_VN': """
Key Features
============


1. Định mức phí
    * Định nghĩa định mức phí model liên kết với sản phẩm trong quá trình mua/bán. Ví dụ, khi ta bán dịch vụ vận chuyển, thì có thể ta cần 
    thu phí đi đường của khách hàng. Trong trường hợp đó, ta có thể định nghĩa dịch vụ và liên kết nó đến định mức phí như sau:
        * Dịch vụ vận tải X: là một loại hình dịch vụ
        * Road Toll 1: Là một loại dịch vụ khác đại dịch cho phí đi đường
        * Trong dịch vụ vận chuyển X, chọn Road Toll 1 làm định mức phí của Transportation Service X
2. Phí cũng là một sản phẩm, do đó nó đã được tích hợp với module Kế toán của Odoo
3. Hỗ trợ định mức phí có chứa phí con (đệ quy), ví dụ:
    * Dịch vụ vận tải X có thể có cấu trúc phí như sau:
        * Thu phí xử lý hàng hóa không gây ô nhiễm tại bến. Phí này là một loại sản phẩm trong Odoo và nó có thể chứa các phí con của nó như sau:
            * Phí bảo vệ môi trường
            * Phí bốc dỡ hàng hóa
        * Thu phí đi đường trong khi vận chuyển
    * Khi tính các loại chi phí của dịch vụ vận tải X, module này cung cấp các tính năng sau:
        * Thu phí trực tiếp: bao gồm phí xử lý hàng hóa không gây ô nhiễm tại bến và phí vận chuyển
        * Thu các loại phí con: bao gồm phí bảo vệ môi trường, phí bốc rỡ hàng hóa
        * Phí đệ quy: bao gồm hai loại trên
4. Hỗ trợ tính phụ phí bán hàng
    * Thêm mới nút "Tính Phụ Phí" vào Hóa đơn bán hàng form. Khi ấn vào nút này, Odoo sẽ tìm và tính tất cả các phí liên kết với
      tất cả các sản phẩm của hóa đơn sau đó thêm vào hóa đơn trên một dòng.
    * Sau khi xác nhận hóa đơn (để tạo đơn hàng), Odoo kiểm tra nếu phụ phí đã được thêm hay chưa.
      Nếu chưa, Odoo sẽ hỏi người dùng xác nhận để tính toán phụ phí và thêm vào đơn hàng.
      
Ấn bản hỗ trợ
=============
1. Ấn bản cộng đồng
2. Ấn bản doanh nghiệp

    """,

    'author': 'T.V.T Marine Automation (aka TVTMA)',
    'website': 'https://www.tvtmarine.com',
    'live_test_url': 'https://v13demo-int.erponline.vn',
    'support': 'support@ma.tvtmarine.com',

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': 'Sales',
    'version': '1.0.0',

    # any module necessary for this one to work correctly
    'depends': ['sale', 'to_fee_definition'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/fee_definition_views.xml',
        'views/product_template_views.xml',
        'views/sale_order_views.xml',
        'wizard/sale_immediate_confirm_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': True,
    'price': 45.9,
    'currency': 'EUR',
    'license': 'OPL-1',
}
