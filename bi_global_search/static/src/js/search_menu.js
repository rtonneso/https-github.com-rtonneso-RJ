odoo.define('bi_global_search.search_menu', function (require) {
"use strict";

/**
 * This widget is appended by the webclient to the right of the navbar.
 * It displays the avatar and the name of the logged user (and optionally the
 * db name, in debug mode).
 * If clicked, it opens a dropdown allowing the user to perform actions like
 * editing its preferences, accessing the documentation, logging out...
 */

var core = require('web.core');
var session = require('web.session');
var SystrayMenu = require('web.SystrayMenu');
var Widget = require('web.Widget');
var mixins = require('web.mixins');
var QWeb = core.qweb;


var SearchMenu = Widget.extend({
    template: 'SearchMenu',

    init: function (parent, target) {
        this._super.apply(this, arguments);
        this.$target = $(target);
    },

    start: function () {
        var self = this;
        this.$widget = $(QWeb.render('SearchMenu'));
        this.$loading = this.$widget.find('.o_search_menu');
        this.search_input = this.$widget.find('.search_input');

        this.$target = this.search_input;
    },
});

SearchMenu.prototype.sequence = 1;
SystrayMenu.Items.push(SearchMenu);

return SearchMenu;

});