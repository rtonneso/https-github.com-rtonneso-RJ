odoo.define('bi_global_search.search_suggestion', function(require) {
    "use strict";


    var ajax = require('web.ajax');
    var core = require('web.core');
    var sAnimation = require('bi_global_search.search_menu');

    var QWeb = core.qweb;
    var _t = core._t;

    sAnimation.include({   
        events: {
            'click .js-typeahead': '_onActivityActionClick', 
        },

        init: function (parent, params) {
            this._super.apply(this, arguments); 
        },

        _onActivityActionClick: function(event) {
            // body...
            event.stopPropagation();
            event.preventDefault();
            var self = this;

            $('.js-typeahead').typeahead({
                minLength: 0,
                maxItem: 14,
                maxItemPerGroup: 6,
                order: "desc",
                hint: true,
                blurOnTab: false,
                searchOnFocus: true,
                blurOnTab: false,
                searchOnFocus: true,
                group: {
                    key: "model_id",
                    template: function (item) {
                        
                        var conference = item.conference;
                        return conference;
                    }
                },

                tyTemplate: 'no result for {{query}}',
                correlativeTemplate: true,
                template: '<b>{{display}}</b>{{line}}',

                source: 
                    {

                        url: [
                                { 

                                    type : "GET", url : "/search/suggestion", 

                                    data : { query : "{{query}}"},

                                },

                            "data.suggestion"] 

                    },

                debug: true

            });
        }

    });
});;