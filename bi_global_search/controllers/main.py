# -*- coding: utf-8 -*-

import re
import json
import base64
import logging
from datetime import datetime, date
from operator import itemgetter
from werkzeug.exceptions import Forbidden
from odoo import http, SUPERUSER_ID, tools, _
from werkzeug.exceptions import NotFound, Forbidden
from odoo.http import request
import werkzeug.urls
import werkzeug.wrappers


def most_frequent(List):
    if List:
        return max(set(List), key = List.count)
    else:
        return []

class SearchResult(http.Controller):

    @http.route('/search_main', type='http', auth="user", csrf=False)
    def search_main(self, **post):
        if post:
            user_brw = request.env['res.users'].sudo().browse(request.session.uid)
            search_ids = request.env['global.search'].sudo().search([])
            market = ''
            value_ids = ''
            y = []
            z = []
            if search_ids:
                for search_id in search_ids:
                    x = []

                    field_list = []
                    model_name = str(search_id.model_id.model)
                    for field_name in search_id.field_ids:
                        if field_name.ttype == 'datetime' or field_name.ttype == 'date':
                            pass
                        elif not field_name.store:
                            if not field_name.search:
                                pass
                        else:
                            field_list.append(field_name.name)
                        if search_id.model_id._rec_name not in field_list:
                            field_list.append(search_id.model_id._rec_name)

                    string = post['search'].replace('|',',').replace(':',',').split(',')

                    for value in field_list:
                        for val in string:
                            try:
                                value_ids = request.env[model_name].sudo().search([(value,'=',val.strip())])      
                            except Exception as e:
                                return werkzeug.utils.redirect('/web', 303)
                            for val in value_ids:
                                if val.id != False:
                                    x.append(val)
                                    z.append(model_name)
                            
                    y = y + x
                    
                model = most_frequent(z)
                val = most_frequent(y) 
                if val:
                    y = []
                    z = []
                    market = '/web#id=%s&model=%s&view_type=form' % (str(val.id),str(model))
                    return werkzeug.utils.redirect(market, 303)
            else:
                return werkzeug.utils.redirect('/web', 303)
        else:
            return werkzeug.utils.redirect('/web', 303)


class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            encoded_object = list(obj.timetuple())[0:6]
        else:
            encoded_object =json.JSONEncoder.default(self, obj)
        return encoded_object


class OdooWebsiteSearchSuggestion(http.Controller):
    @http.route(['/search/suggestion'], type='http', auth="public", website=True)
    def search_suggestion(self, **post):
        user_brw = request.env['res.users'].sudo().browse(request.session.uid)
        group_id = [a.id for a in user_brw.groups_id]
        search_ids = request.env['global.search'].sudo().search([])
        if post:
            if not search_ids:
                raise NotFound()
            suggestion_list = []
            final_list = []
            for search_id in search_ids:
                value_ids = False
                read_prod = False
                read_rec = False
                if user_brw.id in search_id.user_id.ids:

                    model_name = str(search_id.model_id.model)
                    
                    model_id = str(search_id.model_id.name)
                    
                    field_list = []
                    field_description = []
                    
                    for field_name in search_id.field_ids:
                        if not field_name.store:
                            if not field_name.search:
                                pass
                        elif field_name not in field_list:
                            field_list.append(field_name)
                    
                    for suggestion in post.get('query').split(" "):

                        value_ids = request.env[model_name].sudo().search([])

                        read_rec = value_ids.read([name._rec_name for name in value_ids])
                        
                        for val in read_rec:
                            if 'model_id' not in val:
                                val.update({'model_id' : model_id})


                        read_prod = value_ids.read([name.name for name in field_list])

                        if read_prod not in suggestion_list:
                            suggestion_list = suggestion_list + read_prod


                    for line in suggestion_list:
                        if 'model_id' not in line:
                            line.update({'model_id' : model_id})
                            
                            for val in read_rec:
                                display = ''
                                if ('id' in val) and ('id' in line):    
                                    if ('model_id' in val) and ('model_id' in line):
                                        if (line['id'] == val['id']) and (line['model_id'] == val['model_id']):
                                            if 'model_id' in val:
                                                del val['model_id']
                                            if 'id' in val:
                                                del val['id']
                                            iters = [val for val in val.values()]
                                            x1 = list(filter(lambda item: item, iters))
                                            if len(x1) != 0:
                                                for i in x1:
                                                    if i == 'False' or i == False in x:
                                                        continue
                                                    else:
                                                        display += i 
                                            if display:
                                                display = display + ' | '
                                            else:
                                                display = display

                                            line.update({'display' : display})
                            if 'id' in line:
                                del line['id']
                            if 'model_id' in line:
                                del line['model_id']
                            iterator = [value for value in line.values()]
                            itera = []
                            if line:
                                for key,val in line.items():
                                    if not key == 'display':
                                        for field in field_list:
                                            if field.name == key:
                                                if isinstance(val, date):
                                                    pass
                                                elif isinstance(val, list):
                                                    pass
                                                elif isinstance(val, bool):
                                                    pass
                                                elif isinstance(val, tuple):
                                                    if len(val) == 2:
                                                        x = val[1].replace(',',' ')
                                                        val1 = field.field_description + ':' + x
                                                        itera.append(val1)
                                                else:
                                                    val = field.field_description + ':' + val
                                                    itera.append(val)
                           
                            x = list(filter(lambda item: item, itera))
                            xx = []
                            for i in x:
                                if i == 'False' or i == False in x:
                                    continue
                                else:
                                    if i not in xx:
                                        xx.append(i)
                            lines = []
                            if xx:
                                for val in xx:
                                    if isinstance(val, date):
                                        val = val.strftime('%Y-%m-%d')
                                        lines.append(val)
                                    elif isinstance(val, list):
                                        continue
                                    elif isinstance(val, tuple):
                                        if len(val) == 2:
                                            if val not in lines:
                                                lines.append(val[1].replace(',',' '))
                                    elif val not in lines:
                                        lines.append(val)
                                    else:
                                        pass

                            if len(lines) != 0:
                                line.update({'line' : lines,'model_id' : model_id})
                        
                                           
                        if line not in final_list:
                            final_list.append(line.copy())
            data={}
            data['status']=True,
            data['error']=None,
            data['data']={'suggestion':final_list}
            return json.dumps(data, cls=DateTimeEncoder)