odoo.define('aspl_gift_card.giftcard', function (require) {
"use strict";

    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var DB = require('point_of_sale.DB');
    var keyboard = require('point_of_sale.keyboard').OnscreenKeyboardWidget;
    var rpc = require('web.rpc');
    var chrome = require('point_of_sale.chrome');
    var utils = require('web.utils');
    var PopupWidget = require('point_of_sale.popups');

    var QWeb = core.qweb;
    var round_di = utils.round_decimals;
    var round_pr = utils.round_precision;

    models.PosModel.prototype.models.push({
        model:  'aspl.gift.card.type',
        fields: ['name'],
        loaded: function(self,card_type){
            self.card_type = card_type;
        },
    },{
        model:  'aspl.gift.card',
        fields: ['card_no','card_value','card_type','customer_id','issue_date','expire_date','is_active'],
        domain: [['is_active', '=', true]],
        loaded: function(self,gift_cards){
            self.db.add_giftcard(gift_cards);
            self.set({'gift_card_order_list' : gift_cards});
        },
    });

    var GiftCardButton = screens.ActionButtonWidget.extend({
        template: 'GiftCardButton',
        button_click: function(){
            this.gui.show_screen('giftcardlistscreen');
        },
    });

    screens.define_action_button({
        'name': 'giftcardbutton',
        'widget': GiftCardButton,
        'condition': function(){
            return this.pos.config.enable_gift_card;
        },
    });

    var GiftCardListScreenWidget = screens.ScreenWidget.extend({
        template: 'GiftCardListScreenWidget',

        init: function(parent, options){
            var self = this;
            this._super(parent, options);
            this.reload_btn = function(){
                $('.fa-refresh').toggleClass('rotate', 'rotate-reset');
                self.reloading_gift_cards();
            };
            if(this.pos.config.iface_vkeyboard && self.chrome.widget.keyboard){
                self.chrome.widget.keyboard.connect(this.$('.searchbox input'));
            }
        },

        events: {
            'click .button.back':  'click_back',
            'keyup .searchbox input': 'search_order',
            'click .searchbox .search-clear': 'clear_search',
            'click .button.create':  'click_create',
            'click .button.reload': 'reload_btn',
            'click #recharge_giftcard': 'click_recharge',
            'click #edit_giftcard': 'click_edit_giftcard',
            'click #exchange_giftcard': 'click_exchange',
        },

        filter:"all",

        date: "all",
        click_back: function(){
            this.gui.back();
        },
        click_create: function(event){
            this.gui.show_popup('create_card_popup');
        },

        click_recharge: function(event){
            var self = this;
            var card_id = parseInt($(event.currentTarget).data('id'));
            var result = self.pos.db.get_card_by_id(card_id);
            var order = self.pos.get_order();
            var client = order.get_client();
            self.gui.show_popup('recharge_card_popup',{
                'card_id':result.id,
                'card_no':result.card_no,
                'card_value':result.card_value,
                'customer_id':result.customer_id
            });
        },

        click_edit_giftcard: function(event){
            var self  = this;
            var card_id = parseInt($(event.currentTarget).data('id'));
            var result = self.pos.db.get_card_by_id(card_id);
            if (result) {
                self.gui.show_popup('edit_card_popup',{'card_id':card_id,'card_no':result.card_no,'expire_date':result.expire_date});
            }
        },

        click_exchange: function(event){
            var self = this;
            var card_id = parseInt($(event.currentTarget).data('id'));
            var result = self.pos.db.get_card_by_id(card_id);
            if (result) {
                self.gui.show_popup('exchange_card_popup',{'card_id':card_id,'card_no':result.card_no});
            }
        },

        search_order: function(event){
            var self = this;
            var search_timeout = null;
            clearTimeout(search_timeout);
            var query = $(event.currentTarget).val();
            search_timeout = setTimeout(function(){
                self.perform_search(query,event.which === 13);
            },70);
        },

        get_gift_cards: function(){
            return this.pos.get('gift_card_order_list');
        },

        show: function(){
            var self = this;
            this._super();
            this.reload_gift_cards();
            this.reloading_gift_cards();
            $('.issue_date_filter').datepicker({
                dateFormat: 'yy-mm-dd',
                autoclose: true,
                closeText: 'Clear',
                showButtonPanel: true,
                onSelect: function (dateText, inst) {
                    var date = $(this).val();
                    if (date){
                        self.date = date;
                        self.render_list(self.get_gift_cards());
                    }
                },
                onClose: function(dateText, inst){
                    if( !dateText ){
                        self.date = "all";
                        self.render_list(self.get_gift_cards());
                    } 
                }
           }).focus(function(){
                var thisCalendar = $(this);
                $('.ui-datepicker-close').click(function() {
                    thisCalendar.val('');
                    self.date = "all";
                    self.render_list(self.get_gift_cards());
                });
           });
           $('.expiry_date_filter').datepicker({
                dateFormat: 'yy-mm-dd',
                autoclose: true,
                closeText: 'Clear',
                showButtonPanel: true,
                onSelect: function (dateText, inst) {
                    var date = $(this).val();
                    if (date){
                        self.expire_date = date;
                        self.render_list(self.get_gift_cards());
                    }
                },
                onClose: function(dateText, inst){
                    if( !dateText ){
                        self.expire_date = "all";
                        self.render_list(self.get_gift_cards());
                    }
                }
           }).focus(function(){
                var thisCalendar = $(this);
                $('.ui-datepicker-close').click(function() {
                    thisCalendar.val('');
                    self.expire_date = "all";
                    self.render_list(self.get_gift_cards());
                });
           });
        },

        perform_search: function(query, associate_result){
            var self = this;
            if(query){
                var gift_cards = self.pos.db.search_gift_card(query);
                if ( associate_result && gift_cards.length === 1){
                    this.gui.back();
                }
                this.render_list(gift_cards);
            }else{
                this.render_list(self.get_gift_cards());
            }
        },

        clear_search: function(){
            this.render_list(this.get_gift_cards());
            this.$('.searchbox input')[0].value = '';
            this.$('.searchbox input').focus();
        },

        render_list: function(gift_cards){
            var self = this;
            var contents = this.$el[0].querySelector('.giftcard-list-contents');
            contents.innerHTML = "";
            var temp = [];
            if(self.filter !== "" && self.filter !== "all"){
                gift_cards = $.grep(gift_cards,function(gift_card){
                    return gift_card.state === self.filter;
                });
            }
            if(self.date !== "" && self.date !== "all"){
                var x = [];
                for (var i=0; i<gift_cards.length;i++){
                    var date_expiry = gift_cards[i].expire_date;
                    var date_issue = gift_cards[i].issue_date;
                    if(self.date == date_issue){
                        x.push(gift_cards[i]);
                    }
                }
                gift_cards = x;
            }
            if(self.expire_date !== "" && self.expire_date !== "all"){
                var y = [];
                for (var i=0; i<gift_cards.length;i++){
                    var date_expiry = gift_cards[i].expire_date;
                    var date_issue = gift_cards[i].issue_date;
                    if(self.expire_date == date_expiry){
                        y.push(gift_cards[i]);
                    }
                }
                gift_cards = y;
            }
            for(var i = 0, len = Math.min(gift_cards.length,1000); i < len; i++){
                var gift_card    = gift_cards[i];
                gift_card.amount = parseFloat(gift_card.amount).toFixed(2); 
                var clientline_html = QWeb.render('GiftCardlistLine',{widget: this, gift_card:gift_card});
                var clientline = document.createElement('tbody');
                clientline.innerHTML = clientline_html;
                clientline = clientline.childNodes[1];
                contents.appendChild(clientline);
            }
            $("table.giftcard-list").simplePagination({
                previousButtonClass: "btn btn-danger",
                nextButtonClass: "btn btn-danger",
                previousButtonText: '<i class="fa fa-angle-left fa-lg"></i>',
                nextButtonText: '<i class="fa fa-angle-right fa-lg"></i>',
                perPage: 10
            });
        },

        reload_gift_cards: function(){
            var self = this;
            this.render_list(self.get_gift_cards());
        },

        reloading_gift_cards: function(){
            var self = this;
            var params = {
                model: 'aspl.gift.card',
                method: 'search_read',
                domain: [['is_active', '=', true]],
            }
            return rpc.query(params, {async: false}).then(function(result){
                self.pos.db.add_giftcard(result);
                self.pos.set({'gift_card_order_list' : result});
                self.date = 'all';
                self.expire_date = 'all';
                self.reload_gift_cards();
                return self.pos.get('gift_card_order_list');
            }).guardedCatch(function (error, event){
                if(error.code === 200 ){    // Business Logic Error, not a connection problem
                    self.gui.show_popup('error-traceback',{
                        message: error.data.message,
                        comment: error.data.debug
                    });
                }
//                event.preventDefault();
                var gift_cards = self.pos.get('gift_card_order_list');
                console.error('Failed to send gift card:', gift_cards);
                self.reload_gift_cards();
                return gift_cards
            });
        },
    });
    gui.define_screen({name:'giftcardlistscreen', widget: GiftCardListScreenWidget});

    DB.include({
        init: function(options){
            this._super.apply(this, arguments);
            this.card_products = [];
            this.card_write_date = null;
            this.card_by_id = {};
            this.card_sorted = [];
            this.card_search_string = "";
            this.partners_name = [];
            this.partner_by_name = {};
            this.all_partners = []
        },
        add_partners: function(partners){
            var res = this._super(partners);
            var self = this;
            partners.map(function(partner){
                if(partner.name){
                    self.partners_name.push(partner.name);
                    self.partner_by_name[partner.name] = partner;
                }
            });
            if(partners.length > 0){
                _.extend(this.all_partners, partners)
            }
            return res
        },
        get_partners_name: function(){
            return this.partners_name;
        },
        get_partner_by_name: function(name){
            if(this.partner_by_name[name]){
                return this.partner_by_name[name];
            }
            return undefined;
        },
        add_giftcard: function(gift_cards){
            var updated_count = 0;
            var new_write_date = '';
            for(var i = 0, len = gift_cards.length; i < len; i++){
                var gift_card = gift_cards[i];
                if (    this.card_write_date && 
                        this.card_by_id[gift_card.id] &&
                        new Date(this.card_write_date).getTime() + 1000 >=
                        new Date(gift_card.write_date).getTime() ) {
                    continue;
                } else if ( new_write_date < gift_card.write_date ) { 
                    new_write_date  = gift_card.write_date;
                }
                if (!this.card_by_id[gift_card.id]) {
                    this.card_sorted.push(gift_card.id);
                }
                this.card_by_id[gift_card.id] = gift_card;
                updated_count += 1;
            }
            this.card_write_date = new_write_date || this.card_write_date;
            if (updated_count) {
                // If there were updates, we need to completely 
                this.card_search_string = "";
                for (var id in this.card_by_id) {
                    var gift_card = this.card_by_id[id];
                    this.card_search_string += this._card_search_string(gift_card);
                }
            }
            return updated_count;
        },

        _card_search_string: function(gift_card){
            var str =  gift_card.card_no;
            if(gift_card.customer_id){
                str += '|' + gift_card.customer_id[1];
            }
            str = '' + gift_card.id + ':' + str.replace(':','') + '\n';
            return str;
        },

        get_card_write_date: function(){
            return this.card_write_date;
        },

        get_card_by_id: function(id){
            return this.card_by_id[id];
        },

        search_gift_card: function(query){
            try {
                query = query.replace(/[\[\]\(\)\+\*\?\.\-\!\&\^\$\|\~\_\{\}\:\,\\\/]/g,'.');
                query = query.replace(' ','.+');
                var re = RegExp("([0-9]+):.*?"+query,"gi");
            }catch(e){
                return [];
            }
            var results = [];
            var r;
            for(var i = 0; i < this.limit; i++){
                r = re.exec(this.card_search_string);
                if(r){
                    var id = Number(r[1]);
                    results.push(this.get_card_by_id(id));
                }else{
                    break;
                }
            }
            return results;
        },
    });

    var CreateCardPopupWidget = PopupWidget.extend({
        template: 'CreateCardPopupWidget',

        show: function(options){
            var self = this;
            this._super(options);
            self.partner_id = '';
            options = options || {};
            self.panding_card = options.card_data || false;
            this.renderElement();
            $('#card_no').focus();
            var timestamp = new Date().getTime()/1000;
            var partners = this.pos.db.all_partners;
            var partners_list = [];
            if(self.pos.config.default_exp_date && !self.panding_card){
                var date = new Date();
                date.setMonth(date.getMonth() + self.pos.config.default_exp_date);
                var new_date = date.getFullYear()+ "/" +(date.getMonth() + 1)+ "/" +date.getDate();
                self.$('#text_expire_date').val(new_date);
            }
            if(partners && partners[0]){
                partners.map(function(partner){
                    partners_list.push({
                        'id':partner.id,
                        'value':partner.name,
                        'label':partner.name,
                    });
                });
                $('#select_customer').keypress(function(e){
                    $('#select_customer').autocomplete({
                        source:partners_list,
                        select: function(event, ui) {
                            self.partner_id = ui.item.id;
                        },
                    });
                });
                if(self.panding_card){
                    self.partner_id = self.panding_card.giftcard_customer;
                    $('#checkbox_paid').prop('checked',true);
                }
            }
            $("#text_amount").keypress(function (e) {
                if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57) && e.which != 46) {
                    return false;
               }
            });
            if(self.pos.config.manual_card_number && !self.panding_card){
                $('#card_no').removeAttr("readonly");
                $("#card_no").keypress(function (e) {
                    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57) && e.which != 46) {
                        return false;
                   }
                });
            } else if(!self.panding_card){
                $('#card_no').val(window.parseInt(timestamp));
                $('#card_no').attr("readonly", "readonly");
            }
            var partner = null;
            for ( var j = 0; j < self.pos.partners.length; j++ ) {
                partner = self.pos.partners[j];
                self.partner=this.partner
            }
        },

        click_confirm: function(){
            var self = this;
            var move = true;
            var order = self.pos.get_order();
            if($('#select_customer').val() == ''){
                self.partner_id = false;
            }
            var checkbox_paid = document.getElementById("checkbox_paid");
            var expire_date = moment($('#text_expire_date').val(), 'YYYY/MM/DD').format('YYYY-MM-DD');
            var select_customer = self.partner_id;
            var select_card_type = $('#select_card_type').val();
            var card_number = $('#card_no').val();
            if(!card_number){
                alert("Enter gift card number");
                return;
            } else{
                var params = {
                        model: 'aspl.gift.card',
                        method: 'search_read',
                        domain: [['card_no', '=', $('#card_no').val()]],
                    }
                rpc.query(params, {async: false}).then(function(gift_count){
                    gift_count = gift_count.length;
                    if(gift_count > 0){
                        $('#card_no').css('border', 'thin solid red');
                        move = false;
                    } else{
                        $('#card_no').css('border', '0px');
                    }
                });
            }
            if(!move){
                alert("Card already exist");
                return
            }
            if(self.partner_id){
                var client = self.pos.db.get_partner_by_id(self.partner_id);
            }
            if(expire_date){
                if(checkbox_paid.checked){
                    $('#text_amount').focus();
                    var input_amount =this.$('#text_amount').val();
                    if(input_amount){
                        order.set_client(client);
                        var product = self.pos.db.get_product_by_id(self.pos.config.gift_card_product_id[0]);
                        if (self.pos.config.gift_card_product_id[0]){
                            var orderlines=order.get_orderlines()
                            for(var i = 0, len = orderlines.length; i < len; i++){
                                order.remove_orderline(orderlines);
                            }
                            var line = new models.Orderline({}, {pos: self.pos, order: order, product: product});
                            line.set_unit_price(input_amount);
                            order.add_orderline(line);
                            order.select_orderline(order.get_last_orderline());
                        }
                        var gift_order = {'giftcard_card_no': $('#card_no').val(),
                            'giftcard_customer': select_customer ? select_customer : false,
                            'giftcard_expire_date': moment($('#text_expire_date').val(), 'YYYY/MM/DD').format('YYYY-MM-DD'),
                            'giftcard_amount': $('#text_amount').val(),
                            'giftcard_customer_name': $("#select_customer").val(),
                            'card_type': $('#select_card_type').val(),
                        }
                        if(self.pos.config.msg_before_card_pay) {
                            self.gui.show_popup('confirmation_card_payment',{'card_data':gift_order});
                        } else{
                            order.set_giftcard(gift_order);
                            self.gui.show_screen('payment');
                            $("#card_back").hide();
                            $( "div.js_set_customer" ).off("click");
                            $( "div#card_invoice" ).off("click");
                            this.gui.close_popup(); 
                        }
                    }else{
                        alert("Please enter card value.")
                        $('#text_amount').focus();
                    }
                }else{
                    var input_amount =this.$('#text_amount').val();
                    if(input_amount){
                        order.set_client(self.pos.db.get_partner_by_id(self.partner_id));
                        order.set_free_data({
                            'giftcard_card_no': $('#card_no').val(),
                            'giftcard_customer': select_customer ? select_customer : false,
                            'giftcard_expire_date': moment($('#text_expire_date').val(), 'YYYY/MM/DD').format('YYYY-MM-DD'),
                            'giftcard_amount': $('#text_amount').val(),
                            'giftcard_customer_name': $("#select_customer").val(),
                            'card_type': $('#select_card_type').val(),
                        })
                        var params = {
                            model: "aspl.gift.card",
                            method: "create",
                            args: [{
                                'card_no': Number($('#card_no').val()),
                                'card_value': Number($('#text_amount').val()),
                                'customer_id': self.partner_id ? Number(self.partner_id) : false,
                                'expire_date': moment($('#text_expire_date').val(), 'YYYY/MM/DD').format('YYYY-MM-DD'),
                                'card_type': Number($('#select_card_type').val()),
                            }]
                        }
                        rpc.query(params, {async: false});
//                    	new Model("aspl.gift.card").get_func("create")({
//                    		'card_no': Number($('#card_no').val()),
//                    		'card_value':  Number($('#text_amount').val()),
//                    		'customer_id':self.partner_id ? Number(self.partner_id) : false,
//                    		'expire_date':$('#text_expire_date').val(),
//                    		'card_type': Number($('#select_card_type').val()),
//                    	});
                        self.gui.show_screen('receipt');
                        this.gui.close_popup();
                    }else{
                        alert("Please enter card value.")
                        $('#text_amount').focus();
                    }
                }
            }else{
                alert("Please select expire date.")
                $('#text_expire_date').focus();
            }
            
        },

        renderElement: function() {
            var self = this;
            this._super();
            $('.datetime').datepicker({
                minDate: 0,
                dateFormat:'yy/mm/dd',
            });
        },
    });
    gui.define_popup({name:'create_card_popup', widget: CreateCardPopupWidget});

    var _super_order = models.Order.prototype;
        models.Order = models.Order.extend({
            initialize: function(attributes,options){
               _super_order.initialize.apply(this, arguments);
               this.giftcard = [];
               this.redeem =[];
               this.recharge=[];
               this.date=[];
            },
            set_giftcard: function(giftcard) {
                this.giftcard.push(giftcard)
            },
            get_giftcard: function() {
                return this.giftcard;
            },
            set_recharge_giftcard: function(recharge) {
                this.recharge.push(recharge)
            },
            get_recharge_giftcard: function(){
                return this.recharge;
            },
            set_redeem_giftcard: function(redeem) {
                this.redeem.push(redeem)
            },
            get_redeem_giftcard: function() {
                return this.redeem;
            },
            remove_card:function(code){ 
                var redeem = _.reject(this.redeem, function(objArr){ return objArr.redeem_card == code });
                this.redeem = redeem
            },
            set_free_data: function(freedata) {
                this.freedata = freedata;
            },
            get_free_data: function() {
                return this.freedata;
            },
            export_as_JSON: function() {
                var submitted_order = _super_order.export_as_JSON.call(this);
                var new_val = {
                    giftcard: this.get_giftcard() || false,
                    redeem: this.get_redeem_giftcard() || false,
                    recharge: this.get_recharge_giftcard() || false,
                }
                $.extend(submitted_order,new_val);
                return submitted_order;
            },
             export_for_printing: function(){
                var submitted_order = _super_order.export_for_printing.call(this);
                var new_val = {
                    giftcard: this.get_giftcard() || false,
                    recharge: this.get_recharge_giftcard() || false,
                    redeem:this.get_redeem_giftcard() || false,
                    free:this.get_free_data()|| false
                }
                $.extend(submitted_order,new_val);
                return submitted_order;
            },
        }); 

    screens.PaymentScreenWidget.include({
        renderElement: function(options) {
            var self = this;
            this._super();
            var order = self.pos.get_order();
            this.$('.js_gift_card').click(function(){
                var client = order.get_client();
                if(!order.get_giftcard().length > 0 && !order.get_recharge_giftcard().length > 0 ){
                    self.gui.show_popup('redeem_card_popup', {'payment_self': self});
                }
            });
        },
        click_delete_paymentline: function(cid){
            var self = this;
            var lines = self.pos.get_order().get_paymentlines();
            var order = self.pos.get_order();
            var get_redeem = order.get_redeem_giftcard();
            for ( var i = 0; i < lines.length; i++ ) {
                if (lines[i].cid === cid) {
                    _.each(get_redeem, function(redeem){
                        if(lines[i].get_giftcard_line_code() == redeem.redeem_card ){
                            order.remove_card(lines[i].get_giftcard_line_code());
                        }
                    });
                    order.remove_paymentline(lines[i]);
                    self.reset_input();
                    self.render_paymentlines();
                    return
                }
            }
        },
        payment_input: function(input){
            var self = this;
            var order = this.pos.get_order();
            if(order.selected_paymentline && order.selected_paymentline.get_freeze()){
                return
            }
            this._super(input);
        },
    });

    var RedeemCardPopupWidget = PopupWidget.extend({
        template: 'RedeemCardPopupWidget',

        show: function(options){
           self = this;
           this.payment_self = options.payment_self || false;
           this._super();

           self.redeem = false;
           var order = self.pos.get_order();
           $('body').off('keypress', self.payment_self.keyboard_handler);
           $('body').off('keydown', self.payment_self.keyboard_keydown_handler);
           window.document.body.removeEventListener('keypress',self.payment_self.keyboard_handler);
           window.document.body.removeEventListener('keydown',self.payment_self.keyboard_keydown_handler);
           this.renderElement();
           $("#text_redeem_amount").keypress(function (e) {
               if(e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57) && e.which != 46) {
                    return false;
               }
            });
           $('#text_gift_card_no').focus();
           $('#redeem_amount_row').hide();
           $('#text_gift_card_no').keypress(function(e) {
               if (e.which == 13 && $(this).val()) {
                    var today = moment().format('YYYY-MM-DD');
                    var code = $(this).val();
                    var get_redeems = order.get_redeem_giftcard();
                    var existing_card = _.where(get_redeems, {'redeem_card': code });
                    var params = {
                        model: 'aspl.gift.card',
                        method: 'search_read',
                        domain: [['card_no', '=', code], ['expire_date', '>=', today], ['issue_date', '<=', today]],
                    }
                    rpc.query(params, {async: false})
//                    new Model('aspl.gift.card').get_func('search_read')([['card_no', '=', code], ['expire_date', '>=', today]])
                    .then(function(res){
                        if(res.length > 0){
                            if (res[0]){
                                if(existing_card.length > 0){
                                    res[0]['card_value'] = existing_card[existing_card.length - 1]['redeem_remaining']
                                }
                                self.redeem = res[0];
                                $('#lbl_card_no').html("Your Balance is  "+ self.format_currency(res[0].card_value));
                                if(res[0].customer_id[1]){
                                    $('#lbl_set_customer').html("Hello  "+ res[0].customer_id[1]);
                                } else{
                                    $('#lbl_set_customer').html("Hello  ");
                                }
                                
                                if(res[0].card_value <= 0){
                                    $('#redeem_amount_row').hide();
                                    $('#in_balance').show();
                                }else{
                                    $('#redeem_amount_row').fadeIn('fast');
                                    $('#text_redeem_amount').focus();
                                }
                            }
                        }else{
                            alert("Barcode not found or gift card has been expired.")
                            $('#text_gift_card_no').focus();
                            $('#lbl_card_no').html('');
                            $('#lbl_set_customer').html('');
                            $('#in_balance').html('');
                        }
                    });
                }
            });
        },
  
        click_cancel: function(){
            var self = this;
            self._super();
            $('body').on('keypress', self.payment_self.keyboard_handler);
            $('body').on('keydown', self.payment_self.keyboard_keydown_handler);
        },

        click_confirm: function(){
            var order = self.pos.get_order();
            var client = order.get_client();
            var redeem_amount = this.$('#text_redeem_amount').val();
            var code = $('#text_gift_card_no').val();
            if(self.redeem.card_no){
                if(code == self.redeem.card_no){
                    if(!self.redeem.card_value == 0){
                        if(redeem_amount){
                            if (redeem_amount <= (order.get_due() || order.get_total_with_tax())){
                                if(!client){
                                    order.set_client(self.pos.db.get_partner_by_id(self.redeem.customer_id[0]));
                                }
                                if( 0 < Number(redeem_amount)){
                                    if(self.redeem && self.redeem.card_value >= Number(redeem_amount) ){
                                        if(self.redeem.customer_id[0]){
                                            var vals = {
                                                'redeem_card_no':self.redeem.id,
                                                'redeem_card':$('#text_gift_card_no').val(),
                                                'redeem_card_amount':$('#text_redeem_amount').val(),
                                                'redeem_remaining':self.redeem.card_value - $('#text_redeem_amount').val(),
                                                'card_customer_id': client ? client.id : self.redeem.customer_id[0],
                                                'customer_name': client ? client.name : self.redeem.customer_id[1],
                                            };
                                        } else {
                                            var vals = {
                                                'redeem_card_no':self.redeem.id,
                                                'redeem_card':$('#text_gift_card_no').val(),
                                                'redeem_card_amount':$('#text_redeem_amount').val(),
                                                'redeem_remaining':self.redeem.card_value - $('#text_redeem_amount').val(),
                                                'card_customer_id': order.get_client() ? order.get_client().id : false,
                                                'customer_name': order.get_client() ? order.get_client().name : '',
                                            };
                                        }

                                        var get_redeem = order.get_redeem_giftcard();
                                        if(get_redeem){
                                            var product = self.pos.db.get_product_by_id(self.pos.config.enable_journal_id)
                                            if(self.pos.config.enable_journal_id[0]){
                                                var cashregisters = null;
                                                for ( var j = 0; j < self.pos.payment_methods.length; j++ ) {
                                                    if ( self.pos.payment_methods[j].id === self.pos.config.enable_journal_id[0] ){
                                                       cashregisters = self.pos.payment_methods[j];
                                                    }
                                                }
                                            }
                                            if (vals){
                                                window.document.body.addEventListener('keypress',self.payment_self.keyboard_handler);
                                                window.document.body.addEventListener('keydown',self.payment_self.keyboard_keydown_handler);
                                                if (cashregisters){
                                                    order.add_paymentline(cashregisters);
                                                    order.selected_paymentline.set_amount( Math.max(redeem_amount),0 );
                                                    order.selected_paymentline.set_giftcard_line_code(code);
                                                    order.selected_paymentline.set_freeze(true);
                                                    self.chrome.screens.payment.reset_input();
                                                    self.chrome.screens.payment.render_paymentlines();
                                                    order.set_redeem_giftcard(vals);
                                                } 
                                            }
                                            this.gui.close_popup();
                                            $('body').on('keypress', self.payment_self.keyboard_handler);
                                            $('body').on('keydown', self.payment_self.keyboard_keydown_handler);
                                        }
                                    }else{
                                        alert("Please enter amount below card value.");
                                        $('#text_redeem_amount').focus();
                                    }
                                }else{
                                    alert("Please enter valid amount.");
                                    $('#text_redeem_amount').focus();
                                }
                            }else{
                                alert("Card amount should be less than or equal to Order Due Amount.");
                            } 
                            
                        }else{
                            alert("Please enter amount.");
                            $('#text_redeem_amount').focus();
                        }
                    }
                }else{
                    alert("Please enter valid barcode.");
                    $('#text_gift_card_no').focus();
                }
            }else{
                alert("Press enter key.");
                $('#text_gift_card_no').focus();
            }
        },
    });
    gui.define_popup({name:'redeem_card_popup', widget: RedeemCardPopupWidget});

    var RechargeCardPopupWidget = PopupWidget.extend({
        template: 'RechargeCardPopupWidget',

        show: function(options){
            self = this;
            this._super();
            self.pending_card = options.recharge_card_data;
            if(!self.pending_card){
                this.card_no = options.card_no || "";
                this.card_id = options.card_id || "";
                this.card_value = options.card_value || 0 ;
                this.customer_id = options.customer_id || "";
            }
            this.renderElement();
            $('#text_recharge_amount').focus();
            $("#text_recharge_amount").keypress(function (e) {
                if(e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57) && e.which != 46) {
                    return false;
                }
            });
        },

        click_confirm: function(){
            var self = this;
            var order = self.pos.get_order();
            var client = order.get_client();
            var set_customer = $('#set_customers').val();
            if(!client){
                order.set_client(self.pos.db.get_partner_by_id(set_customer));
            }
            var recharge_amount = this.$('#text_recharge_amount').val();
            if (recharge_amount){
                if( 0 < Number(recharge_amount) ){
                    var vals = {
                    'recharge_card_id':self.card_id,
                    'recharge_card_no':self.card_no,
                    'recharge_card_amount':Number(recharge_amount),
                    'card_customer_id': self.customer_id[0] || false,
                    'customer_name': self.customer_id[1],
                    'total_card_amount':Number(recharge_amount)+self.card_value,
                    }
                    var get_recharge = order.get_recharge_giftcard();
                    if(get_recharge){
                        var product = self.pos.db.get_product_by_id(self.pos.config.gift_card_product_id[0]);
                        if (self.pos.config.gift_card_product_id[0]){
                            var orderlines=order.get_orderlines()
                            for(var i = 0, len = orderlines.length; i < len; i++){
                                order.remove_orderline(orderlines);
                            }
                            var line = new models.Orderline({}, {pos: self.pos, order: order, product: product});
                            line.set_unit_price(recharge_amount);
                            order.add_orderline(line);
                            order.select_orderline(order.get_last_orderline());
                        }
                        if(self.pos.config.msg_before_card_pay){
                            self.gui.show_popup('confirmation_card_payment',{'rechage_card_data':vals})
                        } else {
                            order.set_recharge_giftcard(vals);
                            self.gui.show_screen('payment');
                            $("#card_back").hide();
                            $( "div.js_set_customer" ).off("click");
                            $( "div#card_invoice" ).off("click");
                            this.gui.close_popup();
                        }
                          
                    }
                }else{
                   alert("Please enter valid amount.");
                   $('#text_recharge_amount').focus();
                }
            }else{
                alert("Please enter amount.");
                $('#text_recharge_amount').focus();
            }
        },
    });
    gui.define_popup({name:'recharge_card_popup', widget: RechargeCardPopupWidget});

    var EditCardPopupWidget = PopupWidget.extend({
        template: 'EditCardPopupWidget',

        show: function(options){
            self = this;
            this._super();
            this.card_no = options.card_no || "";
            this.card_id = options.card_id || "";
            this.expire_date = options.expire_date || "";
            this.renderElement();
            $('#new_expire_date').focus();
            $('#new_expire_date').keypress(function(e){
                if( e.which == 8 || e.keyCode == 46 ) return true;
                return false;
            });
        },

        click_confirm: function(){
            var self = this;
            var new_expire_date = moment(this.$('#new_expire_date').val(), 'YYYY/MM/DD').format('YYYY-MM-DD');
            if(new_expire_date){
                if(self.card_no){
                    var params = {
                        model: 'aspl.gift.card',
                        method: 'write',
                        args: [[self.card_id], {'expire_date': new_expire_date}],
                    }
                    rpc.query(params, {async: false})
                    .then(function(res){
                        if(res){
                            self.pos.gui.chrome.screens.giftcardlistscreen.reloading_gift_cards();
                        }
                    });
                    this.gui.close_popup();
                }else{
                    alert("Please enter valid card no.");
                }
            }else{
                alert("Please select date.");
                $('#new_expire_date').focus();
            }
        },

        renderElement: function() {
            var self = this;
            this._super();
            $('.date').datepicker({
                minDate: 0,
                dateFormat:'yy/mm/dd',
            });
            self.$(".emptybox_time").click(function(){ $('#new_expire_date').val('') });
        },
    });
    gui.define_popup({name:'edit_card_popup', widget: EditCardPopupWidget});

    var ExchangeCardPopupWidget = PopupWidget.extend({
        template: 'ExchangeCardPopupWidget',

        show: function(options){
            self = this;
            this._super();
            this.card_no = options.card_no || "";
            this.card_id = options.card_id || "";
            this.renderElement();
            $('#new_card_no').focus();
            var timestamp = new Date().getTime()/1000;
            if(self.pos.config.manual_card_number){
                $('#new_card_no').removeAttr("readonly");
                $("#new_card_no").keypress(function (e) {
                    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57) && e.which != 46) {
                        return false;
                   }
                });
            } else{
                $('#new_card_no').val(window.parseInt(timestamp));
                $('#new_card_no').attr("readonly", "readonly");
            }
            
        },

        click_confirm: function(){
            var self = this;
            if(self.card_no){
                var card_number = $('#new_card_no').val();
                var move = true;
                if(!card_number){
                    alert("Enter gift card number");
                    return;
                } else{
                    var params = {
                        model: 'aspl.gift.card',
                        method: 'search_read',
                        domain: [['card_no', '=', $('#new_card_no').val()]],
                    }
                    rpc.query(params, {async: false})
//	        		new Model('aspl.gift.card').call('search_count', [[]], {}, {async: false})
                    .then(function(gift_count){
                        gift_count = gift_count.length
                        if(gift_count > 0){
                            $('#new_card_no').css('border', 'thin solid red');
                            move = false;
                        } else{
                            $('#new_card_no').css('border', '0px');
                        }
                    });
                }
                if(!move){
                    alert("Card already exist");
                    return
                }
               var exchange_card_no = confirm("Are you sure you want to change card number?");
               if( exchange_card_no){
                  var params = {
                     model: "aspl.gift.card",
                     method: "write",
                     args: [[self.card_id],{'card_no':this.$('#new_card_no').val()}],
                  }
                  rpc.query(params, {async: false})
                  .then(function(res){
                      if(res){
                          self.pos.gui.chrome.screens.giftcardlistscreen.reloading_gift_cards();
                      }
                  });
                  this.gui.close_popup();
               }
            }
        },
    });

    gui.define_popup({name:'exchange_card_popup', widget: ExchangeCardPopupWidget});

    var ConfirmationCardPayment = PopupWidget.extend({
        template: 'ConfirmationCardPayment',

        show: function(options){
            self = this;
            this._super();
            self.options = options.card_data || false;
            self.recharge_card = options.rechage_card_data || false;
            self.renderElement();
        },
        click_confirm: function(){
            var self = this;
            var order = self.pos.get_order();
            if(self.recharge_card){
                var vals = {
                    'recharge_card_id':self.recharge_card.recharge_card_id,
                    'recharge_card_no':self.recharge_card.recharge_card_no,
                    'recharge_card_amount':self.recharge_card.recharge_card_amount,
                    'card_customer_id': self.recharge_card.card_customer_id || false,
                    'customer_name': self.recharge_card.customer_name,
                    'total_card_amount':self.recharge_card.total_card_amount,
                }
                order.set_recharge_giftcard(vals);
                self.gui.show_screen('payment');
                $("#card_back").hide();
                $( "div.js_set_customer" ).off("click");
                $( "div#card_invoice" ).off("click");
                this.gui.close_popup();
            } else if(self.options){
                var gift_order = {'giftcard_card_no': self.options.giftcard_card_no,
                        'giftcard_customer': self.options.giftcard_customer ? Number(self.options.giftcard_customer) : false,
                        'giftcard_expire_date': self.options.giftcard_expire_date,
                        'giftcard_amount': self.options.giftcard_amount,
                        'giftcard_customer_name': self.options.giftcard_customer_name,
                        'card_type': self.options.card_type,
                }
                order.set_giftcard(gift_order);
                self.gui.show_screen('payment');
                $("#card_back").hide();
                $( "div.js_set_customer" ).off("click");
                $( "div#card_invoice" ).off("click");
                this.gui.close_popup();
            }
        },
        click_cancel: function(){
            var self = this;
            if(self.recharge_card){
                self.gui.show_popup('recharge_card_popup',{'recharge_card_data':self.recharge_card})
            }else if(self.options){
                self.gui.show_popup('create_card_popup',{'card_data':self.options});
            }

        }
    });

    gui.define_popup({name:'confirmation_card_payment', widget: ConfirmationCardPayment});

    screens.ReceiptScreenWidget.include({
        show: function(){
            var self = this;
            this._super();
            var order = this.pos.get_order();
            var barcode_val = order.get_giftcard();
            if( barcode_val && barcode_val[0]){
                var barcode = barcode_val[0].giftcard_card_no;
            }
            var barcode_recharge_val = order.get_recharge_giftcard();
            if( barcode_recharge_val && barcode_recharge_val[0]){
                var barcode = barcode_recharge_val[0].recharge_card_no;
            }
            var barcode_free_val = order.get_free_data();
            if( barcode_free_val){
                var barcode = barcode_free_val.giftcard_card_no;
            }
            var barcode_redeem_val = order.get_redeem_giftcard();
            if( barcode_redeem_val && barcode_redeem_val[0]){
                var barcode = barcode_redeem_val[0].redeem_card;
            }
            if(barcode){
                $("#test-barcode").JsBarcode(barcode.toString());
            }
        },
        print_html: function () {
            var receipt = QWeb.render('CustomXmlReceipt', this.get_receipt_render_env());
            this.pos.proxy.printer.print_receipt(receipt);
            this.pos.get_order()._printed = true;
        },
        get_receipt_render_env: function() {
            var order = this.pos.get_order();
            var barcode_val = order.get_giftcard();
            var barcode_recharge_val = order.get_recharge_giftcard();
            var barcode_free_val = order.get_free_data();
            var barcode_redeem_val = order.get_redeem_giftcard();
            if( barcode_recharge_val && barcode_recharge_val[0]){
                var barcode = barcode_recharge_val[0].recharge_card_no;
            }else if( barcode_val && barcode_val[0]){
                var barcode = barcode_val[0].giftcard_card_no;
            }else if(barcode_free_val){
                var barcode = barcode_free_val.giftcard_card_no;
            }else if(barcode_redeem_val && barcode_redeem_val[0]){
                var barcode = barcode_redeem_val[0].redeem_card;
            }
            if(barcode){
                var img = new Image();
                img.id = "test-barcode";
                $(img).JsBarcode(barcode.toString());
            }
            return {
                widget: this,
                pos: this.pos,
                order: order,
                receipt: order.export_for_printing(),
                orderlines: order.get_orderlines(),
                paymentlines: order.get_paymentlines(),
                get_barcode_image: $(img)[0] ? $(img)[0].src : false,
            };
        },
        render_receipt: function() {
            var order = this.pos.get_order();
            if (order.get_free_data()){
                var receipt_html = QWeb.render('FreeTicket',this.get_receipt_render_env());
                this.$('.pos-receipt-container').html(receipt_html);
            }else{
                var receipt_html = QWeb.render('OrderReceipt',this.get_receipt_render_env());
                this.$('.pos-receipt-container').html(receipt_html);
            }
        },
    });

    var _super_paymentline = models.Paymentline.prototype;
    models.Paymentline = models.Paymentline.extend({
        set_giftcard_line_code: function(code) {
            this.code = code;
        },
        get_giftcard_line_code: function(){
            return this.code;
        },
        set_freeze: function(freeze) {
            this.freeze = freeze;
        },
        get_freeze: function(){
            return this.freeze;
        },
    });

    screens.ProductListWidget.include({
        set_product_list: function(product_list){
            var self = this;
            var new_product_list = [];
            var gift_card_id = self.pos.config.gift_card_product_id[0] || false;
            if(product_list.length > 0){
                product_list.map(function(pro_list){
                    if(pro_list.id != gift_card_id){
                        new_product_list.push(pro_list);
                    }
                });
            }
            this.product_list = new_product_list;
            this.renderElement();
        },
    });

});