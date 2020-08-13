(function($) {
    $.fn.resizableColumns = function() {
      var isColResizing = false;
      var resizingPosX = 0;
      var _table = $(this);
      var _thead = $(this).find('thead');

      _thead.find('th').each(function() {
        $(this).css('position', 'relative');
        if (!($(this).text() === "S.No" || $(this).hasClass("o_list_record_selector"))){
            $(this).append("<div class='resizer' style='position:absolute;top:0px;right:-3px;bottom:0px;width:8px;z-index:999;background:transparent;cursor:col-resize'></div>");
        }
      })

      $(document).mouseup(function(e) {
        _thead.find('th').removeClass('resizing');
        isColResizing = false;
        e.stopPropagation();
      })

      _table.find('.resizer').mousedown(function(e) {
        _thead.find('th').removeClass('resizing');
        $(_thead).find('tr:first-child th:nth-child(' + ($(this).closest('th').index() + 1) + ') .resizer').closest('th').addClass('resizing');
        resizingPosX = e.pageX;
        isColResizing = true;
        e.stopPropagation();
      })

      _table.mousemove(function(e) {
        if (isColResizing) {
          var _resizing = _thead.find('th.resizing .resizer');
          if (_resizing.length) {
            var _pageX = e.pageX || 0;
            var _widthDiff = _pageX - resizingPosX;
            var _setWidth = _resizing.closest('th').innerWidth() + _widthDiff;
            $(_table.find("th.ks_fix_width")).css("width","");
			$(_table.find("th.ks_fix_width")).css("width","");
             if($.find("th.o_many2many_tags_cell").length){
                var ks_many2many_tag_width = $($.find("th.o_many2many_tags_cell")).innerWidth();
                $($.find(".o_field_widget.o_field_many2manytags .badge .o_badge_text")).css("max-width",String(ks_many2many_tag_width)+"px");
                $($.find(".o_field_widget.o_field_many2manytags")).css("max-width",String(ks_many2many_tag_width)+"px");
            }

            if (resizingPosX != 0 && _widthDiff != 0 && _setWidth > 0 ) {
              _resizing.closest('th').innerWidth(_setWidth);
              resizingPosX = e.pageX;
              _thead.innerWidth(_table.innerWidth()+_widthDiff);
              _table.innerWidth(_table.innerWidth()+_widthDiff);
            }
          }
        }
      })
    };
  }
(jQuery));
