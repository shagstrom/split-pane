/*!

Split Pane v0.4.0

Copyright (c) 2014 Simon Hagström

Released under the MIT license
https://raw.github.com/shagstrom/split-pane/master/LICENSE

*/
(function($) {
	
	$.fn.splitPane = function() {
		var $splitPanes = this;
		$splitPanes.each(setMinHeightAndMinWidth);
		$splitPanes.append('<div class="split-pane-resize-shim">');
		$splitPanes.children('.split-pane-divider').bind('mousedown touchstart', mousedownHandler);
		setTimeout(function() {
			// Doing this later because of an issue with Chrome (v23.0.1271.64) returning split-pane width = 0
			// and triggering multiple resize events when page is being opened from an <a target="_blank"> .
			$splitPanes.each(function() {
				$(this).bind('_splitpaneparentresize', createParentresizeHandler($(this)));
			});
			$(window).trigger('resize');
		}, 100);
	};

	var SPLITPANERESIZE_HANDLER = '_splitpaneparentresizeHandler';

	/**
	 * A special event that will "capture" a resize event from the parent split-pane or window.
	 * The event will NOT propagate to grandchildren.
	 */
	jQuery.event.special._splitpaneparentresize = {
		setup: function(data, namespaces) {
			var element = this,
				parent = $(this).parent().closest('.split-pane')[0] || window;
			$(this).data(SPLITPANERESIZE_HANDLER, function(event) {
				var target = event.target === document ? window : event.target;
				if (target === parent) {
					event.type = "_splitpaneparentresize";
					jQuery.event.dispatch.apply(element, arguments);
				} else {
					event.stopPropagation();
				}
			});
			$(parent).bind('resize', $(this).data(SPLITPANERESIZE_HANDLER));
		},
		teardown: function(namespaces) {
			var parent = $(this).parent().closest('.split-pane')[0] || window;
			$(parent).unbind('resize', $(this).data(SPLITPANERESIZE_HANDLER));
			$(this).removeData(SPLITPANERESIZE_HANDLER);
		}
	};

	function setMinHeightAndMinWidth() {
		var $splitPane = $(this),
			$firstComponent = $splitPane.children('.split-pane-component:first'),
			$divider = $splitPane.children('.split-pane-divider'),
			$lastComponent = $splitPane.children('.split-pane-component:last');
		if ($splitPane.is('.fixed-top, .fixed-bottom, .horizontal-percent')) {
			$splitPane.css('min-height', (minHeight($firstComponent) + minHeight($lastComponent) + $divider.height()) + 'px');
		} else {
			$splitPane.css('min-width', (minWidth($firstComponent) + minWidth($lastComponent) + $divider.width()) + 'px');
		}
	}

	function mousedownHandler(event) {
		event.preventDefault();
		var isTouchEvent = event.type.match(/^touch/),
			moveEvent = isTouchEvent ? 'touchmove' : 'mousemove',
			endEvent = isTouchEvent? 'touchend' : 'mouseup',
			$divider = $(this),
			$splitPane = $divider.parent(),
			$resizeShim = $divider.siblings('.split-pane-resize-shim');
		$resizeShim.show();
		$divider.addClass('dragged');
		if (isTouchEvent) {
			$divider.addClass('touch');
		}
		$(document).on(moveEvent, createMousemove($splitPane, pageXof(event), pageYof(event)));
		$(document).one(endEvent, function(event) {
			$(document).unbind(moveEvent);
			$divider.removeClass('dragged touch');
			$resizeShim.hide();
		});
	}

	function createParentresizeHandler($splitPane) {
		var splitPane = $splitPane[0],
			firstComponent = $splitPane.children('.split-pane-component:first')[0],
			divider = $splitPane.children('.split-pane-divider')[0],
			lastComponent = $splitPane.children('.split-pane-component:last')[0];
		if ($splitPane.is('.fixed-top')) {
			var lastComponentMinHeight = minHeight(lastComponent);
			return function(event) {
				var maxfirstComponentHeight = splitPane.offsetHeight - lastComponentMinHeight - divider.offsetHeight;
				if (firstComponent.offsetHeight > maxfirstComponentHeight) {
					setTop(firstComponent, divider, lastComponent, maxfirstComponentHeight + 'px');
				}
				$splitPane.resize();
			};
		} else if ($splitPane.is('.fixed-bottom')) {
			var firstComponentMinHeight = minHeight(firstComponent);
			return function(event) {
				var maxLastComponentHeight = splitPane.offsetHeight - firstComponentMinHeight - divider.offsetHeight;
				if (lastComponent.offsetHeight > maxLastComponentHeight) {
					setBottom(firstComponent, divider, lastComponent, maxLastComponentHeight + 'px')
				}
				$splitPane.resize();
			};
		} else if ($splitPane.is('.horizontal-percent')) {
			var lastComponentMinHeight = minHeight(lastComponent),
				firstComponentMinHeight = minHeight(firstComponent);
			return function(event) {
				var maxLastComponentHeight = splitPane.offsetHeight - firstComponentMinHeight - divider.offsetHeight;
				if (lastComponent.offsetHeight > maxLastComponentHeight) {
					setBottom(firstComponent, divider, lastComponent, (maxLastComponentHeight / splitPane.offsetHeight * 100) + '%');
				} else {
					if (splitPane.offsetHeight - firstComponent.offsetHeight - divider.offsetHeight < lastComponentMinHeight) {
						setBottom(firstComponent, divider, lastComponent, (lastComponentMinHeight / splitPane.offsetHeight * 100) + '%');
					}
				}
				$splitPane.resize();
			};
		} else if ($splitPane.is('.fixed-left')) {
			var lastComponentMinWidth = minWidth(lastComponent);
			return function(event) {
				var maxFirstComponentWidth = splitPane.offsetWidth - lastComponentMinWidth - divider.offsetWidth;
				if (firstComponent.offsetWidth > maxFirstComponentWidth) {
					setLeft(firstComponent, divider, lastComponent, maxFirstComponentWidth + 'px');
				}
				$splitPane.resize();
			};
		} else if ($splitPane.is('.fixed-right')) {
			var firstComponentMinWidth = minWidth(firstComponent);
			return function(event) {
				var maxLastComponentWidth = splitPane.offsetWidth - firstComponentMinWidth - divider.offsetWidth;
				if (lastComponent.offsetWidth > maxLastComponentWidth) {
					setRight(firstComponent, divider, lastComponent, maxLastComponentWidth + 'px');
				}
				$splitPane.resize();
			};
		} else if ($splitPane.is('.vertical-percent')) {
			var lastComponentMinWidth = minWidth(lastComponent),
				firstComponentMinWidth = minWidth(firstComponent);
			return function(event) {
				var maxLastComponentWidth = splitPane.offsetWidth - firstComponentMinWidth - divider.offsetWidth;
				if (lastComponent.offsetWidth > maxLastComponentWidth) {
					setRight(firstComponent, divider, lastComponent, (maxLastComponentWidth / splitPane.offsetWidth * 100) + '%');
				} else {
					if (splitPane.offsetWidth - firstComponent.offsetWidth - divider.offsetWidth < lastComponentMinWidth) {
						setRight(firstComponent, divider, lastComponent, (lastComponentMinWidth / splitPane.offsetWidth * 100) + '%');
					}
				}
				$splitPane.resize();
			};
		}
	}

	function createMousemove($splitPane, pageX, pageY) {
		var splitPane = $splitPane[0],
			firstComponent = $splitPane.children('.split-pane-component:first')[0],
			divider = $splitPane.children('.split-pane-divider')[0],
			lastComponent = $splitPane.children('.split-pane-component:last')[0];
		if ($splitPane.is('.fixed-top')) {
			var firstComponentMinHeight =  minHeight(firstComponent),
				maxFirstComponentHeight = splitPane.offsetHeight - minHeight(lastComponent) - divider.offsetHeight,
				topOffset = divider.offsetTop - pageY;
			return function(event) {
				event.preventDefault();
				var top = Math.min(Math.max(firstComponentMinHeight, topOffset + pageYof(event)), maxFirstComponentHeight);
				setTop(firstComponent, divider, lastComponent, top + 'px');
				$splitPane.resize();
			};
		} else if ($splitPane.is('.fixed-bottom')) {
			var lastComponentMinHeight = minHeight(lastComponent),
				maxLastComponentHeight = splitPane.offsetHeight - minHeight(firstComponent) - divider.offsetHeight,
				bottomOffset = lastComponent.offsetHeight + pageY;
			return function(event) {
				event.preventDefault();
				var bottom = Math.min(Math.max(lastComponentMinHeight, bottomOffset - pageYof(event)), maxLastComponentHeight);
				setBottom(firstComponent, divider, lastComponent, bottom + 'px');
				$splitPane.resize();
			};
		} else if ($splitPane.is('.horizontal-percent')) {
			var splitPaneHeight = splitPane.offsetHeight,
				lastComponentMinHeight = minHeight(lastComponent),
				maxLastComponentHeight = splitPaneHeight - minHeight(firstComponent) - divider.offsetHeight,
				bottomOffset = lastComponent.offsetHeight + pageY;
			return function(event) {
				event.preventDefault();
				var bottom = Math.min(Math.max(lastComponentMinHeight, bottomOffset - pageYof(event)), maxLastComponentHeight);
				setBottom(firstComponent, divider, lastComponent, (bottom / splitPaneHeight * 100) + '%');
				$splitPane.resize();
			};
		} else if ($splitPane.is('.fixed-left')) {
			var firstComponentMinWidth = minWidth(firstComponent),
				maxFirstComponentWidth = splitPane.offsetWidth - minWidth(lastComponent) - divider.offsetWidth,
				leftOffset = divider.offsetLeft - pageX;
			return function(event) {
				event.preventDefault();
				var left = Math.min(Math.max(firstComponentMinWidth, leftOffset + pageXof(event)), maxFirstComponentWidth);
				setLeft(firstComponent, divider, lastComponent, left + 'px')
				$splitPane.resize();
			};
		} else if ($splitPane.is('.fixed-right')) {
			var lastComponentMinWidth = minWidth(lastComponent),
				maxLastComponentWidth = splitPane.offsetWidth - minWidth(firstComponent) - divider.offsetWidth,
				rightOffset = lastComponent.offsetWidth + pageX;
			return function(event) {
				event.preventDefault();
				var right = Math.min(Math.max(lastComponentMinWidth, rightOffset - pageXof(event)), maxLastComponentWidth);
				setRight(firstComponent, divider, lastComponent, right + 'px');
				$splitPane.resize();
			};
		} else if ($splitPane.is('.vertical-percent')) {
			var splitPaneWidth = splitPane.offsetWidth,
				lastComponentMinWidth = minWidth(lastComponent),
				maxLastComponentWidth = splitPaneWidth - minWidth(firstComponent) - divider.offsetWidth,
				rightOffset = lastComponent.offsetWidth + pageX;
			return function(event) {
				event.preventDefault();
				var right = Math.min(Math.max(lastComponentMinWidth, rightOffset - pageXof(event)), maxLastComponentWidth);
				setRight(firstComponent, divider, lastComponent, (right / splitPaneWidth * 100) + '%');
				$splitPane.resize();
			};
		}
	}

	function pageXof(event) {
		return event.pageX || event.originalEvent.pageX;
	}

	function pageYof(event) {
		return event.pageY || event.originalEvent.pageY;
	}

	function minHeight(element) {
		return parseInt($(element).css('min-height')) || 0;
	}

	function minWidth(element) {
		return parseInt($(element).css('min-width')) || 0;
	}

	function setTop(firstComponent, divider, lastComponent, top) {
		firstComponent.style.height = top;
		divider.style.top = top;
		lastComponent.style.top = top;
	}

	function setBottom(firstComponent, divider, lastComponent, bottom) {
		firstComponent.style.bottom = bottom;
		divider.style.bottom = bottom;
		lastComponent.style.height = bottom;
	}

	function setLeft(firstComponent, divider, lastComponent, left) {
		firstComponent.style.width = left;
		divider.style.left = left;
		lastComponent.style.left = left;
	}

	function setRight(firstComponent, divider, lastComponent, right) {
		firstComponent.style.right = right;
		divider.style.right = right;
		lastComponent.style.width = right;
	}

})(jQuery);
