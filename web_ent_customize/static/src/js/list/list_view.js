odoo.define('web_ent_customize.ListView', function (require) {
    "use strict";
    var core = require('web.core');
    var ListModel = require('web_ent_customize.ListModel');
    var ListView = require('web.ListView');

    var _lt = core._lt;

    ListView.include({
        config: _.extend({}, ListView.prototype.config, {
            Model: ListModel,
        }),
        init: function (viewInfo, params) {
            this._super.apply(this, arguments);
            this.loadParams.attachmentsData = [];
            this.loadParams.resDomain = params.domain;
        },
    });
    return ListView;

});