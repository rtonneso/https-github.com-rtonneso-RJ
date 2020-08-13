// odoo Menu inherit Open time has Children submenu add.
odoo.define('web_ent_customize.Menu', function (require) {
    "use strict";

    var core = require('web.core');
    var Widget = require('web.Widget');
    var Menu = require('web_enterprise.Menu');
    var favoriteMenu = require('web_ent_customize.FavoriteMenu');
    var config = require('web.config');
    var session = require('web.session');
    var HomeMenu = require('web_enterprise.HomeMenu');
    var rpc = require('web.rpc');

    var QWeb = core.qweb;
    var _t = core._t;

    HomeMenu.include({
        events: _.extend({}, HomeMenu.prototype.events, {
            'dragstop .o_home_menu_scrollable .o_apps .o_app': '_ondragStop',
            'dragstart .o_home_menu_scrollable .o_apps .o_app': '_ondragStart',
        }),
        init: function (parent, menuData) {
            this.company_id = session.company_id;
            this.menuData = menuData
            this.meniIcon = true;
            this.favoriteMenuNameById = {};
            this._super.apply(this, arguments);
        },
        _render: function () {
            var self = this;
            this._super.apply(this, arguments);
            if (!config.device.touch) {
                self._onRemoveFavMenuElement();
                self._onDraggableElement();
            }
        },
        _doInitFavoriteMenu: function() {
            var self = this;
            return self._rpc({
                model: 'ir.favorite.menu',
                method: 'search_read',
                args: [[['user_id', '=', session.uid]]],
                kwargs: {fields: ['favorite_menu_id', 'user_id', 'sequence', 'favorite_menu_xml_id', 'favorite_menu_action_id']}
            }).then(function (menu_data) {
                self.favoriteMenus = menu_data;
                _.each(menu_data, function(menu) {
                    self.favoriteMenuNameById[menu.favorite_menu_id[0]] = menu.favorite_menu_id[1];
                });
            });
        },
        _renderFacouriteMenus: function() {
            var self = this;
            var $targetToAppend = self.$el.parents('body').find('.oe_favorite_menu .oe_apps_menu');
            $targetToAppend.empty();
            $(QWeb.render('menu.FavoriteMenuItem', {
                widget: {
                    menus: self.favoriteMenus,
                    debug: config.isDebug() ? '?debug' : '',
                }
            })).appendTo($targetToAppend);
        },
        _onRemoveFavMenuElement: function () {
            var self = this;
            self.$el.find('.o_home_menu_scrollable .o_apps').droppable({
                tolerance: 'pointer',
                drop: (event, ui) => {
                    if ($(ui.draggable).hasClass('oe_favorite')) {
                        var MenuId = $(ui.draggable).data('id');
                        var FavoriteMenuId = $(ui.draggable).data('menu-id');
                        var user = session.uid;
                        return self._rpc({
                            model: 'ir.favorite.menu',
                            method: 'unlink',
                            args: [MenuId],
                        }).then(function (res) {
                            if (res === true) {
                                return self._doInitFavoriteMenu().then(() => {
                                    self._renderFacouriteMenus();
                                    self.do_notify(_.str.sprintf(_t('%s removed from favorite.'), self.favoriteMenuNameById[FavoriteMenuId]));
                                });
                            };
                        });
                    };
                },
            });
        },
        _onDraggableElement: function () {
            this.$el.find('.o_home_menu_scrollable .o_apps .o_app').draggable({
                helper: "clone",
            });
        },
        _ondragStop: function () {
            if (!config.device.touch) {
                $('body').find('.oe_favorite_menu').removeClass('oe_dropable_view');
                $('body').removeClass('position-fixed');
            }
        },
        _ondragStart: function () {
            if (!config.device.touch) {
                $('body').find('.oe_favorite_menu').addClass('oe_dropable_view');
                $('body').addClass('position-fixed');
            }
        },
    });


    Menu.include({
        menusTemplate: 'Menu.sections',
        events: _.extend({}, Menu.prototype.events, {
            'click #children_toggle': '_onSubmenuToggleClicked',
            'click #av_full_view': '_onFullViewClicked',
            'click #menu_toggle': '_menuClick',
        }),
        init: function (parent, menu_data) {
            this._super.apply(this, arguments);
            this.company_id = session.company_id;
            this.user_id = session.uid;
            this.menu_id = true;
        },
        start: function () {
            this._super.apply(this, arguments);
            this._loadQuickMenu();
        },
        _onFullViewClicked: function (e) {
            $('body').removeClass('nav-sm').toggleClass('ad_full_view');
        },
        _loadQuickMenu: function () {
            var self = this;
            new favoriteMenu(self).appendTo(this.$el.find('.oe_menu_layout.oe_theme_menu_layout'));
        },
    });
});