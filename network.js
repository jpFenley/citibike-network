///////////////////////////////SECTION FOR WEBSITE (NOT d3)///////////////////////////////////////////////
var slider = document.getElementById("k");
var output = document.getElementById("k_rides");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Set data variable
  var svg = d3.select("svg"); // select the first element that matches the specified selector string
  var margin = { top: 5, right: 5, bottom: 5, left: 5 };
  
  var time_var_index = 0;
  var day_var_index = 0;
  var var_name = 'Total'

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
    
    x.domain([d3.min(data.nodes, function (d) { return d["start station longitude"]; }), d3.max(data.nodes, function (d) { return d["start station longitude"]; })])
    y.domain([ 40.6995, d3.max(data.nodes, function (d) { return d["start station latitude"]; }) + 0.0005])
    x.range([0, width])
    y.range([height, 0])


    var link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")
      .attr("x1", function(d) { return x(d["start station longitude"])})
      .attr("y1", function(d) { return y(d["start station latitude"])})
      .attr("x2", function(d) { return x(d["end station longitude"])})
      .attr("y2", function(d) { return y(d["end station latitude"])})
      .attr("opacity", function(d) {return 0.5 + d.Total/1712})

    var text = svg.selectAll("text")
    .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("opacity", 1)
    .text("Station Name");

    var node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("cx", function(d) {return x(d["start station longitude"])})
      .attr("cy", function(d) {return y(d["start station latitude"])})
      .attr("r", 2)
      .attr("fill", "red")
      .on('mouseover', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 5);
        div.transition()
          .duration(50)
          .style("opacity", 1);
        text.style("opacity", 1);
     })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 2);
      })



    function updateK(k) {
      console.log(k)

      link
      .data(data.links)
      .filter(function(d){return d[var_name + '_R'] >= k})
      .attr("opacity", 0)

      link
      .data(data.links)
      .filter(function(d){return d[var_name + '_R'] < k})
      .attr("opacity", function(d) {return 0.5 + d.Total/1712})
    }
  
    updateK(200)

    function updateVar(time_var_index, day_var_index) {
      if (time_var_index == 0 && day_var_index == 0) {
        var_name = 'Total'
      }else if (time_var_index == 0 && day_var_index == 1) {
        var_name = 'Weekday'
      }else if (time_var_index == 0 && day_var_index == 2) {
        var_name = 'Weekend'
      }else if (time_var_index == 1 && day_var_index == 0) {
        var_name = "Day"
      }else if (time_var_index == 1 && day_var_index == 1) {
        var_name = "Day Weekday"
      }else if (time_var_index == 1 && day_var_index == 2) {
        var_name = "Day Weekend"
      }else if (time_var_index == 2 && day_var_index == 0) {
        var_name = "Night"
      }else if (time_var_index == 2 && day_var_index == 1) {
        var_name = "Night Weekday"
      }else if (time_var_index == 2 && day_var_index == 2) {
        var_name = "Night Weekend"
      }
      console.log(var_name)
      updateK(slider.value)
    }

    // Listen to the slider
    d3.select("#k").on("change", function(d){
      selectedValue = this.value
      updateK(selectedValue)
    })

    d3.selectAll("input[name='time']").on("change", function(){
      console.log(this.value)
      if (this.value == "all_time"){
        time_var_index = 0
      } else if (this.value == "day"){
        time_var_index = 1
      } else if (this.value == "night"){
        time_var_index = 2
      }
      updateVar(time_var_index, day_var_index)
    });

    d3.selectAll("input[name='days']").on("change", function(){
      console.log(this.value)
      if (this.value == "all_days"){
        day_var_index = 0
      } else if (this.value == "weekdays"){
        day_var_index = 1
      } else if (this.value == "weekends"){
        day_var_index = 2
      }
      updateVar(time_var_index, day_var_index)
    });

  });
