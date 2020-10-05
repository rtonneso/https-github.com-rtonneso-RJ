odoo.define('bi_pos_import_sale.import_sale', function(require) {
	"use strict";

	var models = require('point_of_sale.models');
	var screens = require('point_of_sale.screens');
	var core = require('web.core');
	var gui = require('point_of_sale.gui');
	var popups = require('point_of_sale.popups');
	var QWeb = core.qweb;	
	var utils = require('web.utils');
	var round_pr = utils.round_precision;
	var rpc = require('web.rpc');
	var _t = core._t;

	// Load Models
	models.load_models({
		model:  'sale.order',
		fields: ['name','partner_id','user_id','amount_untaxed','state',
				 'order_line','amount_tax','amount_total','company_id','date_order'],
		domain: function(self) 
				{
					var days = self.config.load_orders_days
					if(days > 0)
					{
						var today= new Date();
						today.setDate(today.getDate() - days);
						var dd = today.getDate();
						var mm = today.getMonth()+1; //January is 0!

						var yyyy = today.getFullYear();
						if(dd<10){
							dd='0'+dd;
						} 
						if(mm<10){
							mm='0'+mm;
						} 
						var today = yyyy+'-'+mm+'-'+dd+" "+ "00" + ":" + "00" + ":" + "00";
						return [['date_order', '>=',today]];
					}					
				},
		loaded: function(self,order){
			var i=0;
			self.all_orders_list = order;
			self.get_orders_by_id = {};
			order.forEach(function(orders) {
				self.get_orders_by_id[orders.id] = orders;
			});
		},
	});

	models.load_models({
		model: 'sale.order.line',
		fields: ['order_id', 'product_id', 'discount', 'product_uom_qty', 'price_unit','price_subtotal'],
		domain: function(self) {
			var order_lines = []
			var orders = self.all_orders_list;
			for (var i = 0; i < orders.length; i++) {
				order_lines = order_lines.concat(orders[i]['order_line']);
			}
			return [
				['id', 'in', order_lines]
			];
		},
		loaded: function(self, sale_order_line) {
			self.all_orders_line_list = sale_order_line;
			self.get_lines_by_id = {};
			sale_order_line.forEach(function(line) {
				self.get_lines_by_id[line.id] = line;
			});

			self.sale_order_line = sale_order_line;
		},
	});

	var SaleOrderButtonWidget = screens.ActionButtonWidget.extend({
		template: 'SaleOrderButtonWidget',

		button_click: function() {
			var self = this;
			this.gui.show_screen('see_all_orders_screen_widget', {});
		},
	});

	screens.define_action_button({
		'name': 'See All Orders Button Widget',
		'widget': SaleOrderButtonWidget,
		'condition': function() {
			return true;
		},
	});

	// SeeAllOrdersScreenWidget start

	var SeeAllOrdersScreenWidget = screens.ScreenWidget.extend({
		template: 'SeeAllOrdersScreenWidget',
		init: function(parent, options) {
			this._super(parent, options);
			//this.options = {};
		},

		render_list_orders: function(orders, search_input){
			var self = this;			
			if(search_input != undefined && search_input != '') {
				var selected_search_orders = [];
				var search_text = search_input.toLowerCase()
				for (var i = 0; i < orders.length; i++) {
					if (orders[i].partner_id == '') {
						orders[i].partner_id = [0, '-'];
					}
					if (((orders[i].name.toLowerCase()).indexOf(search_text) != -1) || ((orders[i].name.toLowerCase()).indexOf(search_text) != -1) || ((orders[i].partner_id[1].toLowerCase()).indexOf(search_text) != -1)) {
						selected_search_orders = selected_search_orders.concat(orders[i]);
					}
				}
				orders = selected_search_orders;
			}
			
			var content = this.$el[0].querySelector('.client-list-contents');
			content.innerHTML = "";
			var orders = orders;
			for(var i = 0, len = Math.min(orders.length,1000); i < len; i++){
				var order    = orders[i];
				var ordersline_html = QWeb.render('OrdersLine',{widget: this, order:orders[i]});
				var ordersline = document.createElement('tbody');
				ordersline.innerHTML = ordersline_html;
				ordersline = ordersline.childNodes[1];
				content.appendChild(ordersline);
			}
		},

		get_last_day_orders: function () {
			var days = this.pos.config.load_orders_days					
			var today= new Date();
			today.setDate(today.getDate() - days);
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!

			var yyyy = today.getFullYear();
			if(dd<10){
				dd='0'+dd;
			} 
			if(mm<10){
				mm='0'+mm;
			} 
			var today = yyyy+'-'+mm+'-'+dd+" "+ "00" + ":" + "00" + ":" + "00";
			return today
		},
		
		show: function(options) {
			var self = this;
			this._super(options);
			this.old_sale_order = null;
			this.details_visible = false;
			var flag = 0;
			var orders = self.pos.all_orders_list;
			var orders_lines = self.pos.all_orders_line_list;
			var selectedOrder;
			this.render_list_orders(orders, undefined);
			var l_date = self.get_last_day_orders();
			var config_id = this.pos.config.id
			$('.refresh-order').on('click',function () {
				rpc.query({
					model: 'pos.order',
					method: 'search_all_sale_order',
					args: [1,config_id,l_date],
				}).then(function(output) {
					self.pos.all_orders_list = output
					orders = output;
					var so = output;
					rpc.query({
						model: 'pos.order',
						method: 'sale_order_line',
						args: [1],
					}).then(function(output1) {
						self.pos.all_orders_line_list = output1
						orders_lines = output1
						// self.show();
						self.render_list_orders(so,undefined);
					});
				});
			});

			
			var selectedorderlines = [];
			var client = false
			
			this.$('.back').click(function(){
				self.gui.show_screen('products');
			});
			this.$('.client-list-contents').delegate('.sale-order','click',function(event){

				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				var order_line_data = self.pos.db.all_orders_line_list;
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});
				self.gui.show_popup('sale_order_popup_widget', { 'orderlines': orderlines, 'order': selectedOrder });
				
			});


			this.$('.client-list-contents').delegate('.orders-line-name', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
			
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});

			this.$('.client-list-contents').delegate('.orders-line-date', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});

			this.$('.client-list-contents').delegate('.orders-line-partner', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});

			this.$('.client-list-contents').delegate('.orders-line-saleperson', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});

			this.$('.client-list-contents').delegate('.orders-line-subtotal', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});
			
			this.$('.client-list-contents').delegate('.orders-line-tax', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});

			this.$('.client-list-contents').delegate('.orders-line-tot', 'click', function(event) {
				var order_id = parseInt(this.id);
				selectedOrder = null;
				for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
					if (orders[i] && orders[i].id == order_id) {
						selectedOrder = orders[i];
					}
				}
				var orderlines = [];
				
				selectedOrder.order_line.forEach(function(line_id) {
					
					for(var y=0; y<orders_lines.length; y++){
						if(orders_lines[y]['id'] == line_id){
						   orderlines.push(orders_lines[y]); 
						}
					}
		
				});

				self.gui.show_popup('see_order_details_popup_widget', {'orderline': orderlines, 'order': [selectedOrder] });
				
			});




			//this code is for Search Orders
			this.$('.search-order input').keyup(function() {
				self.render_list_orders(orders, this.value);
			});
			
		},	   
	});
	gui.define_screen({
		name: 'see_all_orders_screen_widget',
		widget: SeeAllOrdersScreenWidget
	});

	var SaleOrderPopupWidget = popups.extend({
		template: 'SaleOrderPopupWidget',
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},
		//
		show: function(options) {
			options = options || {};
			var self = this;
			this._super(options);
			this.orderlines = options.orderlines || [];

		},
		//
		renderElement: function() {
			var self = this;
			this._super();
			var selectedOrder = this.pos.get_order();
			var orderlines = self.options.orderlines;
			var order = self.options.order;
			// When you click on apply button, Customer is selected automatically in that order 
			var partner_id = false
			var client = false
			if (order && order.partner_id != null)
				partner_id = order.partner_id[0];
				client = this.pos.db.get_partner_by_id(partner_id);
				
			var reorder_products = {};

			this.$('#apply_order').click(function() {
				var entered_code = $("#entered_item_qty").val();
				var list_of_qty = $('.entered_item_qty');

				$.each(list_of_qty, function(index,value) {
					var entered_item_qty = $(value).find('input');
					var qty_id = parseFloat(entered_item_qty.attr('qty-id'));
					var line_id = parseFloat(entered_item_qty.attr('line-id'));
					var entered_qty = parseFloat(entered_item_qty.val());

					reorder_products[line_id] = entered_qty;
				});

				for(var i in reorder_products)
				{	
					var orders_lines = self.pos.all_orders_line_list;
					for(var n=0; n < orders_lines.length; n++)
					{
					   if (orders_lines[n]['id'] == i)
					   {
							var product = self.pos.db.get_product_by_id(orders_lines[n].product_id[0]);
							if(product)
							{
								if(reorder_products[i]>0)
								{
									selectedOrder.add_product(product, {
										quantity: parseFloat(reorder_products[i]),
										price: orders_lines[n].price_unit,
										discount: orders_lines[n].discount
									});
									selectedOrder.selected_orderline.original_line_id = orders_lines[n].id;
									selectedOrder.set_client(client);
									self.pos.set_order(selectedOrder);
								}
							}
							else{
								alert("please configure product for point of sale.");
								return;
							}
					   }
					}
				}
					
				self.gui.show_screen('products');
			   });
		},
	});

	gui.define_popup({
		name: 'sale_order_popup_widget',
		widget: SaleOrderPopupWidget
	});

	var SeeOrderDetailsPopupWidget = popups.extend({
		template: 'SeeOrderDetailsPopupWidget',
		
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},
		
		show: function(options) {
			var self = this;
			options = options || {};
			this._super(options);
			
			
			this.order = options.order || [];
			this.orderline = options.orderline || [];
						
		},
		
		events: {
			'click .button.cancel': 'click_cancel',
		},

		renderElement: function() {
			var self = this;
			this._super();  
		},
	});

	gui.define_popup({
		name: 'see_order_details_popup_widget',
		widget: SeeOrderDetailsPopupWidget
	});

	return {
		SaleOrderButtonWidget: SaleOrderButtonWidget,
		SeeAllOrdersScreenWidget: SeeAllOrdersScreenWidget,
		SaleOrderPopupWidget: SaleOrderPopupWidget,
		SeeOrderDetailsPopupWidget: SeeOrderDetailsPopupWidget,
	};
});
