odoo.define('bi_pos_so_extended.pos_extended', function(require) {
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
	// var create_sale_js = require('pos_create_sales_order.pos');
	var import_sale_js = require('bi_pos_import_sale.import_sale');

	var _super_posmodel = models.PosModel.prototype;
	models.PosModel = models.PosModel.extend({
		initialize: function (session, attributes) {
			var partner_model = _.find(this.models, function(model){ return model.model === 'res.partner'; });
			partner_model.fields.push('child_ids');
			return _super_posmodel.initialize.call(this, session, attributes);
		},
	});

	var CreateSalesOrderButtonWidget = screens.ActionButtonWidget.extend({
		template: 'CreateSalesOrderButtonWidget',
		
		renderElement: function(){
			var self = this;
			this._super();
			var order = self.pos.get('selectedOrder');
			var orderlines = order.orderlines;
			this.$el.click(function(){
				var partner_id = false
				var child_list = [];
				var client;
				var child_name = [];
				if (order.get_client() != null)
				{
					client = order.get_client();
					partner_id = order.get_client().id;

					child_list.push(order.get_client())
					child_name.push({
						id:partner_id,
						name:order.get_client().name,
					})
					client.child_ids.forEach(function (child) {
						var partner = self.pos.db.get_partner_by_id(child);
						if(partner){
							child_name.push({
								id: child,
								name:partner.name,
							})
							child_list.push(partner);
						}
						
					});
				}

				if (!partner_id)
				{
					self.gui.show_popup('error', {
						'title': _t('Unknown customer'),
						'body': _t('You cannot Create Sales Order. Select customer first.'),
					});
					return;
				}
				else if (orderlines.length === 0) 
				{
					self.gui.show_popup('error', {
						'title': _t('Empty Order'),
						'body': _t('There must be at least one product in your order before Create Sales Order.'),
					});
					return;
				}
				else{
					self.gui.show_popup('create_sale_order', {'client': client,'child_list':child_list,'child_name':child_name});
				}
			});
		},
		
		button_click: function(){},
			highlight: function(highlight){
			this.$el.toggleClass('highlight',!!highlight);
		},
		
	});

	screens.define_action_button({
		'name': 'Create Sales Order Button Widget',
		'widget': CreateSalesOrderButtonWidget,
		'condition': function() {
			return true;
		},
	});

	var OpenSaleOrderPopupWidget = popups.extend({
		template: 'OpenSaleOrderPopupWidget',
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},

		renderElement: function() {
			var self = this;
			this._super();
			this.sale_order = self.options.sale_order;
			this.sale_order_id = parseInt(self.options.sale_order_id);
			// $('#created_sales_order').on('click', function(){

			// 	self.do_action({
			// 		name: 'Sale Order',
			// 		res_model: 'sale.order',
			// 		res_id: self.sale_order_id,
			// 		views: [[false, 'form']],
			// 		type: 'ir.actions.act_window',
			// 		// view_type: 'form',
			// 		// view_mode: 'form',
			// 		target: 'new',
			// 	});
			// });
		},

	});
	gui.define_popup({name:'open_sale_order', widget: OpenSaleOrderPopupWidget});


	var CreateSaleOrderPopupWidget = popups.extend({
		template: 'CreateSaleOrderPopupWidget',
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},

		events: {
			'click .button.clear': 'click_clear',
			'click .button.cancel': 'click_cancel',
			'click .button.create': 'click_create',

		},

		renderElement: function() {
			var self = this;
			this._super();
			var order = this.pos.get_order();
			this.client = self.options.client;
			this.child_list = self.options.child_list;
			this.child_name = self.options.child_name;
			this.$('.delivery-detail').hide();
			this.$('.invoice-detail').hide();

			$('#form1,#apply_shipping_address').click(function() {
				if ($('#apply_shipping_address').is(':checked')) {
					$('#apply_shipping_address').prop('checked', false);
				}
				else{
					$('#apply_shipping_address').prop('checked', true);
				}
				if ($('#apply_shipping_address').is(':checked')) {
					$('.delivery-detail').show();
				} else {
					$('.delivery-detail').hide();
				}
			});

			$('#form2,#apply_invoice_address').click(function() {
				if ($('#apply_invoice_address').is(':checked')) {
					$('#apply_invoice_address').prop('checked', false);
				}
				else{
					$('#apply_invoice_address').prop('checked', true);
				}
				if ($('#apply_invoice_address').is(':checked')) {
					$('.invoice-detail').show();
				} else {
					$('.invoice-detail').hide();
				}
			});

			$('#bcPaint').bcPaint();
			$('body').on('click', '#bcPaint-reset', function(){
				$.fn.bcPaint.clearCanvas();
			});
		},

		get_orderline_data: function() {
			var order = this.pos.get_order();
			var orderlines = order.orderlines.models;
			var all_lines = [];
			for (var i = 0; i < orderlines.length; i++) {
				var line = orderlines[i]
				if (line && line.product && line.quantity !== undefined) {
					all_lines.push({
						'product_id': line.product.id,
						'qty': line.quantity,
						'price': line.get_display_price() / line.quantity,
					})
				}
			}
			return all_lines
		},

		validate_diffrent_shipping_address: function(shipping_fields){
			var is_valid= 0;
			if ($('#apply_shipping_address').is(':checked')) {
				if(shipping_fields.d_name == false){
					alert('please add name for diffrent shipping address')
					is_valid +=1;
					return is_valid
				}
				else if(shipping_fields.mobile == false){
					alert('please add contact number for diffrent shipping address')
					is_valid +=1;
					return is_valid
				}
				else if(shipping_fields.street == false){
					alert('please add address for diffrent shipping address')
					is_valid +=1;
					return is_valid
				}
				else if(shipping_fields.zip == false){
					alert('please add zipcode for diffrent shipping address')
					is_valid +=1;
					return is_valid
				}
				else{
					return is_valid
				}
			}
			else{
					return is_valid
				}
		},

		validate_diffrent_invoice_address: function(invoice_fields){
			var is_valid= 0;
			if ($('#apply_invoice_address').is(':checked')) {
				if(invoice_fields.d_name == false){
					alert('please add name for diffrent invoice address')
					is_valid +=1;
					return is_valid
				}
				else if(invoice_fields.mobile == false){
					alert('please add contact number for diffrent invoice address')
					is_valid +=1;
					return is_valid
				}
				else if(invoice_fields.street == false){
					alert('please add address for diffrent invoice address')
					is_valid +=1;
					return is_valid
				}
				else if(invoice_fields.zip == false){
					alert('please add zipcode for diffrent invoice address')
					is_valid +=1;
					return is_valid
				}
				else{
					return is_valid
				}
			}
			else{
					return is_valid
				}
		},

		click_create: function(){
			var self = this;
			var order = this.pos.get_order();
			var order_lines = self.get_orderline_data();
			var partner = order.get_client();
			var current_user = self.pos.get_cashier().user_id[0];
			var selected_warehouse = self.pos.config.sale_warehouse_id;
			var warehouse_id = false;
			if(selected_warehouse)
			{
				warehouse_id  =selected_warehouse[0];
			}
			var shipping_fields = {};
			this.$('.detail').each(function(idx, el){
				shipping_fields[el.name] = el.value || false;
			});
			var invoice_fields = {};
			this.$('.inv_detail').each(function(idx, el){
				invoice_fields[el.name] = el.value || false;
			});

			var is_other_shipping_valid = self.validate_diffrent_invoice_address(invoice_fields);
			var is_other_invoice_valid = self.validate_diffrent_shipping_address(shipping_fields);

			var sign_img = $.fn.bcPaint.get_image_data();
			var extra_note = $.trim($("#extra_note").val());
			var shipping_person_id = $(".shipping_person_id").val();
			var invoice_person_id = $(".invoice_person_id").val();
			var other_shipping_addrs = $("#apply_shipping_address").is(':checked') ? true : false;
			var other_invoice_addrs = $("#apply_invoice_address").is(':checked') ? true : false;
			var result = {
				'shipping_data': shipping_fields,
				'invoice_data': invoice_fields,
				'shipping_person_id' : shipping_person_id,
				'invoice_person_id': invoice_person_id,
				'extra_note' : extra_note,
				'sign_img':sign_img,
				'line_data' : order_lines,
				'other_shipping_addrs':other_shipping_addrs,
				'other_invoice_addrs':other_invoice_addrs,
				'partner': partner,
				'warehouse_id': warehouse_id,
				'state': self.pos.config.sale_state || 'draft',
				'user_id':current_user,
			}

			if(is_other_shipping_valid == 0 && is_other_invoice_valid == 0)
			{
				rpc.query({
					model: 'sale.order',
					method: 'sale_order_from_ui',
					args: [result],
				})
				.then(function(data){
					self.pos.delete_current_order();
					self.gui.show_popup('open_sale_order', {'sale_order': data[1],'sale_order_id': data[0]});
				});
			}
						
			
		}, 

		click_clear: function(){
			this.$('.inv_detail').val('');
			this.$('.detail').val('');
			this.$('#extra_note').val('');
			$.fn.bcPaint.clearCanvas();
		},

	});
	gui.define_popup({name:'create_sale_order', widget: CreateSaleOrderPopupWidget});

	import_sale_js.SeeAllOrdersScreenWidget.include({

		init: function(parent, options) {
			this._super(parent, options);
			//this.options = {};
		},

		render_list_orders: function(orders, search_input){
			var self = this;	
			if(search_input != undefined && search_input != '') {
				var selected_search_orders = [];
				var search_text = search_input.toLowerCase();
				for (var i = 0; i < orders.length; i++) {
					if (orders[i].partner_id == '') {
						orders[i].partner_id = [0, '-'];
					}
					if (((orders[i].name.toLowerCase()).indexOf(search_text) != -1) || ((orders[i].state.toLowerCase()).indexOf(search_text) != -1) || ((orders[i].partner_id[1].toLowerCase()).indexOf(search_text) != -1)) {
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
		
		show: function(options){
			var self = this;
			this._super(options);
			var selectedOrder;
			var client = false;
			var state = null;
			var current_user = null;
			var orders = self.pos.all_orders_list;
			var orders_lines = self.pos.all_orders_line_list;
			this.render_list_orders(orders, undefined);
			$('#filter_order').html('');
			$('#filter_state').html('');

			$('.my-order').on('click',function () {
				current_user = self.pos.get_cashier().user_id['name'];
				self.render_list_orders(orders,current_user);
			});
			$('.state').each(function(){
				$(this).on('click',function () {
					state = $(this).attr('id');
					$('#filter_order').html('Filter By:');
					$('#filter_state').html($(this).text());
					self.render_list_orders(orders,state);
				});
			});

			$('.refresh-order').on('click',function () {
				$('#filter_order').html('');
				$('#filter_state').html('');
			});

			this.$('.client-list-contents').delegate('.print-sale-order','click',function(event){
				var order_id = parseInt(this.id);
				self.pos.chrome.do_action('bi_pos_so_extended.pos_sale_report',{additional_context:{
						active_ids:[order_id],

					}})
			});
		},
	});

});



