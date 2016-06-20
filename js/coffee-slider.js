
(function($) {

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
		
		this.svg.select(".slider-line")
		    .transition()
		    .duration(this.duration)
		    .attr("transform", "translate(" + (this.x(v) - this.gutter_side) + ")");
		
		this.svg.select(".slider-arrow-up")
		    .transition()
		    .duration(this.duration)
		    .attr("transform", "translate(" + (this.x(v) - this.gutter_side) + ")");
		
		this.svg.select(".slider-arrow-down")
		    .transition()
		    .duration(this.duration)
		    .attr("transform", "translate(" + (this.x(v) - this.gutter_side) + ")");
	
    }

    // Resize coffee slider widget on window resize
    
    coffeeSlider.prototype.resize = function() {
	
		var that = this;
		
		this.width = this.$el.width();
		this.height = this.$el.height();
		
		this.x.range([this.gutter_side, this.width - this.gutter_side]);
		this.y.range([this.height - this.gutter_top, this.gutter_bottom]);
		
		this.svg
		    .style('width', this.width)
		    .style('height', this.height);
		    
		var w = (this.width - (2 * this.gutter_side)) / this.scale_color.length;
		    
		this.svg.selectAll(".block")
		    .attr("x", function(d, i) {
			return (w * i) + that.gutter_side;
		    })
		    .attr("y", that.y(1))
		    .attr("width", w)
		    .attr("height", this.height - this.gutter_top - this.gutter_bottom);
		
		this.svg.select(".slider-line")
		    .attr("x1", this.x(0))
		    .attr("y1", this.gutter_top)
		    .attr("x2", this.x(0))
		    .attr("y2", this.height - this.gutter_bottom);
		    
		this.svg.select(".slider-arrow-up")
			.attr("d", function(d, i) {
			    var x = that.x(0);
			    var y = 0;
			    return "M"+ x +","+ (y + that.gutter_top) +"L"+ (x + 8)+","+ y +"L" + (x - 8)+","+ y + "L" + x +"," + (y + that.gutter_top) + "Z";
			});
		
		this.svg.select(".slider-arrow-down")
			.attr("d", function(d, i) {
			    var x = that.x(0);
			    var y = that.height - that.gutter_bottom;
			    return "M"+ x +","+ (y) +"L"+ (x + 8)+","+ (y + that.gutter_bottom) +"L" + (x - 8)+","+ (y + that.gutter_bottom) + "L" + x +"," + (y) + "Z";
			});
    
    };

    window.coffeeSlider = coffeeSlider;

})(jQuery);