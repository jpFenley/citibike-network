///////////////////////////////SECTION FOR WEBSITE (NOT d3)///////////////////////////////////////////////
var slider = document.getElementById("k");
var output = document.getElementById("k_rides");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}

  // Set data variable
  var svg = d3.select("svg"); // select the first element that matches the specified selector string
  
  // Initial variable values
  var time_var_index = 0;
  var day_var_index = 0;
  var var_name = 'Total'
  var map_visible = true;
  var max_path = 1712;
  var page = 0;
  var k = 0;


  // Set bounds for image part
  var bounds = svg.node().getBoundingClientRect(),
    width = bounds.width;
    height = bounds.height;

  let projection = d3.geoMercator()
    .scale(320 * height)
    .translate([width/2,height/2])
    .center([-73.9884845, 40.7499]);

  let geoGenerator = d3.geoPath()
    .projection(projection);

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")				
    .text("Hover over a station to find out more.")
    .style("top", "25px")
    .style("font-size", "20px")
    .style("left", width + 20 + "px")
    .style("width", 3 * width / 5 + "px")
    .style("display", "none");

  d3.json('Data/Input/bouroughs.geojson', function(geojson) {
  // Reads in JSON data and plots it
    d3.json("Data/Output/combined.json", function(data){
      
    console.log(data.links);
    console.log(data.nodes);

    var map = svg
    .append("g")
    .attr("class", "map")
    .selectAll('path')
    .data(geojson.features)
    .enter()
      .append('path')
      .attr('d', geoGenerator)
      .attr('opacity', 1);

    var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")
      .attr("fill", 'red')
      .attr("x1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[0]})
      .attr("y1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[1]})
      .attr("x2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[0]})
      .attr("y2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[1]})
      .attr("opacity", 0); // scale line opacity based on total number of rides

    var node = svg
    .append("g")	
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("cx", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[0]})
      .attr("cy", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[1]})
      .attr("r", 2)
      .attr("fill", "red")
      .attr('opacity', 0)
      .on('mouseover', function(d, i) { // on mouseover, make circle bigger and display text 
        d3.select(this)
          .transition()
          .attr('r', 5);
        //div.html("<span style=\"font-size: 20px\"><b>Start Station Name:</b> " + d['start station name'] + "</span><br/><span style=\"font-size: 15px\"><b>Location: </b>(" + d["start station longitude"].toFixed(3)+ ", " + d["start station latitude"].toFixed(3) + ")" + getNumRides(d['start station name']) + "</span>");
        //link_hover(d["start station id"]);
        //adjacent_stations(d["start station id"]);
    })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 2);
          //link_dehover();
          //div.html("Hover over a station to find out more.");
        //node
          //.attr("fill", "red");
      })

      function adjacent_stations(station_id){
        var adjacent_stations = [];
        for (var i = 0; i < data.links.length; i++){
          if (data.links[i][var_name + '_R'] < k){
            if (data.links[i]["start station id"] == station_id){
              adjacent_stations.push(data.links[i]["end station id"]);
            } 
            if (data.links[i]["end station id"] == station_id){
              adjacent_stations.push(data.links[i]["start station id"]);
            }
          }

        }
        node
        .filter(function(d) {return adjacent_stations.includes(d['start station id'])})
        .attr("fill", "yellow");
        console.log('Adjacent stations: ' + adjacent_stations);
      }

    function getNumRides(station_id) {
      var num_rides = link
      .filter(function(d) {return d['start station id'] == station_id || d["end station id"] == station_id})
      .filter(function (d) {return d[var_name + '_R'] < slider.value})
      .size();	
      return "<br/>Station has <b>" + num_rides + "</b> of the top <b>" + slider.value + "</b> rides.";
    }

    // Given a new value of k, update the graph to show top k lines
    function link_hover(station_id) {
      console.log("Selecting routes from " + station_id)

      link // make not relevant lines invisible
      .data(data.links)
      .filter(function(d){var start = d['start station name'];
                          var end = d['end station name'];
                          return (start == station_id || end == station_id)})
      .transition()
      .attr("stroke-width", 5);

    }

    function link_dehover() {
      link
      .data(data.links)
      .transition()
      .attr("stroke-width", 1);
    }

    

    //Makes map appear and disappear
    function toggle_map(bool){
      if (bool){
        d3
        .selectAll('path')
        .attr('opacity', 1);

        d3.select('.right')
        .style('background-color', 'white');

        div.style('color', 'black');
      } else {
        d3
        .selectAll('path')
        .attr('opacity', 0);

        d3.select('.right')
        .style('background-color', 'black');

        div.style('color', 'white');

      }
    }

    // Given a new value of k, update the graph to show top k lines
    function updateK(new_k) {
      k = new_k;
      console.log("Changing k to " + k)

      max_path = d3.max(data.links, function (d) { return (d[var_name + '_R'] < k ? d[var_name] : 0) });
      console.log("Changed max path weight to " + max_path);

      link // make not relevant lines invisible
      .data(data.links)
      .filter(function(d){return d[var_name + '_R'] >= k})
      .transition()
      .attr("opacity", 0)

      link // make relevant lines visible
      .data(data.links)
      .filter(function(d){return d[var_name + '_R'] < k})
      .transition()
      .attr("opacity", function(d) {return 0.5 + d.Total/max_path})
    }
  

    vars = [['Total', 'Weekday', 'Weekend'],
            ['Morning', 'Morning Weekday', 'Morning Weekend'],
            ['Afternoon', 'Afternoon Weekday', 'Afternoon Weekend'],
            ['Night', 'Night Weekday', 'Night Weekend']]



    function hideClass(bool, String) {
      // if (String == 'userOptions') {
      //   if (bool) {
      //     d3.selectAll('path')
      //     .attr('opacity', 0);
      //   } else {
      //     d3.selectAll('path')
      //     .attr('opacity', 1);
      //   }
      // }

      const element = d3.select('#'+String); // Or however you're deriving id
      const show = element.style('display') === 'none';
      //d3.selectAll('.tooltip').style('display', 'none');
      if (bool) {
        element.style('display', 'none');
      } else if (show) {
        element.style('display', 'block')
      }
    }

    if (page == 0) {
      page0();
    }

    function page0() {
      hideClass(true, "userOptions");
      hideClass(false, "page0");
      hideClass(true, "page1");
      hideClass(true, 'page2');
      hideClass(true, 'page3');
      hideClass(true, 'page4');
      hideClass(true, 'page5');
      hideClass(true, 'page6');
      hideClass(true, 'page7');
      hideClass(true, 'page8');
      hideClass(true, 'page9');
    }

    function page1() {
      hideClass(true, 'page0');
      hideClass(false, 'page1');
      hideClass(true, 'userOptions');

      map.filter(function(d, i){return i == 1})
      .attr('fill', 'red');
    }

    function page2() {
      hideClass(false, 'page2');
      hideClass(true, 'page1');

      map.
        attr('fill', 'black');

      node.
        transition()
        .duration(function (d,i){return 100 + (419 - i) * 2})
        .attr('opacity', 1)
    }

    function page3(){
      hideClass(false, 'page3');
      hideClass(true, 'page2');

      link
      .attr('opacity', 0.2);
    }

    // Zoom in on Governors Island. Change projection. Show text.
    function page4(){
      hideClass(false, 'page4');
      hideClass(true, 'page3');

      link
      .attr('opacity', 0);

      updateK(4);

      link
      .filter(function (d) {return d[var_name + '_R'] < 4})
      .attr('opacity', function(d) {return 0.5 + d.Total/max_path})

      projection.scale(1000 * height).center([-74.02519246, 40.688633]);
      geoGenerator.projection(projection);

      map
      .transition()
      .duration(2500)
      .attr('d', geoGenerator)

      node
      .transition()
      .duration(2500)
      .attr("cx", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[0]})
      .attr("cy", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[1]})
      .attr("r", 5);

      link
      .transition()
      .duration(2500)
      .attr("x1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[0]})
      .attr("y1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[1]})
      .attr("x2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[0]})
      .attr("y2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[1]});

      div
      .style('display', 'block')

      node
      .on('mouseover', function(d, i) { // on mouseover, make circle bigger and display text 
        d3.select(this)
          .transition()
          .attr('r', 15);
        div.html("<span style=\"font-size: 20px\"><b>Start Station Name:</b> " + d['start station name'] + "</span><br/><span style=\"font-size: 15px\"><b>Location: </b>(" + d["start station longitude"].toFixed(3)+ ", " + d["start station latitude"].toFixed(3) + ")");
        link_hover(d["start station name"]);
        adjacent_stations(d["start station id"]);
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 5);
        div.html("Hover over a station to find out more.");
        link_dehover();
        node
        .attr("fill", "red");
      });
    }
    
    function page5(){
      hideClass(false, 'page5');
      hideClass(true, 'page4');

      var_name = 'Morning';

      updateK(400);

      projection.scale(320 * height).center([-73.9884845, 40.7499]);
      geoGenerator.projection(projection);

      map
      .transition()
      .duration(2500)
      .attr('d', geoGenerator)

      link
      .transition()
      .duration(2500)
      .attr("x1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[0]})
      .attr("y1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[1]})
      .attr("x2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[0]})
      .attr("y2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[1]});

      node
      .transition()
      .duration(2500)
      .attr("cx", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[0]})
      .attr("cy", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[1]})
      .attr("r", 2);

      node
      .on('mouseover', function(d, i) { // on mouseover, make circle bigger and display text 
        d3.select(this)
          .transition()
          .attr('r', 5);
        div.html("<span style=\"font-size: 20px\"><b>Start Station Name:</b> " + d['start station name'] + "</span><br/><span style=\"font-size: 15px\"><b>Location: </b>(" + d["start station longitude"].toFixed(3)+ ", " + d["start station latitude"].toFixed(3) + ")");
        link_hover(d["start station name"]);
        adjacent_stations(d["start station id"]);
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 2);
        div.html("Hover over a station to find out more.");
        link_dehover();
        node
        .attr("fill", "red");
      });
    }

    function page6(){
      hideClass(false, 'page6');
      hideClass(true, 'page5');

      var_name = 'Afternoon';

      updateK(k);
    }

    function page7(){
      hideClass(false, 'page7');
      hideClass(true, 'page6');

      var_name = 'Night';
      updateK(k);
    }

    function page8(){
      hideClass(false, 'page8');
      hideClass(true, 'page7');

      var_name = 'Weekday';
      updateK(k);
    }

    function page9(){
      hideClass(false, 'page9');
      hideClass(true, 'page8');

      var_name = 'Weekend';
      updateK(k);
    }

    function user_contol_page(){
      updateK(slider.value);
      hideClass(false, 'userOptions');
      hideClass(true, 'page9');

      var_name = 'Total';

      vars = [['Total', 'Weekday', 'Weekend'],
      ['Morning', 'Morning Weekday', 'Morning Weekend'],
      ['Afternoon', 'Afternoon Weekday', 'Afternoon Weekend'],
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

      // Listen to the slider. If new value is different from old value, update number of  lines
      d3.select("#map_display").on("change", function(d){
      map_visible = !map_visible;
      console.log("Changing map to " + map_visible);
      toggle_map(map_visible);
      })

      node
      .on('mouseover', function(d, i) { // on mouseover, make circle bigger and display text 
        d3.select(this)
          .transition()
          .attr('r', 5);
          div.html("<span style=\"font-size: 20px\"><b>Start Station Name:</b> " + d['start station name'] + "</span><br/><span style=\"font-size: 15px\"><b>Location: </b>(" + d["start station longitude"].toFixed(3)+ ", " + d["start station latitude"].toFixed(3) + ")" + getNumRides(d['start station id']) + "</span>");
          link_hover(d["start station name"]);
        adjacent_stations(d["start station id"]);
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 2);
        div.html("Hover over a station to find out more.");
        link_dehover();
        node
        .attr("fill", "red");
      });
    }

      var page_calls = [page0, page1, page2, page3, page4, page5, page6, page7, page8, page9, user_contol_page]
      var num_pages = page_calls.length;

      d3.select("#forwardButton").on("click", function(d) {
        page++;
        if (page >= num_pages) {
          console.log("last page already reached." + page);
        } else {
          d3.select("#pageNumber")
              .text("Page " + (page + 1) + "/10");
          d3.select('#forwardButton')
              .text( 'Next Page');

          page_calls[page]();

          if (page + 1 == num_pages){ // Hide on last page
            d3.select('#forwardButton')
            .style('display', 'none');
            d3.select('#pageNumber')
            .style('display', 'none');
          }
        }
     })
  });
});
