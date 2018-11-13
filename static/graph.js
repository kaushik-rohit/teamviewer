function networkChart() {
	
	function chart(selection) {
		
		selection.each(function(data) {

			const color_choice = ['variance', 'skewness', 'connectivity', 'kurtosis'];
			var current_choice = 'variance';

			var svg = d3.select(this).selectAll("svg").data([data]);
			var gEnter = svg.enter().append("svg").attr('width', 700).attr('height', 500);
			var width = 700;
			var height = 500;

			var nodes = data['nodes'];
			var links = data['links'];

			var color = d3.scaleOrdinal( d3.schemeReds);


			var simulation = d3.forceSimulation()
								.force('charge', d3.forceManyBody().strength(-200))
								.force('link', d3.forceLink().id(function(d) { return d.id; }).distance(80))
								.force('x', d3.forceX(width / 2))
								.force('y', d3.forceY(height / 2))
								.on('tick', ticked);
			
			simulation.nodes(nodes);
			simulation.force('link').links(links);

			var link = gEnter.selectAll('.link'),
				node = gEnter.append('g');

			link = link.data(links)
					.enter().append('line')
				  .attr('class', 'link')
				  .attr('stroke', 'black');

			node = node.selectAll('circle')
					.data(nodes)
					.enter().append('circle')
					.attr('class', 'node')
					.attr('r', 12)
					.attr('id', function(d) { return d.id;})
					.style('fill', function(d) { return color(d.connectivity); })
					.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

			node.append("title")
				.text(function(d) { return d.id; });

			var c = d3.select(this).select('#color').append('form')
				.selectAll('label').data(color_choice)
				.enter().append('label')
				.attr('for',function(d,i){ return 'a'+i; })
				.text(function(d){return d});

			c.append('br');

			c.append('input')
			 .attr('type', 'radio').attr("id", function(d,i) { return 'a'+i; })
			 .property("checked", function(d, i) {return i===0;})
			 .attr('value', function(d){return d})
			 .attr('name', 'color')
			 .on('click', function(){
				current_choice = d3.select('input[name="color"]:checked').node().value;
				color.domain(d3.extent(nodes, function(d) { return color(d[current_choice]); }))
					  .range(['red', 'green']);

				node.style('fill', function(d) {return color(d[current_choice]);})
			});

			function ticked() {
			  link.attr("x1", function(d) { return d.source.x; })
				  .attr("y1", function(d) { return d.source.y; })
				  .attr("x2", function(d) { return d.target.x; })
				  .attr("y2", function(d) { return d.target.y; });

			  node.attr("cx", function(d) { return d.x; })
				  .attr("cy", function(d) { return d.y; });
			}
		
			function dragstarted(d) {
			  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			  d.fx = d.x;
			  d.fy = d.y;
			}

			function dragged(d) {
			  d.fx = d3.event.x;
			  d.fy = d3.event.y;
			}

			function dragended(d) {
			  if (!d3.event.active) simulation.alphaTarget(0);
			  d.fx = null;
			  d.fy = null;
			}
		});
	}

	return chart;
}
