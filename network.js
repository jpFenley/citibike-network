///////////////////////////////SECTION FOR WEBSITE (NOT d3)///////////////////////////////////////////////
var slider = document.getElementById("k");
var output = document.getElementById("kRides");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}

// Creaate SVG variable
var svg = d3.select("svg"); // select the first element that matches the specified selector string

// Initial variable values
var timeVarIndex = 0;
var dayVarIndex = 0;
var varName = 'Total'
var mapVisible = true;
var maxPath = 1712;
var page = 0;
var k = 0;

// Set bounds for image part
var bounds = svg.node().getBoundingClientRect(),
  width = bounds.width;
  height = bounds.height;

// Create map projection
let projection = d3.geoMercator()
  .scale(320 * height)
  .translate([width/2,height/2])
  .center([-73.9884845, 40.7499]);

// Converts paths to be drawn on the map
let geoGenerator = d3.geoPath()
  .projection(projection);

// Create text field. Hidden at first
var div = d3.select("body").append("div")
  .attr("class", "tooltip")				
  .text("Hover over a station to find out more.")
  .style("top", "25px")
  .style("font-size", "20px")
  .style("left", width + 20 + "px")
  .style("width", 3 * width / 5 + "px")
  .style("display", "none");

// Reads in geojson file and ride data
d3.json('Data/Input/bouroughs.geojson', function(geojson) {
  d3.json("Data/Output/combined.json", function(data){

    //  Create map. Use geojson file to draw boroughs
    var map = svg
      .append("g")
      .attr("class", "map")
      .selectAll('path')
      .data(geojson.features)
      .enter()
        .append('path')
        .attr('d', geoGenerator)
        .attr('opacity', 1);

    // Created edges between stations. These are hidden at first
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

    // Create circles for stations. These are hidden at first
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
          })
          .on('mouseout', function(d, i) {
            d3.select(this)
              .transition()
              .attr('r', 2);
          })

    // Given a station ID, find the stations that are connected to it
    // when only considering the k top rides. Set the adjacnet stations to be 
    // yellow.
    function adjacentStations(stationId){
      var adjacentStations = [];
      for (var i = 0; i < data.links.length; i++){
        if (data.links[i][varName + '_R'] < k){
          if (data.links[i]["start station id"] == stationId){
            adjacentStations.push(data.links[i]["end station id"]);
          } 
          if (data.links[i]["end station id"] == stationId){
            adjacentStations.push(data.links[i]["start station id"]);
          }
        }

      }
      node
      .filter(function(d) {return adjacentStations.includes(d['start station id'])})
      .attr("fill", "yellow");
    }

    // Given a station ID, find the number of stations that are connected to it
    // when only considering the k top rides.
    function getNumRides(stationId) {
      var numRides = link
      .filter(function(d) {return d['start station id'] == stationId || d["end station id"] == stationId})
      .filter(function (d) {return d[varName + '_R'] < slider.value})
      .size();	
      return "<br/>Station has <b>" + numRides + "</b> of the top <b>" + slider.value + "</b> rides.";
    }

    // When hovering over a station, set the paths to adjacent stations to be wider
    function linkHover(stationId) {
      link // make not relevant lines invisible
      .data(data.links)
      .filter(function(d){var start = d['start station name'];
                          var end = d['end station name'];
                          return (start == stationId || end == stationId)})
      .transition()
      .attr("stroke-width", 5);
    }

    // Reset all edges to be of same width
    function linkDehover() {
      link
      .data(data.links)
      .transition()
      .attr("stroke-width", 1);
    }

    //Makes map appear and disappear
    function toggleMap(bool){
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
    function updateK(newK) {
      k = newK;
      console.log("Changing k to " + k)

      maxPath = d3.max(data.links, function (d) { return (d[varName + '_R'] < k ? d[varName] : 0) });
      console.log("Changed max path weight to " + maxPath);

      link // make not relevant lines invisible
      .data(data.links)
      .filter(function(d){return d[varName + '_R'] >= k})
      .transition()
      .attr("opacity", 0)

      link // make relevant lines visible
      .data(data.links)
      .filter(function(d){return d[varName + '_R'] < k})
      .transition()
      .attr("opacity", function(d) {return 0.5 + d.Total/maxPath})
    }
  

    vars = [['Total', 'Weekday', 'Weekend'],
            ['Morning', 'Morning Weekday', 'Morning Weekend'],
            ['Afternoon', 'Afternoon Weekday', 'Afternoon Weekend'],
            ['Night', 'Night Weekday', 'Night Weekend']]


    // Hide a class to change pages
    function hideClass(bool, String) {
      const element = d3.select('#'+String); // Or however you're deriving id
      const show = element.style('display') === 'none';
      if (bool) { // hide the class
        element.style('display', 'none');
      } else if (show) { // display the class
        element.style('display', 'block')
      }
    }

    // Home page - introduction to the data and visualization
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

    // Hides the home page and shows the first page
    // Colors map of Manhattan red for emphasis
    function page1() {
      hideClass(true, 'page0');
      hideClass(false, 'page1');
      hideClass(true, 'userOptions');

      map.filter(function(d, i){return i == 1})
      .attr('fill', 'red');
    }

    // Displays the Citi Bike stations in Manhattan as red dots
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

    // Displays popular routes in June 2019
    function page3(){
      hideClass(false, 'page3');
      hideClass(true, 'page2');

      link
      .attr('opacity', 0.2);
    }

    // Shows 4 most popular rides in Manhattan
    // Zoom in on Governors Island. Change projection. Show text.
    function page4(){
      hideClass(false, 'page4');
      hideClass(true, 'page3');

      link
      .attr('opacity', 0);

      updateK(4);

      link
      .filter(function (d) {return d[varName + '_R'] < 4})
      .attr('opacity', function(d) {return 0.5 + d.Total/maxPath})

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
        linkHover(d["start station name"]);
        adjacentStations(d["start station id"]);
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 5);
        div.html("Hover over a station to find out more.");
        linkDehover();
        node
        .attr("fill", "red");
      });
    }
    
    // Changes scale back to original (to show all of Manhattan again)
    // Displays 400 most popular rides in the morning
    function page5(){
      hideClass(false, 'page5');
      hideClass(true, 'page4');

      varName = 'Morning';

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
        linkHover(d["start station name"]);
        adjacentStations(d["start station id"]);
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 2);
        div.html("Hover over a station to find out more.");
        linkDehover();
        node
        .attr("fill", "red");
      });
    }

    // Displays the most popular rides in the afternoon
    function page6(){
      hideClass(false, 'page6');
      hideClass(true, 'page5');

      varName = 'Afternoon';

      updateK(k);
    }

    // Displays most popular rides at night
    function page7(){
      hideClass(false, 'page7');
      hideClass(true, 'page6');

      varName = 'Night';
      updateK(k);
    }

    // Displays the most popular rides during the week
    function page8(){
      hideClass(false, 'page8');
      hideClass(true, 'page7');

      varName = 'Weekday';
      updateK(k);
    }

    // Displays most popular rides during the weekend
    function page9(){
      hideClass(false, 'page9');
      hideClass(true, 'page8');

      varName = 'Weekend';
      updateK(k);
    }

    // Self-guided exploration
    // User is able to control how many rides are shown, time of day,
    // what part of the week, and can toggle the background map on/off.
    function userContolPage(){
      updateK(slider.value);
      hideClass(false, 'userOptions');
      hideClass(true, 'page9');
      hideClass(true, 'page8');
      hideClass(true, 'page7');
      hideClass(true, 'page6');
      hideClass(true, 'page5');
      hideClass(true, 'page4');
      hideClass(true, 'page3');
      hideClass(true, 'page2');
      hideClass(true, 'page1');
      hideClass(true, 'page0');
    
      div.
      style('display', 'block');

      varName = 'Total';
    
      vars = [['Total', 'Weekday', 'Weekend'],
      ['Morning', 'Morning Weekday', 'Morning Weekend'],
      ['Afternoon', 'Afternoon Weekday', 'Afternoon Weekend'],
      ['Night', 'Night Weekday', 'Night Weekend']]

      // Update which variable is being used based on options selected with buttons
      function updateVar(timeVarIndex, dayVarIndex) {
        varName = vars[timeVarIndex][dayVarIndex]
        console.log("Changing target variable to " + varName)
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
        timeVarIndex = this.value;
        updateVar(timeVarIndex, dayVarIndex)
      });

      // Listen to the day variable slider. If new value is different from old value, update which day variable is being used
      d3.selectAll("input[name='days']").on("change", function(){
        console.log("Changing day index to" + this.value)
        dayVarIndex = this.value;
        updateVar(timeVarIndex, dayVarIndex)
      });

      // Listen to the slider. If new value is different from old value, update number of  lines
      d3.select("#map_display").on("change", function(d){
        mapVisible = !mapVisible;
        console.log("Changing map to " + mapVisible);
        toggleMap(mapVisible);
      })


      map
      .attr('fill', 'black')
      .attr("cx", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[0]})
      .attr("cy", function(d) {return projection([d["start station longitude"], d["start station latitude"]])[1]})
      .attr("r", 2);

      link
      .attr("x1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[0]})
      .attr("y1", function(d) { return projection([d["start station longitude"], d['start station latitude']])[1]})
      .attr("x2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[0]})
      .attr("y2", function(d) { return projection([d["end station longitude"], d['end station latitude']])[1]});

      node
      .attr("opacity", 1) 
      .on('mouseover', function(d, i) { // on mouseover, make circle bigger and display text 
        d3.select(this)
          .transition()
          .attr('r', 5);
          div.html("<span style=\"font-size: 20px\"><b>Start Station Name:</b> " + d['start station name'] + "</span><br/><span style=\"font-size: 15px\"><b>Location: </b>(" + d["start station longitude"].toFixed(3)+ ", " + d["start station latitude"].toFixed(3) + ")" + getNumRides(d['start station id']) + "</span>");
          linkHover(d["start station name"]);
        adjacentStations(d["start station id"]);
      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .transition()
          .attr('r', 2);
        div.html("Hover over a station to find out more.");
        linkDehover();
        node
        .attr("fill", "red");
      });

      updateK(200);
    }

      var pageCalls = [page0, page1, page2, page3, page4, page5, page6, page7, page8, page9, userContolPage]
      var numPages = pageCalls.length;

      // If the user jumps to interactive page, update necessary components
      d3.select('#interactive').on("click", function(d) {
        page = 10
        page5();
        pageCalls[page]();
        d3.select('#forwardButton')
        .style('display', 'none');
        d3.select('#pageNumber')
        .style('display', 'none');
        d3.select('#interactive')
        .style('display', 'none');
        d3.select('#reload')
        .style('display', 'inline-block');
      })

      // Handle changing to next page
      d3.select("#forwardButton").on("click", function(d) {
        page++;
        d3.select('#reload')
        .style("display", 'inline-block');
        if (page >= numPages) {
          console.log("last page already reached." + page);
        } else {
          d3.select("#pageNumber")
              .text("Page " + (page + 1) + "/10");
          d3.select('#forwardButton')
              .text( 'Next Page');

          pageCalls[page]();

          if (page + 1 == numPages){ // Hide page button on last page
            d3.select('#forwardButton')
            .style('display', 'none');
            d3.select('#pageNumber')
            .style('display', 'none');
            d3.select('#interactive')
            .style('display', 'none');
          }
        }
     })
  });
});