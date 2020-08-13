# -*- coding: utf-8 -*-

from . import model
from . import controllers
from odoo.api import Environment, SUPERUSER_ID


def post_install_hook(cr, registry):
    env = Environment(cr, SUPERUSER_ID, {})
    ks_user_data = {"users": [(4, user_id.id) for user_id in (env['res.users'].search([]))]}
    ks_list_view_manager_edit_and_read = env.ref('ks_list_view_manager.ks_list_view_manager_edit_and_read')
    ks_list_view_manager_edit_and_read.write(ks_user_data)

    ks_list_view_manager_dynamic_list = env.ref('ks_list_view_manager.ks_list_view_manager_dynamic_list')
    ks_list_view_manager_dynamic_list.write(ks_user_data)

    ks_list_view_manager_advance_search = env.ref('ks_list_view_manager.ks_list_view_manager_advance_Search')
    ks_list_view_manager_advance_search.write(ks_user_data)
