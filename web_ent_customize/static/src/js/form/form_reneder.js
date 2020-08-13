// odoo Form view inherit for teb view change and form first panel create.
odoo.define('web_ent_customize.FormRenderer', function (require) {
    "use strict";

    var FormRenderer = require('web.FormRenderer');

    FormRenderer.include({
        events: _.extend({}, FormRenderer.prototype.events, {
            'click .toggle_btn_chatter': function (e) {
                e.preventDefault();
                this.$el.parent().find('.o_form_view').toggleClass('side_chatter');
            },
        }),
        _updateView: function () {
            this._super.apply(this, arguments);
            if(this.$el.find('.o_chatter.oe_chatter').length){
                this.$el.prepend('<div class="toggle_btn_chatter"><i class="fa fa-comments"/></div>')
            }
        },
    });
});