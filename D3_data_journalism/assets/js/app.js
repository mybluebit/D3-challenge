// Resizing function for being responsive
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clearing svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }

    // Setting the width and height of svg
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 100,
        bottom: 100,
        right: 100,
        left: 100
      };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Creating an SVG wrapper, append an SVG group that will hold our chart,
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Appending an SVG group
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
  function xScale(journalismData, chosenXAxis) {
      // creating scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(journalismData, d => d[chosenXAxis])*0.8,
          d3.max(journalismData, d => d[chosenXAxis])*1.2
        ])
        .range([0, width]);
    
      return xLinearScale;
    
  }
  
  // function used for updating y-scale var upon click on axis label
  function yScale(journalismData, chosenYAxis) {
    // creating scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(journalismData, d => d[chosenYAxis])*0.8,
        d3.max(journalismData, d => d[chosenYAxis])*1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
     
  // function used for updating yAxis var upon click on axis label
  function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }
  
  // updating circles group lables with transitions
  function renderLabels(cLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    cLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return cLabels;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    var label;
    var labelY;
    var suffix = "";

    // Setting labels for X axis selection for Popup data
    if (chosenXAxis === "poverty") {
      label = "Poverty: ";
      suffix = "%"
    }
    else if (chosenXAxis === "income"){
        label = "Income: $ ";
    }
    else {
      label = "Age: ";
    }

    // Setting labels for Y axis selection for Popup data
    if (chosenYAxis === "obesity") {
      labelY = "Obesity: ";
    }
    else if (chosenYAxis === "smokes"){
        labelY = "Smokes: ";
    }
    else {
      labelY = "Lacks Healthcare: ";
      
    }
    
    // Setting ToolTip, Popup data
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, -70])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]} ${suffix}<br>${labelY} ${d[chosenYAxis]} %`);
      });
  
    circlesGroup.call(toolTip);
  
    // Setting Mouseover and out events
    // on mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // on mouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
  // Retrieving data from the CSV file and executing everything below
  d3.csv("assets/data/data.csv").then(function(journalismData, err) {
    if (err) throw err;
  
    // parse data
    journalismData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
      
    });

    // Displaying data to be sure everything looks correct
    console.log(journalismData);

    // xLinearScale & yLinearScale function above csv import
    var xLinearScale = xScale(journalismData, chosenXAxis);
    var yLinearScale = yScale(journalismData, chosenYAxis);
  
  
    // Creating initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // appending x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // appending y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    // appending initial circles
    var gGroup = chartGroup.selectAll("g")
        .data(journalismData)
        .enter()
        .append("g")
        .classed("circles", true);

    var circlesGroup = gGroup.append("circle")
      .data(journalismData)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .classed("stateCircle", true)
      .attr("style","stroke:grey")
      .attr("opacity", ".5");
    
    // appending initial labels
    var cLabels = chartGroup.selectAll(".circles")
      .append("text")
      .text(d => d.abbr)    
      .classed("stateText", true)
      .attr("alignment-baseline", "middle")
      .attr("font-size",".8em")
      .attr("x", d => xLinearScale(d[chosenXAxis]))  
      .attr("y", d => yLinearScale(d[chosenYAxis]));        
  
    // Creating group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  

    // Creating group for three y-axis labels
    var labelsGroupY = chartGroup.append("g")
      .attr("transform", "rotate(-90)");
  
    var obesityLabel = labelsGroupY.append("text")
      .attr("x", 0 - (height / 2))
      .attr("y", -70)
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .text("Obesity (%)");
  
    var smokesLabel = labelsGroupY.append("text")
      .attr("x", 0 - (height / 2))
      .attr("y", -50)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = labelsGroupY.append("text")
      .attr("x", 0 - (height / 2))
      .attr("y", -30)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // getting value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replacing chosenXAxis with value
          chosenXAxis = value;
  
          console.log(chosenXAxis)
  
          // functions here found above csv import
          // updating x scale for new data
          xLinearScale = xScale(journalismData, chosenXAxis);
  
          // updating x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updating circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
  
          // updating tooltips with new info
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
          
          // updating labels with new info
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // changing classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);          
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

    // y axis labels event listener
    labelsGroupY.selectAll("text")
    .on("click", function() {
      // getting value of selection
      var valueY = d3.select(this).attr("value");
      if (valueY !== chosenYAxis) {

        // replacing chosenYAxis with value
        chosenYAxis = valueY;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updating y scale for new data
        yLinearScale = yScale(journalismData, chosenYAxis);

        // updating y axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updating circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);

        // updating tooltips with new info
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        // updating labels with new info
        cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          
        // changing classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "healthcare") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);          
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
  });


}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

