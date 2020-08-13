# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Import Stock Inventory from Excel/CSV File',
    'version': '13.0.0.0',
    'sequence': 4,
    'summary': 'App helps to import stock inventory adjustment import inventory adjustment import product stock import opening stock import stock with lot import serial import inventory data import stock balance import stock with lot data import stock with Serial number',
    "price": 22,
    "currency": 'EUR',
    'category' : 'Warehouse',
    'description': """
	BrowseInfo developed a new odoo/OpenERP module apps.
	This module is useful for import inventory adjustment from Excel and CSV file.
        Its also usefull for import opening stock balance from XLS or CSV file.
	-Import Stock from CSV and Excel file.
        -Import Stock inventory from CSV and Excel file.
	-Import inventory adjustment, import stock balance
	-Import opening stock balance from CSV and Excel file.
        Import stock with Serial number import
    Import stock with lot number import
    import lot number with stock import
    import serial number with stock import
    import lines import
    import order lines import
    import orders lines import
    import so lines import
    imporr po lines import
	-Inventory import from CSV, stock import from CSV, Inventory adjustment import, Opening stock import. Import warehouse stock, Import product stock.Manage Inventory
    -import inventory data, import stock data, import opening stock.
	-Import inventory lines, inventory import, stock import from excel, warehouse data import, import stock data, stock balance import. excel import
	-Stock import from CSV, easy stock import, import stock easy, inventory adjustment import from excel
 Odoo import transfer import stock transfer import receipt import odoo import stock transfers import tranfers
Este módulo é útil para importar o ajuste do inventário a partir do arquivo Excel e CSV. Também é útil para importar o saldo do estoque de abertura do arquivo XLS ou CSV.-Importar estoque do arquivo CSV e Excel. - Inventário de inventário de estoque do arquivo CSV e Excel.- Ajuste de estoque de importação, saldo de estoque de importação- Importe o saldo do estoque inicial do arquivo CSV e Excel.- Importação de inventário de CSV, importação de estoque de CSV, importação de ajuste de estoque, importação de estoque de abertura. Estoque de armazém de importação, estoque de produtos de importação. Inventário de armazenamento - importar dados de inventário, importar dados de estoque, importar estoque de abertura.- Importação de linhas de inventário, importação de estoque, importação de estoque de excel, importação de dados de armazém, importação de dados de estoque, importação de saldo de estoque. importação de excel-Stock importação de CSV, importação de estoque fácil, estoque de importação fácil, importação de ajuste de inventário de excel

Este módulo es útil para importar ajustes de inventario desde archivos Excel y CSV.
         También es útil para la importación de saldo de stock de apertura de archivo XLS o CSV.
-Importar Stock desde CSV y archivo de Excel.
         Inventario de acciones de archivo CSV y Excel.
- Ajuste de inventario de importación, balance de stock de importación
-Importar la apertura de stock de CSV y archivo de Excel.
- Inventario importado de CSV, importación de stock desde CSV, importación de ajuste de inventario, apertura de stock de importación. Importar stock de almacén, Importar stock de producto. Gestionar inventario
     -importe datos de inventario, importe datos de stock, importe existencias de apertura.
- Importación de líneas de inventario, importación de inventario, importación de existencias desde Excel, importación de datos de almacén, importación de datos de stock, importación de saldo de stock. excel importación
- Importación de stock desde CSV, fácil importación de stock, importación fácil, ajuste de inventario importado de excel
هذه الوحدة مفيدة في تعديل المخزون الاستيراد من ملف Excel و CSV.
         لها أيضا مفيدة لتوازن رصيد فتح الواردات من ملف XLS أو CSV.
-استيراد الأسهم من ملف CSV و Excel.
         -استيراد مخزون المخزون من ملف CSV و Excel.
-مستوى الجرد الاستيراد ، رصيد المخزون الاستيراد
-استيراد رصيد المخزون الافتتاحي من ملف CSV و Excel.
الاستيراد -Inventory من CSV ، استيراد الأوراق المالية من CSV ، استيراد تعديل المخزون ، فتح استيراد المخزون. استيراد مخزون المستودع ، استيراد مخزون المنتجات. إدارة المخزون
     - بيانات جرد المخزون ، وبيانات مخزون الواردات ، ومخزون فتح الواردات.
خطوط استيراد -Amport ، استيراد المخزون ، استيراد الأوراق المالية من اكسل ، واستيراد البيانات مستودع ، وبيانات المخزون الاستيراد ، واردات المخزون المخزون. التفوق الاستيراد
استيراد -Stock من CSV ، من السهل استيراد الأوراق المالية ، واستيراد الأسهم سهلة ، استيراد تعديل المخزون من التفوق




Ce module est utile pour l'ajustement de l'inventaire d'importation à partir de fichiers Excel et CSV.
         Il est également utile pour importer le solde du stock d'ouverture à partir du fichier XLS ou CSV.
-Import Stock à partir de fichiers CSV et Excel.
         -Import Stock d'inventaire à partir de fichiers CSV et Excel.
-Ajustement de l'inventaire des importations, importation du solde du stock
- Importer le solde du stock d'ouverture du fichier CSV et Excel.
-Inventaire d'importation de CSV, importation d'actions de CSV, importation d'ajustement d'inventaire, importation d'actions d'ouverture. Stock d'entrepôt d'importation, Stock de produit d'importation. Gérer l'inventaire
     -importer des données d'inventaire, importer des données de stock, importer des actions d'ouverture.
-Importation des lignes d'inventaire, l'importation des stocks, l'importation des stocks d'Excel, l'importation de données d'entrepôt, l'importation de données sur les stocks, l'importation de solde stock. importation Excel
-Stock importation de CSV, importation de stock facile, importation stock facile, importation d'ajustement de l'inventaire d'Excel
    """,
    'author': 'BrowseInfo',
    'website': 'http://www.browseinfo.in',
    'live_test_url':'https://youtu.be/LjkXeaXjwAQ',
    'depends': ['base','stock'],
    'data': [
            "security/ir.model.access.csv",
            "security/excess_right.xml",
            "views/stock_view.xml",

             ],
	'qweb': [
		],
    'demo': [],
    'test': [],
    'installable': True,
    'auto_install': False,
    "images":['static/description/Banner.png'],
}
