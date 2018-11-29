
(function(){

    
//pseudo global variables
var attrArray = ["Diabetes Rate", "HIV Risk", "Median Income","Poverty Rate","Homicide Rate"];
var expressed= attrArray[0];

//chart frame dimensions
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scale.linear()
    .range([463, 0])
    .domain([0, 110]);
    


window.onload = setMap();

//set up choropleth map
function setMap(){
    
    
    //ZZ change size of map and chart
    var width = window.innerWidth * .5,
        height = 470;
    
    var map = d3.select( "body" )
          .append( "svg" )
          .attr( "width", width )
          .attr( "height", height )
          .attr("class", "map");
      
      
      
    // create albers projections centered on West Virginia  
    var projection = d3.geo.albers()
        .center([5, 38.8])
		.rotate([85.8,0])
        .scale(5000)
        .translate([width / 2, height / 2]);
    
    
      
      //create path generator variable
     var path = d3.geo.path()
        .projection(projection);
    
    
    
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/wv_county_data.csv") //load attributes from csv
        .defer(d3.json, "data/ky-counties.json") //load wv county topjson
        .defer(d3.json, "data/states.json") //load states topojson
    
        .await(callback);
    
   
   
function callback(error, csvData, westva, states_ ){
            

        // counties block, append and translate topjson data from WV Counties and states  
        var states = topojson.feature(states_, states_.objects.states),
                counties = topojson.feature(westva, westva.objects.cb_2015_west_virginia_county_20m).features;
           
                 
        // add the state lines to the map
        var statelines =  map.append("path")
                .datum(states)
                .attr("class","states")
                .attr( "d", path );
     
         //joing csv datat to Geojson enumeration units       
        counties = joinData(counties,csvData);
        
    
        var colorScale = makeColorScale(csvData);
        //add enumeration units to map
        setEnumerationUnits(counties,map,path,colorScale);
    
        setChart(csvData, colorScale);
    
        createDropdown(csvData);
      
        
};};
    
//function to create coordinated bar chart//keep everything in here bar related
function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
     var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
    
    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
       
    //create a scale to size bars proportionally to frame
    var yScale = d3.scale.linear()
        .range([463, 0])
        .domain([0, 100]);
    
     //set bars for each province maybe put this below callback funciton?
    var bars = chart.selectAll(".bar") //!!! changed to bars from bar?
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.GEOID;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){ //!!! unblocked this x function
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
    
        .attr("height", function(d, i){ //probs remove
            return 463 - yScale(parseFloat(d[expressed]));

        })
        .attr("y", function(d, i){ // probs remove
            return yScale(parseFloat(d[expressed])) + topBottomPadding;

        })
        
        
//        .attr("width", chartInnerWidth / csvData.length - 1)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel);
    
     var desc = bars.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}')
//       
//        .attr("y", function(d, i){
//            return yScale(parseFloat(d[expressed])) + topBottomPadding;
//
//        })
//        
        .style("fill", function(d){    //!!! probs remove
            return choropleth(d, colorScale);
        });

    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text( expressed.slice(0,15) + " in WV Counties");
    
     //create vertical axis generator
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
    
    updateChart(bars, csvData.length, colorScale);

              };
    
    
     // function CSV and Geojson attribute data transfer *
function joinData(counties, csvData){
        for (var i=0; i<csvData.length; i++){
            var csvCounty = csvData[i]; //the current region
            var csvKey = csvCounty.GEOID; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a=0; a<counties.length; a++){

                var geojsonProps = counties[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.GEOID; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvCounty[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };

              };


    };      

     return counties;   
    };
    
function setEnumerationUnits(counties, map, path,colorScale){
    
      var countylines = map.selectAll(".countylines")
                .data(counties)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "countylines " + d.properties.GEOID;
                })
                .attr("d", path)
                .style("fill", function(d){
            return choropleth(d.properties,colorScale);
                    //return colorScale(d.properties[expressed]); 
        })
              .on("mouseover", function(d){
                    highlight(d.properties);
                })
              .on("mouseout", function(d){
            dehighlight(d.properties);
        })
             .on("mousemove", moveLabel);
    

                
     var desc = countylines.append("desc")
              .text('{"stroke": "#000", "stroke-width": "0.5px"}');

      
      
      
      
  

                
    
};
    
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};
    
function makeColorScale(data){  // !!! counties
    var colorClasses = [
        "#b3cde0",
        "#6497b1",
        "#005b96",
        "#03396c",
        "#011f4b"
    ];

    //create color scale generator
    var colorScale = d3.scale.quantile()
        .range(colorClasses);
    
    // !!! var minmax?
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
    ];
  colorScale.domain(minmax);

    return colorScale;
    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<counties.length; i++){
        var val = parseFloat(counties[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
};
    //function to create a dropdown menu for attribute selection
function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });
    
    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
};


//dropdown change listener handler
function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);


    //recolor enumeration units
    var countylines = d3.selectAll(".countylines")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        })
    
    //alternate highlight
//        .select("desc")
//            .text(function(d) {
//                return choropleth(d, colorScale(csvData));
//            });


   // re-sort, resize, and recolor bars
    var bars = d3.selectAll(".bar") //!!! says bar instead of bars in tutorial/// maybe move bars pseudo global variable
        //re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d, i){
            return i * 20
        })
        .duration(500)

    updateChart(bars,csvData.length, colorScale)
};

function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });
    
        var chartTitle = d3.select(".chartTitle")
        .text(expressed.slice(0,15) + " in WV Counties");
};
    
//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
   
    var selected = d3.selectAll("." + props.GEOID)
        .style("stroke", "#DAA520")
        .style("stroke-width", "6");
    
    setLabel(props);
};

    //function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.GEOID)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
    //below Example 2.4 line 21...remove info label
    d3.select(".infolabel")
        .remove();
};
    

//function to create dynamic label
function setLabel(props){
    //label content
    var labelAttribute = "<h1>" + props[expressed] +
        "</h1><b>" + expressed + "</b>";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.GEOID + "_label")
        .html(labelAttribute);

    var regionName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.NAME);
};

//function to move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};
    
    
    

    ;})();