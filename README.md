split-pane
==========

jQuery Split Pane plugin

The plugin should work in IE8 and above as well as in Chrome, Safari and Firefox.

You can download split-pane.js and split-pane.css manually to you project or you can install with npm:

    npm install split-pane

Split panes are initiated with

    $(selector).splitPane();

Split pane component min-height and min-width are supported, and the component size
can be set programmatically with

    $(selector).splitPane('firstComponentSize', 0);"

or

    $(selector).splitPane('lastComponentSize', 100);"

Only pixel values are supported.

Below is a basic example on how to use the plugin. Check out my [blog post](http://www.dreamchain.com/split-pane/) for some prettier examples.

You need to set up component widths and divider position using css, not as options to the JS splitPane function. The reason for this is that I like things to look good even **before** the JavaScript kicks in.

    <!DOCTYPE html>
    <html>
      <head>
    		<title>Basic Example</title>
    		<link rel="stylesheet" href="split-pane.css" />
    		<script src="http://code.jquery.com/jquery-1.9.1.js"></script>
    		<script src="split-pane.js"></script>
    		<style type="text/css">
    			html, body {
    				height: 100%;
    				min-height: 100%;
    				margin: 0;
    				padding: 0;
    			}
    			.split-pane-divider {
    				background: #aaa;
    			}
    			#left-component {
    				width: 20em;
    			}
    			#my-divider {
    				left: 20em; /* Same as left component width */
    				width: 5px;
    			}
    			#right-component {
    				left: 20em;  /* Same as left component width */
    				margin-left: 5px;  /* Same as divider width */
    			}
    		</style>
    		<script>
    			$(function() {
    				$('div.split-pane').splitPane();
    			});
    		</script>
    	</head>
    	<body>
    		<div class="split-pane fixed-left">
    			<div class="split-pane-component" id="left-component">
    				This is the left component
    			</div>
    			<div class="split-pane-divider" id="my-divider"></div>
    			<div class="split-pane-component" id="right-component">
    				This is the right component
                    <button onclick="$('div.split-pane').splitPane('firstComponentSize', 0);">Collapse first component</button>
    			</div>
    		</div>
    	</body>
    </html>
