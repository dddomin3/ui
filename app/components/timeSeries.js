'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route', 
                    function($scope, $location, $route) {
	$scope.timeSeries = 'timeSeries';
    d3.csv("expectedActual.csv", function(error, energyData) {

    	var timeChart = dc.barChart("#time_chart"); // names/creates the chart
    	var composite = dc.compositeChart("#test_composed"); // names/creates the chart
        
    	var parse = d3.time.format("%m/%d/%Y").parse; // parses out the date object from the string
    	var displayDate = d3.time.format("%m-%Y"); // function to change the format of a date object to mm-yyyy
    	
        var ndx = crossfilter(energyData)
        var totalSum = 0;
        
        var dateDimension = ndx.dimension(function(d) { return d3.time.month(parse(d.date));}) // creates the x-axis components using their date as a guide 
        
        var actualGroup = dateDimension.group().reduceSum(function(d) { return d.actualKWH;}) // groups a value for each entry in the dimension by summing all the 'actualKWH' values of all objects within that dimension
        var expectedGroup = dateDimension.group().reduceSum(function(e) { return +e.expectedKWH;}) // same as above with expectedKWH
        var savingsGroup = dateDimension.group().reduceSum(function(e) { return +e.savings;}) // same as above with savings

        var savingsSum = dateDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
          function(p,v) {totalSum = (+v.savings) + totalSum;  return totalSum;}, // sets the method for adding an entry into the total
          function(p,v) {totalSum = totalSum-(+v.savings); return totalSum;}, // sets the method for removing an entry from the total
          function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
        );
        
        $scope.domainX = function () { return d3.scale.linear().domain([1,12]);} // returnable domain, this feeds into the timeSeries.html page for the other charts
        
        var w = 900, // sets the width, height, margin, legend X and legend Y values
    	    h = 680,
    	    m = [75,150],
    	    lX = (w-m[1])+25,
    	    lY = (h)-650;
    
        var minDate = dateDimension.bottom(1)[0].date; // sets the lowest date value from the available data
        var maxDate = dateDimension.top(1)[0].date; // sets the highest date value from the available data
        
        composite.xAxis().tickFormat(function(v) {return displayDate(new Date(v));}); // sets the tick format to be the month/year only
        
        composite.margins().left = m[0]; // sets the left margin for the composite chart
        composite.margins().right = m[1]; // sets the right margin for the composite chart
        
        timeChart.margins().left = m[0]; // sets the left margin for the time chart
        timeChart.margins().right = m[1]; // sets the right margin for the time chart
        
        d3.select(".dc-chart"); // selects the chart
        
        timeChart
          .dimension(dateDimension) // use the date Dimension for the objects
          .colors('cyan')
          .group(savingsGroup, "Savings") // use the savings group for the grouped values
          .centerBar(true)
          .x(d3.scale.linear().domain([minDate,maxDate]))
          .xUnits(d3.time.weeks)
        ;
        
        composite // creates the graph object
          .width(w) // sets width
          .height(h) // sets height
          .x(d3.scale.linear().domain([minDate,maxDate])) // sets X axis
          .xUnits(d3.time.months) // sets X axis units
          .elasticX(true) // allows X axis to be zoomed in/out
          .elasticY(true)
          .yAxisLabel("The Y Axis")
          .legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
          .renderHorizontalGridLines(true)
          .mouseZoomable(true)
          .compose([
            dc.barChart(composite) // creates the bar chart
                .dimension(dateDimension) // use the date Dimension for the objects
                .colors('cyan')
                .group(savingsGroup, "Savings") // use the savings group for the grouped values
                .centerBar(true),
            dc.lineChart(composite)
                .dimension(dateDimension) // use the date dimension for the objects
                .interpolate("basis")
                .colors('blue')
                .group(actualGroup, "Actual KWH"), // use the savings group for the grouped values
             dc.lineChart(composite)
                .dimension(dateDimension) // use the date dimension for the objects
                .interpolate("basis")
                .colors('red')
                .group(expectedGroup, "Expected KWH"), // use the savings group for the grouped values
            dc.lineChart(composite)
                .dimension(dateDimension) // use the date dimension for the objects
                .colors('gray')
                .interpolate("basis")
                .group(savingsSum, "Total Savings/Waste") // use the savings group for the grouped values
                .renderArea(true)
            ])
          .brushOn(false) // disables the fiddle/violin selection tool
          .rangeChart(timeChart)
        ;

        dc.renderAll();
        $scope.$apply() // no idea
    });
}]);