odoo.define('aspl_section_sub_total.section_with_total', function (require)
{
"use strict";
var FieldChar = require('web.basic_fields').FieldChar;
var FieldOne2Many = require('web.relational_fields').FieldOne2Many;
var fieldRegistry = require('web.field_registry');
var ListFieldText = require('web.basic_fields').ListFieldText;
var ListRenderer = require('web.ListRenderer');
var SectionAndNoteListRenderer = require('account.section_and_note_backend');

SectionAndNoteListRenderer.include({

    _renderBodyCell: function (record, node, index, options) {
        var $cell = this._super.apply(this, arguments);
        if (record.model === 'sale.order.line' ||
        record.model === 'purchase.order.line'){
            var isSection = record.data.display_type === 'line_section';
            var isNote = record.data.display_type === 'line_note';
            if (isSection || isNote) {
                if (node.attrs.widget === "handle") {
                    return $cell;
                }
//                else if (node.attrs.name === "section_total"){
//                    $cell.removeClass('o_hidden');
//                }
                else if (node.attrs.name === "price_subtotal"){
                    $cell.removeClass('o_hidden');
                    $cell[0].innerHTML = record.data.section_total;
                }
                else if (node.attrs.name === "name") {
                    var nbrColumns = this._getNumberOfCols();
                    if (this.handleField) {
                        nbrColumns--;
                    }
                    if (this.addTrashIcon) {
                        nbrColumns--;
                    }
                    $cell.attr('colspan', nbrColumns-1);
                } else {
                    $cell.removeClass('o_invisible_modifier');
                    return $cell.addClass('o_hidden');
                }
            }
            return $cell;
        }
        return $cell;
    },

});

});