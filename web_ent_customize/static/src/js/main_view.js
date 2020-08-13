odoo.define('web_ent_customize.MainView', function (require) {
    "use strict";

    $(document).ready(function (require) {

        var $body = $('body'),
            $full_view = $('#av_full_view');

        $(document).click(function (e) {
            if (!$(e.target).find('.o_menu_systray').hasClass('show')) {
                $('.o_menu_systray').removeClass('show');
            }
        });

        if ($(document).width() <= 991) {
            $body.addClass('ad_full_view');
        }
    });
});