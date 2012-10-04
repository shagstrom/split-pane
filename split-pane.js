/*!

Split Pane v0.1

Copyright (c) 2012 Simon Hagström

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(function($) {
	
	var dragging = false;

	$.fn.splitPane = function() {
		this.each(function(){
			setMinHeightAndMinWidth(this);
			parentresizeHandler.apply(this);
			$(this).bind('_splitpaneparentresize', parentresizeHandler);
		});
		this.append('<div class="split-pane-resize-shim">');
		this.children('.split-pane-divider').bind('mousedown', mousedownHandler);
	}

	var SPLITPANERESIZE_HANDLER = '_splitpaneparentresizeHandler';

	jQuery.event.special._splitpaneparentresize = {
		setup: function(data, namespaces) {
			var element = this;
			var parent = $(this).parent().closest('.split-pane').get(0) || window;
			$(this).data(SPLITPANERESIZE_HANDLER, function(event) {
				var target = event.target === document ? window : event.target;
				if (target === parent) {
					event.type = "_splitpaneparentresize";
					jQuery.event.handle.apply(element, arguments);
				} else {
					event.stopPropagation();
				}
			});
			$(parent).bind('resize', $(this).data(SPLITPANERESIZE_HANDLER));
	    },
	    teardown: function(namespaces) {
			var parent = $(this).parent().closest('.split-pane').get(0) || window;
			$(parent).unbind('resize', $(this).data(SPLITPANERESIZE_HANDLER));
	    	$(this).removeData(SPLITPANERESIZE_HANDLER);
		}
	};

	function setMinHeightAndMinWidth(splitPane) {
		var $splitPane = $(splitPane),
			$firstComponent = $splitPane.children('.split-pane-component:first'),
			$divider = $splitPane.children('.split-pane-divider'),
			$lastComponent = $splitPane.children('.split-pane-component:last');
		if ($splitPane.is('.fixed-top, .fixed-bottom, .horizontal-percent')) {
			var firstComponentMinHeight = parseInt($firstComponent.css('min-height')) || 0,
				lastComponentMinHeight = parseInt($lastComponent.css('min-height')) || 0;
			$splitPane.css('min-height', (firstComponentMinHeight + lastComponentMinHeight + $divider.height()) + 'px');
		} else {
			var firstComponentMinWidth = parseInt($firstComponent.css('min-width')) || 0,
				lastComponentMinWidth = parseInt($lastComponent.css('min-width')) || 0;
			$splitPane.css('min-width', (firstComponentMinWidth + lastComponentMinWidth + $divider.width()) + 'px');
		}
	}

	function mousedownHandler(event) {
		event.preventDefault();
		var $resizeShim = $(this).siblings('.split-pane-resize-shim').show();
		var mousemove = createMousemove($(this).parent(), event.pageX, event.pageY);
		$(document).mousemove(mousemove);
		$(document).one('mouseup', function(event) {
			$resizeShim.hide();
			$(document).unbind('mousemove', mousemove);
			mousemove(event);
		});
	};

	function parentresizeHandler() {
		var $splitPane = $(this),
			$firstComponent = $splitPane.children('.split-pane-component:first'),
			$divider = $splitPane.children('.split-pane-divider'),
			$lastComponent = $splitPane.children('.split-pane-component:last');
		if ($splitPane.is('.fixed-top')) {
			var lastComponentMinHeight = parseInt($lastComponent.css('min-height')) || 0;
			var maxfirstComponentHeight = $splitPane.height() - lastComponentMinHeight - $divider.height();
			if ($firstComponent.height() > maxfirstComponentHeight) {
				setTop($firstComponent, $divider, $lastComponent, maxfirstComponentHeight + 'px');
			};
		} else if ($splitPane.is('.fixed-bottom')) {
			var firstComponentMinHeight = parseInt($firstComponent.css('min-height')) || 0;
			var maxlastComponentHeight = $splitPane.height() - firstComponentMinHeight - $divider.height();
			if ($lastComponent.height() > maxlastComponentHeight) {
				setBottom($firstComponent, $divider, $lastComponent, maxlastComponentHeight + 'px')
			}
		} else if ($splitPane.is('.horizontal-percent')) {
			var firstComponentMinHeight = parseInt($firstComponent.css('min-height')) || 0;
			var maxlastComponentHeight = $splitPane.height() - firstComponentMinHeight - $divider.height();
			if ($lastComponent.height() > maxlastComponentHeight) {
				setBottom($firstComponent, $divider, $lastComponent, (maxlastComponentHeight / $splitPane.height() * 100) + '%');
			} else {
				var lastComponentMinHeight = parseInt($lastComponent.css('min-height')) || 0;
				if ($splitPane.height() - $firstComponent.height() - $divider.height() < lastComponentMinHeight) {
					setBottom($firstComponent, $divider, $lastComponent, (lastComponentMinHeight / $splitPane.height() * 100) + '%');
				}
			}
		} else if ($splitPane.is('.fixed-left')) {
			var lastComponentMinWidth = parseInt($lastComponent.css('min-width')) || 0;
			var maxfirstComponentWidth = $splitPane.width() - lastComponentMinWidth - $divider.width();
			if ($firstComponent.width() > maxfirstComponentWidth) {
				setLeft($firstComponent, $divider, $lastComponent, maxfirstComponentWidth + 'px');
			};
		} else if ($splitPane.is('.fixed-right')) {
			var firstComponentMinWidth = parseInt($firstComponent.css('min-width')) || 0;
			var maxlastComponentWidth = $splitPane.width() - firstComponentMinWidth - $divider.width();
			if ($lastComponent.width() > maxlastComponentWidth) {
				setRight($firstComponent, $divider, $lastComponent, maxlastComponentWidth + 'px')
			}
		} else if ($splitPane.is('.vertical-percent')) {
			var firstComponentMinWidth = parseInt($firstComponent.css('min-width')) || 0;
			var maxlastComponentWidth = $splitPane.width() - firstComponentMinWidth - $divider.width();
			if ($lastComponent.width() > maxlastComponentWidth) {
				setRight($firstComponent, $divider, $lastComponent, (maxlastComponentWidth / $splitPane.width() * 100) + '%');
			} else {
				var lastComponentMinWidth = parseInt($lastComponent.css('min-width')) || 0;
				if ($splitPane.width() - $firstComponent.width() - $divider.width() < lastComponentMinWidth) {
					setRight($firstComponent, $divider, $lastComponent, (lastComponentMinWidth / $splitPane.width() * 100) + '%');
				}
			}
		}
		$splitPane.resize();
	}

	function createMousemove($splitPane, pageX, pageY) {
		var $firstComponent = $splitPane.children('.split-pane-component:first'),
			$divider = $splitPane.children('.split-pane-divider'),
			$lastComponent = $splitPane.children('.split-pane-component:last');
			parentHeight = $divider.parent().height(),
			parentWidth = $divider.parent().width(),
			dividerWidth = $divider.width(),
			dividerHeight = $divider.height();
		if ($divider.parent().is('.fixed-top')) {
			var firstComponentMinHeight = parseInt($firstComponent.css('min-height')) || 0,
				lastComponentMinHeight = parseInt($lastComponent.css('min-height')) || 0,
				topOffset = $divider.position().top - pageY;
			return function(event) {
				event.preventDefault();
				var top = Math.min(Math.max(firstComponentMinHeight, topOffset + event.pageY),
						parentHeight - lastComponentMinHeight - dividerHeight);
				setTop($firstComponent, $divider, $lastComponent, top + 'px')
				$splitPane.resize();
			};
		} else if ($divider.parent().is('.horizontal-percent')) {
			var firstComponentMinHeight = parseInt($firstComponent.css('min-height')) || 0,
				lastComponentMinHeight = parseInt($lastComponent.css('min-height')) || 0,
				bottomOffset = $lastComponent.height() + pageY;
			return function(event) {
				event.preventDefault();
				var bottom = Math.min(Math.max(lastComponentMinHeight, bottomOffset - event.pageY),
						parentHeight - firstComponentMinHeight - dividerHeight);
				setBottom($firstComponent, $divider, $lastComponent, (bottom / parentHeight * 100) + '%');
				$splitPane.resize();
			};
		} else if ($divider.parent().is('.fixed-bottom')) {
			var firstComponentMinHeight = parseInt($firstComponent.css('min-height')) || 0,
				lastComponentMinHeight = parseInt($lastComponent.css('min-height')) || 0,
				bottomOffset = $lastComponent.height() + pageY;
			return function(event) {
				event.preventDefault();
				var bottom = Math.min(Math.max(lastComponentMinHeight, bottomOffset - event.pageY),
						parentHeight - firstComponentMinHeight - dividerHeight);
				setBottom($firstComponent, $divider, $lastComponent, bottom + 'px');
				$splitPane.resize();
			};
		} else if ($divider.parent().is('.fixed-left')) {
			var firstComponentMinWidth = parseInt($firstComponent.css('min-width')) || 0,
				lastComponentMinWidth = parseInt($lastComponent.css('min-width')) || 0,
				leftOffset = $divider.position().left - pageX;
			return function(event) {
				event.preventDefault();
				var left = Math.min(Math.max(firstComponentMinWidth, leftOffset + event.pageX),
						parentWidth - lastComponentMinWidth - dividerWidth);
				setLeft($firstComponent, $divider, $lastComponent, left + 'px')
				$splitPane.resize();
			};
		} else if ($divider.parent().is('.fixed-right')) {
			var firstComponentMinWidth = parseInt($firstComponent.css('min-width')) || 0,
				lastComponentMinWidth = parseInt($lastComponent.css('min-width')) || 0,
				rightOffset = $lastComponent.width() + pageX;
			return function(event) {
				event.preventDefault();
				var right = Math.min(Math.max(lastComponentMinWidth, rightOffset - event.pageX),
						parentWidth - firstComponentMinWidth - dividerWidth);
				setRight($firstComponent, $divider, $lastComponent, right + 'px');
				$splitPane.resize();
			};
		} else if ($divider.parent().is('.vertical-percent')) {
			var firstComponentMinWidth = parseInt($firstComponent.css('min-width')) || 0,
				lastComponentMinWidth = parseInt($lastComponent.css('min-width')) || 0,
				rightOffset = $lastComponent.width() + pageX;
			return function(event) {
				event.preventDefault();
				var right = Math.min(Math.max(lastComponentMinWidth, rightOffset - event.pageX),
						parentWidth - firstComponentMinWidth - dividerWidth);
				setRight($firstComponent, $divider, $lastComponent, (right / parentWidth * 100) + '%');
				$splitPane.resize();
			};
		}
	}

	function setTop($firstComponent, $divider, $lastComponent, top) {
		$firstComponent.css('height', top);
		$divider.css('top', top);
		$lastComponent.css('top', top);
	}

	function setBottom($firstComponent, $divider, $lastComponent, bottom) {
		$firstComponent.css('bottom', bottom);
		$divider.css('bottom', bottom);
		$lastComponent.css('height', bottom);
	}

	function setLeft($firstComponent, $divider, $lastComponent, left) {
		$firstComponent.css('width', left);
		$divider.css('left', left);
		$lastComponent.css('left', left);
	}

	function setRight($firstComponent, $divider, $lastComponent, right) {
		$firstComponent.css('right', right);
		$divider.css('right', right);
		$lastComponent.css('width', right);
	}

})(jQuery);
