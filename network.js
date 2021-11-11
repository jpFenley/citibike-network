  // Set data variable

  var svg = d3.select("svg"); // select the first element that matches the specified selector string
  var margin = { top: 20, right: 20, bottom: 30, left: 40 };
  
  // set bounds for image part
  var bounds = svg.node().getBoundingClientRect(),
    width = bounds.width - margin.left - margin.right,
    height = bounds.height - margin.top - margin.bottom;

  // sets an attribute called transform which adds the left and top margin to any input
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

  
  var x = d3.scaleLinear()//.domain([-90, 90]).range([0, width]); // Distributes array of points into range interval
  var y = d3.scaleLinear()//.domain([-90, 90]).range([height, 0]); //creates a scale with a linear relationship between input and output
  
  // Adds an element inside the selected element but just before the end of the selected element,
  // in this case the x-axis and y-axis, and text
  g.append("g")
    .attr("class", "axis axis--x");
  g.append("g")
    .attr("class", "axis axis--y");

  d3.json("combined.json", function(data){
    console.log(data.links);
    // data.forEach(function(stat) {
    //   console.log(stat["start station name"])
    //});
    
    // TODO: add some wiggle room to the x and y axis
    x.domain([d3.min(data.nodes, function (d) { return d["start station longitude"]; }), d3.max(data.nodes, function (d) { return d["start station longitude"]; })])
    y.domain([d3.min(data.nodes, function (d) { return d["start station latitude"]; }), d3.max(data.nodes, function (d) { return d["start station latitude"]; })])
    x.range([0, width])
    y.range([height, 0])

    var node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("cx", function(d) {return x(d["start station longitude"])})
      .attr("cy", function(d) {return y(d["start station latitude"])})
      .attr("r", 2)
      .attr("fill", "red")

    var link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")
      .attr("x1", function(d) { return d["start station name"]})
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
  });
