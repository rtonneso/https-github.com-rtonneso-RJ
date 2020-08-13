odoo.define('web_ent_customize.FavoriteMenu', function (require) {
    "use strict";

    const core = require('web.core');
    var Widget = require('web.Widget');
    const session = require('web.session');
    const config = require('web.config');
    const QWeb = core.qweb;
    const _t = core._t;

    var FavoriteMenuWidget = Widget.extend({
        template: 'menu.FavoriteMenu',
        resModel: 'ir.favorite.menu',
        events: {
            'click .oe_apps_menu .o_app.oe_favorite': '_onOpenMenu',
        },

        init: function () {
            this._super.apply(this, arguments);
            this.menus = [];
            this.debug = config.isDebug() ? '?debug' : '';
            this.isTouchDevice = config.device.touch;
            this.favoriteMenuNameById = {};
        },

        _doInitMenu: function() {
            var self = this;
            return self._rpc({
                model: self.resModel,
                method: 'search_read',
                args: [[['user_id', '=', session.uid]]],
                kwargs: {fields: ['favorite_menu_id', 'user_id', 'sequence', 'favorite_menu_xml_id', 'favorite_menu_action_id']}
            }).then(function (menu_data) {
                self.menus = menu_data;
                _.each(menu_data, function(menu) {
                    self.favoriteMenuNameById[menu.favorite_menu_id[0]] = menu.favorite_menu_id[1];
                });
            });
        },

        willStart: function () {
            return Promise.all([this._doInitMenu(), this._super.apply(this, arguments)]);
        },

        _render: function() {
            var $targetToAppend = this.$('.oe_apps_menu');
            $targetToAppend.empty();
            $(QWeb.render('menu.FavoriteMenuItem', {
                widget: this
            })).appendTo($targetToAppend);
            if (!this.isTouchDevice) {
                this._linkingEvents();
            };
        },

        _onDroppableElement: function() {
            var self = this;

            var isMenuNotFavourited = function(newId) {
                return _.isEmpty(_.filter(self.menus, function(menu) {
                    return menu.favorite_menu_id[0] === newId;
                }));
            };

            this.$el.droppable({
                tolerance: 'pointer',
                activate: (event, ui) => {
                    if ($(ui.draggable).hasClass('o_menuitem')) { return; };
                    self.$el.parents('body').find('.o_home_menu_scrollable .o_apps').addClass('oe_view_delete');
                },
                drop: (event, ui) => {
                    if (!$(ui.draggable).hasClass('o_menuitem')) { return; };
                    var menu_id = $(ui.draggable).data('menu');
                    if (isMenuNotFavourited(menu_id)) {
                        self._makeFavourited({
                            favorite_menu_id: menu_id,
                            favorite_menu_xml_id: $(ui.draggable).data('menu-xmlid'),
                            favorite_menu_action_id: $(ui.draggable).data('action-id'),
                            user_id: session.uid
                        });
                    } else {
                        self.do_warn(_.str.sprintf(_t('%s is already favourited!'), self.favoriteMenuNameById[menu_id]));
                    }
                    self.$el.parents('body').find('.o_home_menu_scrollable .o_apps').removeClass('oe_view_delete');
                },
                deactivate: (event, ui) => {
                    self.$el.parents('body').find('.o_home_menu_scrollable .o_apps').removeClass('oe_view_delete');
                },
            });
        },

        _bindToRemoveOnDroppable: function() {
            var self = this;
            var $HomeMenuApps = this.$el.parents('body').find('.o_home_menu_scrollable .o_apps');
            $HomeMenuApps.droppable({
                tolerance: 'pointer',
                drop: (event, ui) => {
                    if ($(ui.draggable).hasClass('oe_favorite')) {
                        var MenuId = $(ui.draggable).data('id');
                        var FavoriteMenuId = $(ui.draggable).data('menu-id');
                        var user = session.uid;
                        return self._rpc({
                            model: self.resModel,
                            method: 'unlink',
                            args: [MenuId],
                        }).then(function (res) {
                            if (res === true) {
                                return self._doInitMenu().then(() => {
                                    self._render();
                                    self.do_notify(_.str.sprintf(_t('%s removed from favorite.'), self.favoriteMenuNameById[FavoriteMenuId]));
                                });
                            };
                        });
                    };
                },
            });
        },

        _onSortableElement: function() {
            var self = this;
            this.$('#oe_shorting').sortable({
                start: (event, ui) => {
                    self.$el.parents('body').find('.o_home_menu_scrollable .o_apps').addClass('oe_view_delete');
                },
                stop: (event, ui) => {
                    self.$el.parents('body').find('.o_home_menu_scrollable .o_apps').removeClass('oe_view_delete');
                    ui.item.trigger('drop', ui.item.index());
                    var dragMenu = parseInt($(ui.item).data('menu-sequence'));
                    var nextMenu = $(ui.item).nextAll();
                    nextMenu.each(function () {
                        var vals = {};
                        dragMenu = dragMenu + 1;
                        var menu_id = $(this).data('id');
                        vals['sequence'] = dragMenu;
                        vals['favorite_menu_id'] = $(this).data('menu-id');
                        self._rpc({
                            model: self.resModel,
                            method: 'write',
                            args: [[menu_id], vals],
                        });
                    });
                },
            });
        },

        _linkingEvents: function() {
            this._onDroppableElement();
            this._bindToRemoveOnDroppable();
            this._onSortableElement();
        },

        start: function () {
            return Promise.all([this._render(), this._super()]);
        },

        _makeFavourited: function(values) {
            var self = this;
            return this._rpc({
                model: self.resModel,
                method: 'create',
                args: [values],
            }).then(function () {
                return self._doInitMenu().then(() => {
                    self._render();
                    self.do_notify(_.str.sprintf(_t('%s added to favorite.'), self.favoriteMenuNameById[values.favorite_menu_id]));
                });
            });
        },

        _onOpenMenu: function (event) {
            var self = this;
            var $el = $(event.currentTarget);
            //in case need in future
        },

    });

    return FavoriteMenuWidget;

});