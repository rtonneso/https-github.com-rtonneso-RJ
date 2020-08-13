# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import base64
import time
from colorsys import rgb_to_hls, hls_to_rgb
from odoo import models, fields, api
from ..utils import image_to_rgb, convert_to_image, n_rgb_to_hex


URL_BASE = '/web_company_color/static/src/scss/'
URL_SCSS_GEN_TEMPLATE = URL_BASE + 'custom_colors.%d.%s.gen.scss'


class ResCompany(models.Model):
    _inherit = 'res.company'

    SCSS_TEMPLATE = """
        body {
            //Based on Main Color
            .o_main_navbar > ul > li > a:hover, .o_main_navbar > ul > li > label:hover {
                color: %(color_main)s !important;
            }
            li.o_user_menu a.dropdown-toggle {
                background: -webkit-linear-gradient(left, %(color_main_hover)s 0%%, %(color_main)s 100%%);
                background: linear-gradient(to right, %(color_main_hover)s 0%%, %(color_main)s 100%%);
            }
            .oe_kanban_avatar {
                width: 45px !important;
                height: 45px !important;
            }
            .o_user_menu a.dropdown-toggle:hover {
                background: linear-gradient(to right, %(color_main_hover)s 0%%, %(color_main)s 100%%) !important;
            }
            .o_main_navbar > a:hover, .o_main_navbar > a:focus, .o_main_navbar > button:hover, .o_main_navbar > button:focus {
                color: %(color_main)s !important;
            }
            .o_main_navbar > a, .o_main_navbar > button {
                color: %(color_main_texts)s !important;
            }
            .o_web_studio_navbar_item {
                background-color: %(color_main_hover)s !important;
                border-radius: 20px;
            }

            .o_main_navbar .show .dropdown-toggle {
                color: %(color_main)s;
            }
            .dropdown-menu a:hover {
                color: %(color_main)s !important;
            }
            .btn-primary {
                background-color: %(color_main)s;
                border-color: %(color_main)s;
            }
            .o_form_view .o_form_statusbar > .o_statusbar_status > .o_arrow_button.btn-primary.disabled {
                color: %(color_main)s;
            }
            .o_mail_systray_item .o_notification_counter {
                background: %(color_main)s;
            }
            .o_searchview .o_searchview_facet .o_searchview_facet_label {
                background-color: %(color_main)s;
            }
            .o_control_panel button.btn.btn-secondary.o_button_import {
                color: %(color_main)s;
            }
            .o_control_panel .btn-secondary:not(:disabled):not(.disabled):active, .o_control_panel .btn-secondary:not(:disabled):not(.disabled).active, .o_control_panel .show > .btn-secondary.dropdown-toggle {
                color: %(color_main)s;
                border-color: %(color_main)s;
            }
            .o_control_panel .btn-secondary {
                color: %(color_main_texts)s;
            }
            button.o_dropdown_toggler_btn.btn.btn-secondary.dropdown-toggle {
                color: #424542 !important;
            }
            .o_control_panel .btn-secondary:hover {
                color: %(color_main)s;
                border-color: %(color_main)s;
            }
            .o_calendar_container .o_calendar_sidebar_container .ui-datepicker table .ui-state-active {
                background-color: %(color_main)s;
            }
            .o_field_widget.badge.badge-primary {
                background: %(color_main)s;
            }
            .o_form_view .o_form_uri {
                color: %(color_main)s;
            }
            span.o_stat_value {
                color: %(color_main)s;
            }
            .nav-tabs .nav-link.active, .nav-tabs .nav-item.show .nav-link {
                color: %(color_main)s !important;
                border: 1px solid %(color_main)s;
            }

            .o_form_view .o_notebook > .nav.nav-tabs > .nav-item > .nav-link.active:focus,
            .o_form_view .o_notebook > .nav.nav-tabs > .nav-item > .nav-link.active:active{
                border-top-color: %(color_main)s;
            }

            .btn-secondary {
                color: %(color_main_texts)s !important;
            }

            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_discuss_item:hover {
                color: %(color_main)s;
            }
            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_discuss_item {
                color: %(color_main_texts)s;
            }

            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_sidebar_title h4.o_mail_open_channels:hover {
                color: %(color_main)s;
            }
            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_sidebar_title h4.o_mail_open_channels {
                color: %(color_main_texts)s;
            }
            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_sidebar_title .o_add:hover, .o_mail_discuss .o_mail_discuss_sidebar .o_mail_sidebar_title .o_add:focus, .o_mail_discuss .o_mail_discuss_sidebar .o_mail_sidebar_title .o_add.focus {
                color: %(color_main)s;
            }
            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_sidebar_title .o_add {
                color: %(color_main_texts)s;
            }
            .datepicker .table-sm > tbody > tr > td.active, .datepicker .table-sm > tbody > tr > td .active {
                background-color: %(color_main)s;
            }
            .datepicker .table-sm > thead {
                background-color: %(color_main)s;
            }
            .cybro-main-menu .input-group-text {
                background-color: %(color_main)s !important;
            }
            @media (min-width: 767px) {
            .o_web_client .o_mobile_search .o_mobile_search_header {
                background-color: %(color_main)s !important;
                }
                    button.o_enable_searchview.btn.fa.fa-search {
                    background: %(color_main)s !important;
                }
            }
            .o_mail_discuss .o_mail_discuss_sidebar .o_mail_discuss_item > .badge {
                background-color: %(color_main)s !important;
            }
            a:hover {
                color: %(color_main)s !important;
            }
            a {
                color: %(color_main_texts)s;
            }
            i.fa.fa-th-large {
                color: %(color_main)s !important;
            }
            .btn-primary:hover {
                background: %(color_main_hover)s !important;
                border-color: %(color_main_hover)s;
            }
        }
    """

    company_colors = fields.Serialized()
    color_main = fields.Char('Background Color',
                                  sparse='company_colors')
    color_main_hover = fields.Char(
        'Background Color Hover', sparse='company_colors')
    color_main_texts = fields.Char('Main Texts Color',
                                    sparse='company_colors')

    scss_modif_timestamp = fields.Char('SCSS Modif. Timestamp')

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records.scss_create_or_update_attachment()
        return records

    def unlink(self):
        result = super().unlink()
        IrAttachmentObj = self.env['ir.attachment']
        for record in self:
            IrAttachmentObj.sudo().search([
                ('url', 'like', '%s%%' % record._scss_get_url_simplified()),
            ]).sudo().unlink()
        return result

    def write(self, values):
        if not self.env.context.get('ignore_company_color', False):
            fields_to_check = ('color_main',
                               'color_main_hover',
                               'color_main_texts')
            if 'logo' in values:
                if values['logo']:
                    _r, _g, _b = image_to_rgb(convert_to_image(values['logo']))
                    # Make color 10% darker
                    _h, _l, _s = rgb_to_hls(_r, _g, _b)
                    _l = max(0, _l - 0.1)
                    _rd, _gd, _bd = hls_to_rgb(_h, _l, _s)
                    # Calc. optimal text color (b/w)
                    # Grayscale human vision perception (Rec. 709 values)
                    _a = 1 - (0.2126 * _r + 0.7152 * _g + 0.0722 * _b)
                    values.update({
                        'color_main': n_rgb_to_hex(_r, _g, _b),
                        'color_main_hover': n_rgb_to_hex(_rd, _gd, _bd),
                        'color_main_texts': '#000' if _a < 0.5 else '#fff',
                    })
                else:
                    values.update(self.default_get(fields_to_check))

            result = super().write(values)

            if any([field in values for field in fields_to_check]):
                self.scss_create_or_update_attachment()
        else:
            result = super().write(values)
        return result

    def _scss_get_sanitized_values(self):
        self.ensure_one()
        # Clone company_color as dictionary to avoid ORM operations
        # This allow extend company_colors and only sanitize selected fields
        # or add custom values
        values = dict(self.company_colors or {})
        values.update({
            'color_main': (values.get('color_main')
                                or '$o-brand-odoo'),
            'color_main_hover': (values.get('color_main_hover')
                or '$o-navbar-inverse-link-hover-bg'),
            'color_main_texts': (values.get('color_main_texts') or '#FFF'),
        })
        return values

    def _scss_generate_content(self):
        self.ensure_one()
        # ir.attachment need files with content to work
        if not self.company_colors:
            return "// No Web Company Color SCSS Content\n"
        return self.SCSS_TEMPLATE % self._scss_get_sanitized_values()

    # URL to scss related with this company, without timestamp
    # /web_company_color/static/src/scss/custom_colors.<company_id>
    def _scss_get_url_simplified(self):
        self.ensure_one()
        NTEMPLATE = '.'.join(URL_SCSS_GEN_TEMPLATE.split('.')[:2])
        return NTEMPLATE % self.id

    def scss_get_url(self, timestamp=None):
        self.ensure_one()
        return URL_SCSS_GEN_TEMPLATE % (self.id,
                                        timestamp or self.scss_modif_timestamp)

    def scss_create_or_update_attachment(self):
        IrAttachmentObj = self.env['ir.attachment']
        # The time window is 1 second
        # This mean that all modifications realized in that second will
        # have the same timestamp
        modif_timestamp = str(int(time.time()))
        for record in self:
            datas = base64.b64encode(
                record._scss_generate_content().encode('utf-8'))
            custom_attachment = IrAttachmentObj.sudo().search([
                ('url', 'like', '%s%%' % record._scss_get_url_simplified())
            ])
            custom_url = record.scss_get_url(timestamp=modif_timestamp)
            values = {
                'datas': datas,
                'url': custom_url,
                'name': custom_url,
                'store_fname': custom_url.split("/")[-1],
            }
            if custom_attachment:
                custom_attachment.sudo().write(values)
            else:
                values.update({
                    'type': 'binary',
                    'mimetype': 'text/scss',
                })
                IrAttachmentObj.sudo().create(values)
        self.write({'scss_modif_timestamp': modif_timestamp})
        self.env['ir.qweb'].sudo().clear_caches()
