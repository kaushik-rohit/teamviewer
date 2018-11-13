function areaChart(key, brush, title) {
	var margin = {top: 20, right: 40, bottom: 30, left: 20},
		margin2 = {top: 240, right: 40, bottom: 10, left: 20},
	    width = 960,
		height = 250,
		height2 = 50,
		xValue = function(d) {return d['date'];},
		yValue = function(d) {return d[key];};
		
	var xScale = d3.scaleTime().range([0, width]),
		yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]),
		xAxis = d3.axisBottom(xScale),
		yAxis = d3.axisLeft(yScale);
		
	var xScale2 = d3.scaleTime().range([0, width]),
		yScale2 = d3.scaleLinear().range([height2, 0]),
		xAxis2 = d3.axisBottom(xScale2);
	
	var color = d3.scaleOrdinal(d3.schemeCategory20);
					  
	var zoom = d3.zoom()
				 .scaleExtent([1, Infinity])
				 .translateExtent([[0, 0], [width, height - margin.top - margin.bottom]])
				 .extent([[0, 0], [width, height]])
				 .on('zoom', chart.zoomed);
	
	var area = d3.area().curve(d3.curveMonotoneX).x(X).y0(height - margin.bottom - margin.top).y1(Y);
	var area2 = d3.area().curve(d3.curveMonotoneX).x(X2).y0(height2).y1(Y2);
	
	var parseDate = d3.timeParse('%m/%d/%Y');
	var focus = null;
	var gEnter = null;
	function chart(selection) {
		selection.each(function(data) {
			data = data.map(function(d, i) {
				return [xValue.call(data, d, i), yValue.call(data, d, i)];
			});
		
		//Update the color scale
	    color.domain(d3.extent(data, function(d) { return d[1]; }))
			      .range(['red', 'steelblue', 'green']);
	  
		//Update the x-scale
		xScale.domain(d3.extent(data, function(d) { return d[0]; }))
			  .range([0, width - margin.left - margin.right]);
				
		xScale2.domain(xScale.domain());
		
		yScale.domain(d3.extent(data, function(d) { return d[1]; }))
			  .range([height - margin.top - margin.bottom, 0]);
		
	    // Select the svg element, if it exists.
        var svg = d3.select(this).selectAll("svg").data([data]);

        // Otherwise, create the skeletal chart.
		gEnter = svg.enter().append("svg");
		
		gEnter.append('text')
			   .attr('x', width/2)
			   .attr('y', 0 - (margin.top/2))
			   .attr('text-anchor', 'middle')
			   .style('font-size', '16px')
			   .style('text-decoration', 'underline')
			   .text('chart');
		
		gEnter.append("defs").append("clipPath")
		   .attr("id", "clip")
		   .append("rect")
		   .attr("width", width)
		   .attr("height", height);
		   
		focus = gEnter.append("g")
					   .attr("class", "focus")
					   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				   
	    focus.append("path")
			 .datum(data)
             .attr("class", "area")
             .attr("d", area);			 
	    focus.append("g")
			 .attr("class", "axis axis--x")
			 .attr("transform", "translate(0," + 200 + ")")
			 .call(xAxis);

		focus.append("g")
			 .attr("class", "axis axis--y")
			 .call(yAxis);
		
		// Update the outer dimensions.
		gEnter.attr("width", width)
		   .attr("height", height);
		   
		gEnter.append("rect")
		   .attr("class", "zoom")
		   .attr("width", width)
		   .attr("height", height)
		   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		   .call(zoom);
		});
	}
  

	// The x-accessor for the path generator; xScale ∘ xValue.
	function X(d) {
		return xScale(d[0]);
	}

	// The x-accessor for the path generator; yScale ∘ yValue.
	function Y(d) {
		return yScale(d[1]);
	}
		
	// The x-accessor for the path generator; xScale ∘ xValue.
	function X2(d) {
		return xScale2(d[0]);
	}

	// The x-accessor for the path generator; yScale ∘ yValue.
	function Y2(d) {
		return yScale2(d[1]);
	}
	
	chart.margin = function(_) {
		if (!arguments.length) return margin;
			margin = _;
		return chart;
	};
	
	chart.width = function(_) {
	if (!arguments.length) return width;
	width = _;
	return chart;
	};

	chart.height = function(_) {
	if (!arguments.length) return height;
	height = _;
	return chart;
	};

	chart.x = function(_) {
	if (!arguments.length) return xValue;
	xValue = _;
	return chart;
	};

	chart.y = function(_) {
	if (!arguments.length) return yValue;
	yValue = _;
	return chart;
	};
	
	chart.xAxis2 = function() {
		return xAxis2;
	}
	
	chart.zoomed = function zoomed(brush) {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		var t = d3.event.transform;
		xScale.domain(t.rescaleX(xScale2).domain());
		focus.select(".area").attr("d", area);
		focus.select(".axis--x").call(xAxis);
		brush.call(brush.move, xScale.range().map(t.invertX, t));
	}
	
	chart.brushed =	function brushed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		var s = d3.event.selection || xScale2.range();
		xScale.domain(s.map(xScale2.invert, xScale2));
		focus.select(".area").attr("d", area);
		focus.select(".axis--x").call(xAxis);
		gEnter.select(".zoom").call(zoom.transform, d3.zoomIdentity
		  .scale(width / (s[1] - s[0]))
		  .translate(-s[0], 0));
	}
	
	chart.end = function getend() {
		var s = d3.event.selection;
		var x1 = xScale2.invert(s[0]);
		var x2 = xScale2.invert(s[1]);
		
		return [x1,x2];
	}
	
	return chart;	
}