/*
	A visualisation on coffee imports and exports.
	Used on my site topcat.io. Did it just for fun.

	By Wesley Warner
*/

(function($) {

	var scale_green = [ "rgb(212,242,197)", "rgb(174,230,147)", "rgb(156,224,123)", "rgb(123,213,84)", "rgb(104,193,66)", "rgb(94,176,58)", "rgb(85,160,53)", "rgb(75,143,46)" ],
		scale_red = [ "rgb(254,224,224)", "rgb(244,183,178)", "rgb(224,145,134)", "rgb(208,112,96)", "rgb(185,77,61)",  "rgb(166,47,33)", "rgb(145,1,10)" ],
		scale = null,
	    projection = null,
	    svg = null,
	    path_water = null,
	    path_land = null,
	    path_export = null,
	    path_import = null,
	    slider_import = null,
	    slider_export = null,
	    $coffee_map = $('#coffee-map');
    
    var coffeeMap = function() {
	
    	var width = $coffee_map.width(),
	    	height = null,
	    	number_format = d3.format("0,000"),
			duration = 4000;
	    	coffee_export_by_name = d3.map(),
			coffee_import_by_name = d3.map(),
			coffee_drunk_by_name = d3.map(),
			q = d3.queue();

		$coffee_map.css('height', width * 0.6);

		height = $coffee_map.height();

		// Create import and export statistic widgets
		slider_import = new coffeeSlider("#slider-import", "data/coffee_import.csv", scale_red);
		slider_export = new coffeeSlider("#slider-export", "data/coffee_export.csv", scale_green);
	    
	    // Tweak size of globe based on the div width
		scale = globeScale(width);
    
		projection = d3.geo.orthographic()
		    .translate([width / 2, height / 2])
		    .scale(scale)
		    .clipAngle(90);
	
		path_water = d3.geo.path()
	    	.projection(projection);
	
		path_land = d3.geo.path()
	    	.projection(projection);
	
		path_export = d3.geo.path()
	    	.projection(projection);
	    
		path_import = d3.geo.path()
	    	.projection(projection);
	
		// Initialise svg for globe
		svg = d3.select("#coffee-map").append("svg")
			.attr("width", width)
			.attr("height", height)
	
		svg.append("rect")
		    .attr("class", "overlay")
		    .attr("x", 0)
		    .attr("y", 0)
		    .attr("width", width)
		    .attr("height", height);
	
		// Ensure all data sources successfully load before going any further
		q.defer(d3.json, "data/world.json")
		    .defer(d3.csv, "data/coffee_export.csv", function(d) { coffee_export_by_name.set(d.country, +d.bags); })
		    .defer(d3.csv, "data/coffee_import.csv", function(d) { coffee_import_by_name.set(d.country, +d.bags); })
		    .defer(d3.csv, "data/coffee_drunk.csv", function(d) { coffee_drunk_by_name.set(d.country, +d.cups); })
		    .await(ready);
    
		function ready(error, world) {
	    
	    	// Filter and map all raw data to required format
	    	var coffee_import = topojson.feature(world, world.objects.countries).features
				.filter(function(d) {
		    		return coffee_import_by_name.has(d.properties.name);
				});
    
	    	var coffee_export = topojson.feature(world, world.objects.countries).features
				.filter(function(d) {
		    		return coffee_export_by_name.has(d.properties.name);
			});
		
	    	var coffee = topojson.feature(world, world.objects.countries).features
				.filter(function(d) {
		    		return coffee_export_by_name.has(d.properties.name) || coffee_import_by_name.has(d.properties.name);
				})
				.map(function(d, i) {
		    		return {
						country: d.properties.name,
						shape: d,
						export_bags: (coffee_export_by_name.has(d.properties.name)) ? coffee_export_by_name.get(d.properties.name) : 0,
						import_bags: (coffee_import_by_name.has(d.properties.name)) ? coffee_import_by_name.get(d.properties.name) : 0,
						cups: (coffee_drunk_by_name.has(d.properties.name)) ? coffee_drunk_by_name.get(d.properties.name) : "n/a"
				    };
			});
	    
	    	svg.append("path")
				.datum({type: "Sphere"})
				.attr("class", "water")
				.attr("d", path_water);
	
	    	var export_quantize = d3.scale.quantize()
				.domain([0, d3.max(coffee, function(d) { return d.export_bags; })])
				.range(d3.range(8));
	    
	    	var import_quantize = d3.scale.quantize()
				.domain([0, d3.max(coffee, function(d) { return d.import_bags; })])
				.range(d3.range(7));
    
    		// Draw the land onto the map
	    	svg.append("g")
				.selectAll(".land")
		    	.data(topojson.feature(world, world.objects.countries).features)
				.enter()
				.append("path")
				.attr("class", "land")
				.attr("d", path_land);
	    
	    	// Draw all the exports on to the map using the green colour scale
	    	var exports = svg.append("g")
				.attr("class", "exports");
		
			exports.selectAll(".export")
		    	.data(coffee_export)
				.enter()
				.append("path")
				.attr("class", "export")
				.style("fill", function(d) {
			    	return scale_green[export_quantize(coffee_export_by_name.get(d.properties.name))];
				})
				.attr("d", path_export);
		   
		   	// Draw all the imports on to the map using the red colour scale
	    	var imports = svg.append("g")
				.attr("class", "imports");
		
	    	imports.selectAll(".import")
				.data(coffee_import)
		    	.enter()
		    	.append("path")
		    	.attr("class", "import")
		    	.style("fill", function(d) {
					return scale_red[import_quantize(coffee_import_by_name.get(d.properties.name))];
		    	})
		    	.attr("d", path_import);

		    var i = -1,
	    		n = coffee.length;
	    
	    	//  Main transition animation of globe
	    	(function transition() {
			
				d3.transition()
			    	.duration(duration)
			    	.each("start", function() {
						
			    		// Always reference a true value in the data
						i = (i + 1) % n;
						// Update the display stats
						$("#coffee-country").html(coffee[i].country);
						$("#exports-bags").html(number_format(coffee[i].export_bags));
						$("#imports-bags").html(number_format(coffee[i].import_bags));
						$("#drinks").html(coffee[i].cups);
						// Update the widget values
						slider_import.update(coffee[i].import_bags);
						slider_export.update(coffee[i].export_bags);
			    	})
			    	.tween("rotate", function() {
			    		// Perform the actual globe rotation
						var p = d3.geo.centroid(coffee[i].shape),
				    		r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
				    
						return function(t) {
				    
				    		projection.rotate(r(t));
				    
				    		svg.selectAll(".land")
								.attr("d", path_land);
				    
				    		// Highlight border of selected country
				    		svg.selectAll(".export")
								.style('stroke', function(d) {
					    			return (d.properties.name == coffee[i].country && parseInt(coffee[i].export_bags) > 0) ? scale_green[scale_green.length - 1] : "none";
								})
								.style('stroke-width', function(d) {
					    			return (d.properties.name == coffee[i].country && parseInt(coffee[i].export_bags) > 0) ? "2px" : "1px";
								})
								.attr("d", path_export);
				    
				    		svg.selectAll(".import")
								.style('stroke', function(d) {
					    			return (d.properties.name == coffee[i].country && parseInt(coffee[i].import_bags) > 0) ? scale_red[scale_red.length - 1] : "none";
								})
								.style('stroke-width', function(d) {
					    			return (d.properties.name == coffee[i].country && parseInt(coffee[i].import_bags) > 0) ? "2px" : "1px";
								})
								.attr("d", path_import);
				    
						};
			    	})
			    	.transition()
			    	// After animation complete, call it again!
					.each("end", transition);
	    	})();         
		}
    }
    
    var coffeeMapResize = function() {

		var width = $coffee_map.width(),
		    height = null;

		$coffee_map.css('height', width * 0.6);

		height = $coffee_map.height();
		    
		scale = globeScale(width);
		
		// update projection
		projection.translate([width / 2, height / 2])
		    .scale(scale);
		    
		path_water = d3.geo.path()
		    .projection(projection);
		
		path_land = d3.geo.path()
		    .projection(projection);
		
		path_export = d3.geo.path()
		    .projection(projection);
		    
		path_import = d3.geo.path()
		    .projection(projection);

		// resize the map container
		svg.style('width', width)
		    .style('height', height);

		
		svg.selectAll('.land').attr('d', path_land);
		svg.selectAll('.export').attr('d', path_export);
		svg.selectAll('.import').attr('d', path_import);
		svg.selectAll('.water').attr("d", path_water);

		slider_import.resize();
		slider_export.resize();
    };

    function globeScale(width) {
    	return width * 0.85 / Math.PI;
    }

    // Start the visualisation
    coffeeMap();

    // Watch for window resize and update the visualisation sizes
    $(window).resize(function() {
    	coffeeMapResize();
    });
    
})(jQuery);
