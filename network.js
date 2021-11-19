///////////////////////////////SECTION FOR WEBSITE (NOT d3)///////////////////////////////////////////////
var slider = document.getElementById("k");
var output = document.getElementById("k_rides");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
TODO:
- get map data onto map
- create button to toggle map
- have toggle button toggle map appearance
- fix text field
- have hovering on station show station name in text field
- optimize cariable selection code using matrix of target variables
- make CSS prettier
- make plot size dependent on broswer size
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Set data variable
  var svg = d3.select("svg"); // select the first element that matches the specified selector string
  // var margin = { top: 5, right: 5, bottom: 5, left: 5 };
  
  // Set what variables to start with
  var time_var_index = 0;
  var day_var_index = 0;
  var var_name = 'Total'
  var map_visible = true;

  // Set bounds for image part
  var bounds = svg.node().getBoundingClientRect(),
    width = bounds.width;// - margin.left;// - margin.right,
    height = bounds.height;// - margin.top;// - margin.bottom;

  let projection = d3.geoMercator()
    .scale(200000)
    .center([-73.93, 40.765]); //-73.985487

  let geoGenerator = d3.geoPath()
    .projection(projection);

  // sets an attribute called transform which adds the left and top margin to any input
  // var g = svg.append("g")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

  
  // var x = d3.scaleLinear() // Distributes array of points into range interval
  // var y = d3.scaleLinear() //Creates a scale with a linear relationship between input and output
  
  // Adds an element inside the selected element but just before the end of the selected element,
  // in this case the x-axis and y-axis, and text
  // g.append("g")
  //   .attr("class", "axis axis--x");
  // g.append("g")
  //   .attr("class", "axis axis--y");

  var max_path = 1712;
  d3.json('bouroughs.geojson', function(geojson) {
  // Reads in JSON data and plots it
    d3.json("./Data/combined.json", function(data){
      svg
      .selectAll('path')
      .data(geojson.features)
      .enter()
        .append('path')
        .attr('d', geoGenerator);


    console.log(data.links);
    console.log(data.nodes);
      
    //   // Set domain and range of x and y axis for the graph
    //   // Minimum and maximum values are based on the minimum and maximum latitude/longitudes seen in data
    //   x.domain([d3.min(data.nodes, function (d) { return d["start station longitude"]; }), d3.max(data.nodes, function (d) { return d["start station longitude"]; })])
    //   y.domain([ 40.6995, d3.max(data.nodes, function (d) { return d["start station latitude"]; }) + 0.0005])
    //   x.range([0, width])
    //   y.range([height, 0]) // y-axis is inverted

      // Adds line to graph. Use the links in the JSON data and get the lat/lon for the start and end of each line
      var link = svg
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
        .style("stroke", "#aaa")
        .attr("x1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[0]})
        .attr("y1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[1]})
        .attr("x2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[0]})
        .attr("y2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[1]})
        .attr("opacity", function(d) {return 0.5 + d.Total/max_path}); // scale line opacity based on total number of rides
    

    //   // Adds station name on hover. This isn't working right now
    //   var text = svg.selectAll("text")
    //   .enter().append("text")
    //   .attr("x", 8)
    //   .attr("y", ".31em")
    //   .attr("opacity", 1)
    //   .text("Station Name");

    //   // Adds stations to map. Gets all node elements in json. 
      var node = svg
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
        .attr("cx", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[0]})
        .attr("cy", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[1]})
        .attr("r", 2)
        .attr("fill", "red")
        .on('mouseover', function(d, i) { // on mouseover, make circle bigger. TODO: make this change text 
          d3.select(this)
            .transition()
            .attr('r', 5);
          // div.transition()
          //   .duration(50)
          //   .style("opacity", 1);
          // text.style("opacity", 1);
          link_hover(d['start station name']);
      })
        .on('mouseout', function(d, i) {
          d3.select(this)
            .transition()
            .attr('r', 2);
            link_dehover();
        })


      // Given a new value of k, update the graph to show top k lines
      function link_hover(station_name) {
        console.log("Selecting routes from " + station_name)

        link // make not relevant lines invisible
        .data(data.links)
        .filter(function(d){var start = d['start station name'];
                            var end = d['end station name'];
                            return (start == station_name || end == station_name)})
        .transition()
        .attr("stroke-width", 5);

      }

      function link_dehover() {
        link
        .data(data.links)
        .transition()
        .attr("stroke-width", 1);
      }

      // Makes map appear and disappear
      function toggle_map(bool){
        if (bool){
          d3
          .selectAll('path')
          .attr('opacity', 1);

          d3.select('.right')
          .style('background-color', 'white');
        } else {
          d3
          .selectAll('path')
          .attr('opacity', 0);

          d3.select('.right')
          .style('background-color', 'black');

        }
      }

      // Given a new value of k, update the graph to show top k lines
      function updateK(k) {
        console.log("Changing k to " + k)

        max_path = d3.max(data.links, function (d) { return (d[var_name + '_R'] < k ? d[var_name] : 0) });
        console.log("Changed max path weight to " + max_path);

        link // make not relevant lines invisible
        .data(data.links)
        .filter(function(d){return d[var_name + '_R'] >= k})
        .attr("opacity", 0)

        link // make relevant lines visible
        .data(data.links)
        .filter(function(d){return d[var_name + '_R'] < k})
        .attr("opacity", function(d) {return 0.5 + d.Total/max_path})
      }
    
      updateK(200) // default value, start with 200 lines

      vars = [['Total', 'Weekday', 'Weekend'],
              ['Day', 'Day Weekday', 'Day Weekend'],
              ['Night', 'Night Weekday', 'Night Weekend']]

      // Update which variable is being used based on options selected with buttons
      function updateVar(time_var_index, day_var_index) {
        var_name = vars[time_var_index][day_var_index]
        console.log("Changing target variable to " + var_name)
        updateK(slider.value)
      }
      
      // Listen to the slider. If new value is different from old value, update number of k lines
      d3.select("#k").on("change", function(d){
        selectedValue = this.value
        updateK(selectedValue)
      })

      // Listen to the time variable slider. If new value is different from old value, update which time variable is being used
      d3.selectAll("input[name='time']").on("change", function(){
        console.log("Changing time index to " + this.value)
        time_var_index = this.value;
        updateVar(time_var_index, day_var_index)
      });

      // Listen to the day variable slider. If new value is different from old value, update which day variable is being used
      d3.selectAll("input[name='days']").on("change", function(){
        console.log("Changing day index to" + this.value)
        day_var_index = this.value;
        updateVar(time_var_index, day_var_index)
      });

      // Listen to the slider. If new value is different from old value, update number of k lines
      d3.select("#map_display").on("change", function(d){
        map_visible = !map_visible;
        console.log("Changing map to " + map_visible);
        toggle_map(map_visible);
      })

  });
  });






///////////////////////////////////////////////////////////////////////////////////////////////////////////











// ///////////////////////////////SECTION FOR WEBSITE (NOT d3)///////////////////////////////////////////////
// var slider = document.getElementById("k");
// var output = document.getElementById("k_rides");
// output.innerHTML = slider.value; // Display the default slider value
// // Update the current slider value (each time you drag the slider handle)
// slider.oninput = function() {
//   output.innerHTML = this.value;
// }

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /*
// TODO:
// - get map data onto map
// - create button to toggle map
// - have toggle button toggle map appearance
// - fix text field
// - have hovering on station show station name in text field
// - optimize cariable selection code using matrix of target variables
// - make CSS prettier
// - make plot size dependent on broswer size
// */
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
//   // Set data variable
//   var svg = d3.select("svg"); // select the first element that matches the specified selector string
//   var margin = { top: 5, right: 5, bottom: 5, left: 5 };
  
//   // Set what variables to start with
//   var time_var_index = 0;
//   var day_var_index = 0;
//   var var_name = 'Total'

//   // Set bounds for image part
//   var bounds = svg.node().getBoundingClientRect(),
//     width = bounds.width - margin.left - margin.right,
//     height = bounds.height - margin.top - margin.bottom;

//   // sets an attribute called transform which adds the left and top margin to any input
//   var g = svg.append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

  
//   var x = d3.scaleLinear() // Distributes array of points into range interval
//   var y = d3.scaleLinear() //Creates a scale with a linear relationship between input and output
  
//   // Adds an element inside the selected element but just before the end of the selected element,
//   // in this case the x-axis and y-axis, and text
//   g.append("g")
//     .attr("class", "axis axis--x");
//   g.append("g")
//     .attr("class", "axis axis--y");

//   var max_path = 1712;
//   // Reads in JSON data and plots it
//   d3.json("./Data/combined.json", function(data){
//     console.log(data.links);
//     console.log(data.nodes);
    
//     // Set domain and range of x and y axis for the graph
//     // Minimum and maximum values are based on the minimum and maximum latitude/longitudes seen in data
//     x.domain([d3.min(data.nodes, function (d) { return d["start station longitude"]; }), d3.max(data.nodes, function (d) { return d["start station longitude"]; })])
//     y.domain([ 40.6995, d3.max(data.nodes, function (d) { return d["start station latitude"]; }) + 0.0005])
//     x.range([0, width])
//     y.range([height, 0]) // y-axis is inverted

//     // Adds line to graph. Use the links in the JSON data and get the lat/lon for the start and end of each line
//     var link = svg
//     .selectAll("line")
//     .data(data.links)
//     .enter()
//     .append("line")
//       .style("stroke", "#aaa")
//       .attr("x1", function(d) { return x(d["start station longitude"])})
//       .attr("y1", function(d) { return y(d["start station latitude"])})
//       .attr("x2", function(d) { return x(d["end station longitude"])})
//       .attr("y2", function(d) { return y(d["end station latitude"])})
//       .attr("opacity", function(d) {return 0.5 + d.Total/max_path}) // scale line opacity based on total number of rides

//     // Adds station name on hover. This isn't working right now
//     var text = svg.selectAll("text")
//     .enter().append("text")
//     .attr("x", 8)
//     .attr("y", ".31em")
//     .attr("opacity", 1)
//     .text("Station Name");

//     // Adds stations to map. Gets all node elements in json. 
//     var node = svg
//     .selectAll("circle")
//     .data(data.nodes)
//     .enter()
//     .append("circle")
//       .attr("cx", function(d) {return x(d["start station longitude"])})
//       .attr("cy", function(d) {return y(d["start station latitude"])})
//       .attr("r", 2)
//       .attr("fill", "red")
//       .on('mouseover', function(d, i) { // on mouseover, make circle bigger. TODO: make this change text 
//         d3.select(this)
//           .transition()
//           .attr('r', 5);
//         // div.transition()
//         //   .duration(50)
//         //   .style("opacity", 1);
//         // text.style("opacity", 1);
//         link_hover(d['start station name']);
//      })
//       .on('mouseout', function(d, i) {
//         d3.select(this)
//           .transition()
//           .attr('r', 2);
//           link_dehover();
//       })


//     // Given a new value of k, update the graph to show top k lines
//     function link_hover(station_name) {
//       console.log("Selecting routes from " + station_name)

//       link // make not relevant lines invisible
//       .data(data.links)
//       .filter(function(d){var start = d['start station name'];
//                           var end = d['end station name'];
//                           return (start == station_name || end == station_name)})
//       .transition()
//       .attr("stroke-width", 5);

//     }

//     function link_dehover() {
//       link
//       .data(data.links)
//       .transition()
//       .attr("stroke-width", 1);
//     }


//     // Given a new value of k, update the graph to show top k lines
//     function updateK(k) {
//       console.log("Changing k to " + k)

//       max_path = d3.max(data.links, function (d) { return (d[var_name + '_R'] < k ? d[var_name] : 0) });
//       console.log("Changed max path weight to " + max_path);

//       link // make not relevant lines invisible
//       .data(data.links)
//       .filter(function(d){return d[var_name + '_R'] >= k})
//       .attr("opacity", 0)

//       link // make relevant lines visible
//       .data(data.links)
//       .filter(function(d){return d[var_name + '_R'] < k})
//       .attr("opacity", function(d) {return 0.5 + d.Total/max_path})
//     }
  
//     updateK(200) // default value, start with 200 lines

//     vars = [['Total', 'Weekday', 'Weekend'],
//             ['Day', 'Day Weekday', 'Day Weekend'],
//             ['Night', 'Night Weekday', 'Night Weekend']]

//     // Update which variable is being used based on options selected with buttons
//     function updateVar(time_var_index, day_var_index) {
//       var_name = vars[time_var_index][day_var_index]
//       console.log("Changing target variable to " + var_name)
//       updateK(slider.value)
//     }
    
//     // Listen to the slider. If new value is different from old value, update number of k lines
//     d3.select("#k").on("change", function(d){
//       selectedValue = this.value
//       updateK(selectedValue)
//     })

//     // Listen to the time variable slider. If new value is different from old value, update which time variable is being used
//     d3.selectAll("input[name='time']").on("change", function(){
//       console.log("Changing time index to " + this.value)
//       time_var_index = this.value;
//       updateVar(time_var_index, day_var_index)
//     });

//     // Listen to the day variable slider. If new value is different from old value, update which day variable is being used
//     d3.selectAll("input[name='days']").on("change", function(){
//       console.log("Changing day index to" + this.value)
//       day_var_index = this.value;
//       updateVar(time_var_index, day_var_index)
//     });
//   });