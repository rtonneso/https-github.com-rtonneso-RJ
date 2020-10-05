// pos_create_sales_order js
odoo.define('pos_payment.pos', function(require) {
	"use strict";

	var models = require('point_of_sale.models');
	var screens = require('point_of_sale.screens');
	var core = require('web.core');
	var gui = require('point_of_sale.gui');
	var popups = require('point_of_sale.popups');
	var chrome = require('point_of_sale.chrome');
	var PosDB = require('point_of_sale.DB');
	
	var rpc = require('web.rpc');
	var utils = require('web.utils');
	var round_pr = utils.round_precision;

	var QWeb = core.qweb;
	var _t = core._t;
	
	models.load_models({
		model:  'account.move',
		fields: ['name','partner_id','amount_total','amount_residual','amount_residual','state','type'],
		domain: [['type','=','out_invoice'], ['state','=','posted'],['invoice_payment_state','!=','paid']],
		loaded: function(self, invoices){
			self.invoices = invoices;
			
			self.get_invoices_by_id = [];
			invoices.forEach(function(invoice) {
				self.get_invoices_by_id[invoice.id] = invoice;
			});
		},
	});

	models.load_models({
		model:  'account.journal',
		fields: ['id','name','type'],
		domain: [['type','in',['cash','bank']]],
		loaded: function(self, journals){
			self.journals = journals;
		},
	});
	
	var CreatePaymentButtonWidget = screens.ActionButtonWidget.extend({
		template: 'CreatePaymentButtonWidget',
		
		renderElement: function(){
			var self = this;
			this._super();
		},
		
		button_click: function() {
			var self = this;
			
			var order = self.pos.get('selectedOrder');
			var partner_id = false
			if (order.get_client() != null)
				partner_id = order.get_client();

			var orderlines = order.orderlines;

			this.gui.show_screen('clientlist', {});
		},
		
	});
	
	gui.Gui.prototype.screen_classes.filter(function(el) { return el.name == 'clientlist'})[0].widget.include({
		display_client_details: function(visibility,partner,clickpos){
			var self = this;
			var contents = this.$('.client-details-contents');
			var parent   = this.$('.client-list').parent();
			var scroll   = parent.scrollTop();
			var height   = contents.height();

			contents.off('click','.button.edit');
			contents.off('click','.button.save');
			contents.off('click','.button.undo');
			contents.on('click','.button.edit',function(){ self.edit_client_details(partner); });
			contents.on('click','.button.save',function(){ self.save_client_details(partner); });
			contents.on('click','.button.undo',function(){ self.undo_client_details(partner); });
			this.editing_client = false;
			this.uploaded_picture = null;

			if(visibility === 'show'){
				contents.empty();
				contents.append($(QWeb.render('ClientDetails',{widget:this,partner:partner})));

				var new_height   = contents.height();

				if(!this.details_visible){
					if(clickpos < scroll + new_height + 20 ){
						parent.scrollTop( clickpos - 20 );
					}else{
						parent.scrollTop(parent.scrollTop() + new_height);
					}
				}else{
					parent.scrollTop(parent.scrollTop() - height + new_height);
				}

				this.details_visible = true;
				
				contents.on('click','.button.add-payment',function(){
					self.gui.show_popup('pos_register_payment_popup_widget', { 'partner': partner });

				});
				
				this.toggle_save_button();
			} else if (visibility === 'edit') {
				this.editing_client = true;
				contents.empty();
				contents.append($(QWeb.render('ClientDetailsEdit',{widget:this,partner:partner})));
				this.toggle_save_button();

				contents.find('.image-uploader').on('change',function(){
					self.load_image_file(event.target.files[0],function(res){
						if (res) {
							contents.find('.client-picture img, .client-picture .fa').remove();
							contents.find('.client-picture').append("<img src='"+res+"'>");
							contents.find('.detail.picture').remove();
							self.uploaded_picture = res;
						}
					});
				});
			} else if (visibility === 'hide') {
				contents.empty();
				if( height > scroll ){
					contents.css({height:height+'px'});
					contents.animate({height:0},400,function(){
						contents.css({height:''});
					});
				}else{
					parent.scrollTop( parent.scrollTop() - height);
				}
				this.details_visible = false;
				this.toggle_save_button();
			}
		},
		close: function(){
			this._super();
		},
		
	
	});
	
	var RegisterPaymentPopupWidget = popups.extend({
		template: 'RegisterPaymentPopupWidget',
		
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},

		show: function(options) {
			options = options || {};
			var self = this;
			this._super(options);
			this.partner = options.partner || [];
			this.renderElement();
		},
		
		events: {
			'click .button.confirm': 'register_payment',
			'click .button.cancel': 'click_cancel',
		},
		
		register_payment: function() {
			
			var self = this;
			var partner = this.partner;
			
			var payment_type = $('#payment_type').val();
			var entered_amount = $("#entered_amount").val();
			var entered_note = $("#entered_note").val();
			
			
			rpc.query({
						model: 'pos.create.customer.payment',
						method: 'create_customer_payment',
						args: [partner ? partner.id : 0, partner ? partner.id : 0, payment_type, entered_amount, entered_note],
					
					},{async:false}).then(function(output) {
				alert('Payment has been Registered for this Customer !!!!');

			});

			self.gui.show_screen('clientlist');
		
		},

		renderElement: function() {
			var self = this;
			this._super();
			
			var partner = this.partner;

		},

	});
	
	
	gui.define_popup({
		name: 'pos_register_payment_popup_widget',
		widget: RegisterPaymentPopupWidget
	});

	screens.define_action_button({
		'name': 'Create Payment Button Widget',
		'widget': CreatePaymentButtonWidget,
		'condition': function() {
			return true;
		},
	});
	
	var _super_posmodel = models.PosModel.prototype;
	models.PosModel = models.PosModel.extend({
		load_new_invoices: function(){
			var self = this;
			var def  = new $.Deferred();
			var fields = _.find(this.models,function(model){ return model.model === 'account.move'; }).fields;
			var domain = [['type','=','out_invoice'], ['state','=','posted']];

		rpc.query({
				model: 'account.move',
				method: 'search_read',
				args: [domain, fields],
			}, {
				timeout: 3000,
				shadow: true,
			})
			.then(function(products){
					if (self.db.invoices) {   
						def.resolve();
					} else {
						def.reject();
					}
				}, function(err,event){ event.preventDefault(); def.reject(); });
			return def;
		},
			
	});

	var PosDB=PosDB.extend({
			
		init: function(options){
			this.invoice_sorted = [];
			this.invoice_by_id = {};
			this.invoice_search_string = "";
			this.invoice_write_date = null;
			return PosDB.prototype.init.call(this, options);
		},
	
	
		get_invoices_sorted: function(max_count){
			max_count = max_count ? Math.min(this.invoice_sorted.length, max_count) : this.invoice_sorted.length;
			var invoice = [];
			for (var i = 0; i < max_count; i++) {
				invoices.push(this.invoice_by_id[this.invoice_sorted[i]]);
			}
			return invoices;
		},
					
		get_product_write_date:function(products){
			return this.invoice_write_date || "1970-01-01 00:00:00";
		},
	});

	var SeeAllInvoicesScreenWidget = screens.ScreenWidget.extend({
		template: 'SeeAllInvoicesScreenWidget',
		
		init: function(parent, options) {
			this._super(parent, options);
		},
		auto_back: true,
		
		show: function(options) {
			var self = this;
			this._super(options);
			
			this.details_visible = false;
			
			var invoices = self.pos.invoices;
			this.render_list_invoices(invoices, undefined);
					
			this.$('.back').click(function(){	
				var idd = $(".products-line.highlight").data('id');
				var invoices = self.pos.get_invoices_by_id[idd];
				self.display_invoices_detail('hide',invoices);
				$(".products-line.highlight").removeClass('highlight');
				self.gui.show_screen('products');
			});

			this.$('.new-product').click(function(){
				self.display_invoices_detail('edit',{
					'country_id': self.pos.company.country_id,
				});
			});

			this.reload_invoices();

			if( this.old_product ){
				this.display_invoices_detail('show',this.old_product,0);
			}
			
			$('.invoices-list-contents').off("click").on("click", ".products-line", function(event) {
				event.stopPropagation();
				event.preventDefault();
				self.line_selects(event,$(this),parseInt($(this).data('id')));
			});
			
			this.$('.search-invoice input').keyup(function() {
				self.render_list_invoices(invoices, this.value);
			});		
		},
		
		hide: function () {
			this._super();
			this.new_invoice = null;
		},       

		render_list_invoices: function(invoices, search_input){
		   var self = this;
		   if (search_input != undefined && search_input != '') {
				var selected_search_invoices = [];
				var search_text = search_input.toLowerCase()
				for (var i = 0; i < invoices.length; i++) {
					if (invoices[i].display_name == '') {
						invoices[i].display_name = [0, '-'];
					}
					if (((invoices[i].partner_id[1].toLowerCase()).indexOf(search_text) != -1)) { 
						selected_search_invoices = selected_search_invoices.concat(invoices[i]);
					}
				}
				invoices = selected_search_invoices;
			}
			
			
			var content = this.$el[0].querySelector('.invoices-list-contents');
			content.innerHTML = "";
			var invoices = invoices;
			for(var i = 0, len = Math.min(invoices.length,1000); i < len; i++){
				var product    = invoices[i];
				var productsline_html = QWeb.render('InvoicesLine',{widget: this, invoice:invoices[i] });
				var productsline = document.createElement('tbody');
				productsline.innerHTML = productsline_html;
				productsline = productsline.childNodes[1];
				content.appendChild(productsline);

			}
		},
				 
		save_changes: function(){
			if( this.has_product_changed() ){
				this.pos.get_order().set_product(this.new_invoice);
			}
		},
		
		has_product_changed: function(){
			if( this.old_product && this.new_invoice ){
				return this.old_product.id !== this.new_invoice.id;
			}else{
				return !!this.old_product !== !!this.new_invoice;
			}
		},

		toggle_save_button: function(){
			var $button = this.$('.button.next');
			if (this.editing_product) {
				$button.addClass('oe_hidden');
				return;
			} else if( this.new_invoice ){
				if( !this.old_product){
					$button.text(_t('Set Invoice'));
				}else{
					$button.text(_t('Change Invoice'));
				}
			}else{
				$button.text(_t('Deselect Invoice'));
			}
			$button.toggleClass('oe_hidden',!this.has_product_changed());
		},
			
		line_selects: function(event,$line,id){
			event.stopPropagation();
			event.preventDefault();
			var self = this;
			var invoices = self.pos.get_invoices_by_id[id];
			this.$('.client-list .lowlight').removeClass('lowlight');
			if ( $line.hasClass('highlight') ){
				$line.removeClass('highlight');
				$line.addClass('lowlight');
				this.display_invoices_detail('hide',invoices);
				this.new_invoice = null;
				this.toggle_save_button();
			}else{
				this.$('.client-list .highlight').removeClass('highlight');
				$line.addClass('highlight');
				var y = event.pageY - $line.parent().offset().top;
				this.display_invoices_detail('show',invoices,y);
				this.new_invoice = invoices;
				this.toggle_save_button();
			}
			
		},

		edit_product_details: function(product) {
			this.display_invoices_detail('edit',product);
		},
	
		undo_product_details: function(product) {
			if (!product.id) {
				this.display_invoices_detail('hide');
			} else {
				this.display_invoices_detail('show',product);
			}
		},
		reload_invoices: function(){
			var self = this;
			return this.pos.load_new_invoices().then(function(){
				self.render_list_invoices(self.pos.db.get_invoices_sorted(1000));
			});
		},
		
		display_invoices_detail: function(visibility,invoice,clickpos){
			var self = this;
			var contents = this.$('.client-details-contents');
			var parent   = this.$('.products-line').parent();
			var scroll   = parent.scrollTop();
			var height   = contents.height();

			this.editing_product = false;
			this.uploaded_picture = null;
		
		
			if(visibility === 'show'){
				contents.empty();
				contents.append($(QWeb.render('invoiceDetails',{widget:this,invoice:invoice})));

				var new_height   = contents.height();

				if(!this.details_visible){
					if(clickpos < scroll + new_height + 20 ){
						parent.scrollTop( clickpos - 20 );
					}else{
						parent.scrollTop(parent.scrollTop() + new_height);
					}
				}else{
					parent.scrollTop(parent.scrollTop() - height + new_height);
				}

				this.details_visible = true;
				var partner = invoice.partner_id
				
				contents.on('click','.button.invoice_payment',function(){
					self.gui.show_popup('pos_invoice_payment_popup_widget', { 'invoice': invoice });

				});
				
				this.toggle_save_button();
			} 
			else if (visibility === 'hide') {
				contents.empty();
				if( height > scroll ){
					contents.css({height:height+'px'});
					contents.animate({height:0},400,function(){
						contents.css({height:''});
					});
				}else{
					parent.scrollTop( parent.scrollTop() - height);
				}
				this.details_visible = false;
				this.toggle_save_button();
			}
		},
		
		close: function(){
			this._super();
		},        
		
	});
	
	gui.define_screen({
		name: 'see_all_products_screen_widget',
		widget: SeeAllInvoicesScreenWidget
	});
	
	
	var SeeAllInvoicesButtonWidget = screens.ActionButtonWidget.extend({
		template: 'SeeAllInvoicesButtonWidget',

		button_click: function() {
			var self = this;
			this.gui.show_screen('see_all_products_screen_widget', {});
		},
		
	});

	screens.define_action_button({
		'name': 'See All Invoices Button Widget',
		'widget': SeeAllInvoicesButtonWidget,
		'condition': function() {
			return true;
		},
	});
	
	var RegisterInvoicePaymentPopupWidget = popups.extend({
		template: 'RegisterInvoicePaymentPopupWidget',
		
		init: function(parent, args) {
			this._super(parent, args);
			this.options = {};
		},

		show: function(options) {
			options = options || {};
			var self = this;
			this._super(options);
			this.invoice = options.invoice || [];
			this.renderElement();
		},
		
		events: {
			'click .button.confirm': 'register_payment_inv',
			'click .button.cancel': 'click_cancel',
		},
		
		register_payment_inv: function() {
			
			var self = this;
			var invoice = this.invoice;
			var partner = invoice.partner_id[0];
			var payment_type = $('#payment_type1').val();
			var entered_amount = $("#entered_amount1").val();
			var entered_note = $("#entered_note1").val();
			if (invoice['amount_residual'] >= entered_amount){
				rpc.query({
						model: 'pos.create.customer.payment',
						method: 'create_customer_payment_inv',
						args: [partner ? partner : 0, partner ? partner : 0, payment_type, entered_amount, invoice, entered_note],
					
					}).then(function(output) {
				alert('Payment has been Registered for this Invoice !!!!');

				});

				self.gui.show_screen('products');
			}else{
				 self.gui.show_popup('error', {
                    'title': _t('Amount Error'),
                    'body': _t('Entered amount is larger then due amount. please enter valid amount'),
                });
			}			
		
		},

		renderElement: function() {
			var self = this;
			this._super();
			
			var partner = this.partner;
		},
	});	
	
	gui.define_popup({
		name: 'pos_invoice_payment_popup_widget',
		widget: RegisterInvoicePaymentPopupWidget
	});
});
