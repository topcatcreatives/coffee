/*
	A visualisation on coffee imports and exports.
	Used on my site topcat.io. Did it just for fun. Needs a bit more work on the responsivness

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
	    slider_export = null;

	/*
		Create reusable coffee slider widget that animate based on the the updated stats of each country.
		Needed for both import and export on custom colour scale.
	*/

    var coffeeSlider = function(el, data_src, scale_color) {
	
		this.el = el,
	    this.$el = $(el),
	    this.width = this.$el.width(),
	    this.height = this.$el.height(),
	    this.data_src = data_src,
	    this.scale_color = scale_color,
	    this.duration = 4000,
	    this.gutter_top = 8,
	    this.gutter_bottom = 8
	    this.gutter_side = 8;
	
		this.init();
    }
    
  	// Initialise coffee slider component

    coffeeSlider.prototype.init = function() {
	
		var that = this;
	
		// Initialise svg component
		this.svg = d3.select(this.el).append("svg")
	    	.attr("width", this.width)
	    	.attr("height", this.height);
	    
	    // Scale variables
		this.x = d3.scale.linear()
	    	.range([this.gutter_side, this.width - this.gutter_side]);
    
		this.y = d3.scale.linear()
	    	.range([this.height - this.gutter_top, this.gutter_bottom]);
    
    	// Import data from local csv files
		d3.csv(this.data_src, function(error, data) {
	    	
	    	// Ensure consistent data format
	    	data.forEach(function(d) {
				d.value = 1;
				d.bags = +d.bags;
	    	});
	    
	    	// Find max value for scale
	    	var max_val = d3.max(data, function(d) { return d.bags; });
	    
		    that.x.domain([0, max_val]);
		    that.y.domain([0, 1]);
		    
		    var w = (that.width - (2 * that.gutter_side)) / that.scale_color.length;
		    
		    // Draw colour scale blocks
		    that.svg.selectAll(".blocks")
				.data(that.scale_color)
				.enter()
				.append("rect")
				.attr("class", "block")
				.attr("x", function(d, i) {
		    		return (w * i) + that.gutter_side;
				})
				.attr("y", that.y(1))
				.attr("width", w)
				.attr("height", that.height - that.gutter_top - that.gutter_bottom)
				.style("fill", function(d) {
					return d;
				});
	    
	    	// Draw marker line
	    	that.svg.append("line")
				.attr("class", "slider-line")
				.attr("x1", that.x(0))
				.attr("y1", that.gutter_top)
				.attr("x2", that.x(0))
				.attr("y2", that.height - that.gutter_bottom)
				.style("stroke", "#aaa")
				.style("stroke-width", 1);
		
			// Draw bottom arrow
	    	that.svg.append("path")
		    	.attr("class", "slider-arrow-up")
		    	.style("fill", "#aaa")
		    	.attr("d", function(d, i) {
					var x = that.x(0),
						y = 0;

					return "M"+ x +","+ (y + that.gutter_top) +"L"+ (x + 8)+","+ y +"L" + (x - 8)+","+ y + "L" + x +"," + (y + that.gutter_top) + "Z";
		    	});
	    
	    	// Draw top arrow
	    	that.svg.append("path")
		    	.attr("class", "slider-arrow-down")
		    	.style("fill", "#aaa")
		    	.attr("d", function(d, i) {
					var x = that.x(0),
						y = that.height - that.gutter_bottom;

					return "M"+ x +","+ (y) +"L"+ (x + 8)+","+ (y + that.gutter_bottom) +"L" + (x - 8)+","+ (y + that.gutter_bottom) + "L" + x +"," + (y) + "Z";
		    	});
	    
		});
	
    };
    
    // Update and animate the widget to reflect new import/export statistic
    
    coffeeSlider.prototype.update = function(v) {
	
		var that = this;
		
		this.svg.select(".slider-line")
		    .transition()
		    .duration(this.duration)
		    .attr("transform", "translate(" + (this.x(v) - that.gutter_side) + ")");
		
		this.svg.select(".slider-arrow-up")
		    .transition()
		    .duration(this.duration)
		    .attr("transform", "translate(" + (this.x(v) - that.gutter_side) + ")");
		
		this.svg.select(".slider-arrow-down")
		    .transition()
		    .duration(this.duration)
		    .attr("transform", "translate(" + (this.x(v) - that.gutter_side) + ")");
	
    }

    // Resize coffee slider widget on window resize
    
    coffeeSlider.prototype.resize = function() {
	
		var that = this;
		
		this.width = this.$el.width();
		this.height = this.$el.height();
		
		this.x.range([this.gutter_side, this.width - this.gutter_side]);
		this.y.range([this.height - this.gutter_top, this.gutter_bottom]);
		
		that.svg
		    .style('width', this.width)
		    .style('height', this.height);
		    
		var w = (that.width - (2 * that.gutter_side)) / that.scale_color.length;
		    
		that.svg.selectAll(".block")
		    .attr("x", function(d, i) {
			return (w * i) + that.gutter_side;
		    })
		    .attr("y", that.y(1))
		    .attr("width", w)
		    .attr("height", that.height - that.gutter_top - that.gutter_bottom);
		
		that.svg.select(".slider-line")
		    .attr("x1", that.x(0))
		    .attr("y1", that.gutter_top)
		    .attr("x2", that.x(0))
		    .attr("y2", that.height - that.gutter_bottom);
		    
		that.svg.select(".slider-arrow-up")
			.attr("d", function(d, i) {
			    var x = that.x(0);
			    var y = 0;
			    return "M"+ x +","+ (y + that.gutter_top) +"L"+ (x + 8)+","+ y +"L" + (x - 8)+","+ y + "L" + x +"," + (y + that.gutter_top) + "Z";
			});
		
		that.svg.select(".slider-arrow-down")
			.attr("d", function(d, i) {
			    var x = that.x(0);
			    var y = that.height - that.gutter_bottom;
			    return "M"+ x +","+ (y) +"L"+ (x + 8)+","+ (y + that.gutter_bottom) +"L" + (x - 8)+","+ (y + that.gutter_bottom) + "L" + x +"," + (y) + "Z";
			});
    
    };
    
    var coffeeMap = function() {
	
		// Create import and export statistic widgets
		slider_import = new coffeeSlider("#slider-import", "data/coffee_import.csv", scale_red);
		slider_export = new coffeeSlider("#slider-export", "data/coffee_export.csv", scale_green);
    
		var width = $("#coffee-map").width(),
	    	height = $("#coffee-map").height();
	    
	    // Tweak size of globe based on the div width
		if (width > 400) {
	    	scale = (width * 0.56 ) / Math.PI;
		}
		else {
	    	scale = (width * 1.2) / Math.PI;
		}
	
		var number_format = d3.format("0,000"),
			duration = 4000;
	    	coffee_export_by_name = d3.map(),
			coffee_import_by_name = d3.map(),
			coffee_drunk_by_name = d3.map();
    
		projection = d3.geo.orthographic()
		    .translate([width / 2, height / 2])
		    .scale(scale)
		    .clipAngle(90);
	
		var path_water = d3.geo.path()
	    	.projection(projection);
	
		var path_land = d3.geo.path()
	    	.projection(projection);
	
		var path_export = d3.geo.path()
	    	.projection(projection);
	    
		var path_import = d3.geo.path()
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
		var q = d3.queue();
		
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
    
    // Trying to be responsive but not to pretty looking at the moment.
    var coffeeMapResize = function() {
	
		var width = $("#coffee-map").width(),
		    height = $("#coffee-map").height();
		    
		if (width > 400) {
		    scale = (width * 0.56 ) / Math.PI;
		}
		else {
		    scale = (width * 1.2) / Math.PI;
		}
		
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

    // Start the visualisation
    coffeeMap();

    // Watch for window resize and update the visualisation sizes
    $(window).resize(function() {
    	coffeeMapResize();
    });
    
})(jQuery);
