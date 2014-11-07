'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route','$window', 
  function($scope, $location, $route, $window) {
	
	$scope.timeSeries = 'timeSeries';
    d3.csv("expectedActual.csv", function(error, energyData) {
    	
    var daysBetween;  // stores the number of days between the min time and max time to determine the new scaling
    
    var getDomain = function(){
      $scope.startDate = $scope.startDate ? $scope.startDate : new Date(monthDimension.bottom(1)[0].date);
  	  $scope.endDate = $scope.endDate ? $scope.endDate : new Date(monthDimension.top(1)[0].date);
  	  		 
  	  daysBetween = ($scope.endDate - $scope.startDate)/(1000*60*60*24) 
  	  
  	  var tempDomain = d3.scale.linear().domain([$scope.startDate,$scope.endDate]);
  	  
  	  return tempDomain;
    };
    
    var myDomain, 
        myDimension,
        actualGroup,
        expectedGroup,
        savingsGroup,
        savingsSum,
        myXUnits,
        totalSum
    ;
    	
    var numberOfTicks;
    
    $scope.log = function() {
      console.log($window);
  	  console.log($scope);
  	};
  	  		  	
  	$scope.redraw = function(){
  	  $scope.setParams();
  	  compositeChart();
  	  //dc.renderAll();
  	};
  	  	
  	$scope.setParams = function(){
  		w = $window.innerWidth - 50;
  		h = w*.5;
  		lX = (w-100);
  		lY = (0);
  		
  		if(h > $window.innerHeight){
  			h = $window.innerHeight - 250;
  		}
  			
  		myDomain = getDomain();

  		if(daysBetween <= 30){
  			myDimension = dayDimension;
  			myXUnits = d3.time.days;
  		    displayDate= d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  		    numberOfTicks = daysBetween;
  		}
  		else if(daysBetween <= (180)){
  			myDimension = weekDimension;
  			myXUnits = d3.time.weeks;
  			displayDate= d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  			numberOfTicks = daysBetween/7;
  		}
  		else{
  			myDimension = monthDimension;
  			myXUnits = d3.time.months;
  			displayDate = d3.time.format("%m-%y"); // function to change the format of a date object to mm-yyyy
  			numberOfTicks = daysBetween/30;
  		}
  		
  		actualGroup = myDimension.group().reduceSum(function(d) { return d.actualKWH;}) // groups a value for each entry in the dimension by summing all the 'actualKWH' values of all objects within that dimension
  	    expectedGroup = myDimension.group().reduceSum(function(e) { return +e.expectedKWH;}) // same as above with expectedKWH
  	    savingsGroup = myDimension.group().reduceSum(function(e) { return +e.savings;}) // same as above with savings
  			
  	    
  		savingsSum = myDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
  		  function(p,v) {totalSum = (+v.savings) + totalSum;  return totalSum;}, // sets the method for adding an entry into the total
           function(p,v) {totalSum = totalSum-(+v.savings); return totalSum;}, // sets the method for removing an entry from the total
           function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
  		);
  	    
	    if(compositeChart !== undefined){
	      compositeChart();
	    }
  	};
  	
    var parse = d3.time.format("%m/%d/%Y").parse; // parses out the date object from the string
    var displayDate; // function to change the format of a date object to mm-yyyy;
    	
    var ndx = crossfilter(energyData)

    var monthDimension = ndx.dimension(function(d) { return d3.time.month(parse(d.date));}) // creates the x-axis components using their date as a guide
    var weekDimension = ndx.dimension(function(d) { return d3.time.week(parse(d.date));})
    var dayDimension = ndx.dimension(function(d) { return d3.time.day(parse(d.date));})
       
    var w, // sets the width, height, margin, legend X and legend Y values
        h,
    	m = [75,150],
    	lX,
    	lY
    ;
    
    $scope.setParams();
           
    
        
    var compositeChart = function(){
      var composite = dc.compositeChart("#test_composed") // creates the graph object
            .width(w) // sets width
            .height(h) // sets height
            .x(myDomain) // sets X axis
            .elasticX(false) // allows X axis to be zoomed in/out
            .elasticY(false)
            .xUnits(myXUnits)
            .yAxisLabel("kW")
            .legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
            .renderHorizontalGridLines(true)
            .mouseZoomable(false)
            .compose([
              dc.lineChart(composite)
                  .dimension(myDimension) // use the date dimension for the objects
                  .colors('gray')
                  .group(savingsSum, "Total Savings/Waste") // use the savings group for the grouped values
                  .renderArea(true)
                  .interpolate('cardinal')
                  .tension(0.5)
              ,
              dc.barChart(composite) // creates the bar chart
                  .dimension(myDimension) // use the date Dimension for the objects
                  .colors('cyan')
                  .group(savingsGroup, "Savings")// use the savings group for the grouped values
                  .centerBar(true)
                  .barPadding(0.5)
              ,
              dc.lineChart(composite)
                  .dimension(myDimension) // use the date dimension for the objects
                  .colors('blue')
                  .group(actualGroup, "Actual KWH")// use the savings group for the grouped values
                  .interpolate('cardinal')
                  .tension(0.5)
               , 
               dc.lineChart(composite)
                  .dimension(myDimension) // use the date dimension for the objects
                  .colors('red')
                  .group(expectedGroup, "Expected KWH")  // use the savings group for the grouped values
                  .interpolate('cardinal')
                  .tension(0.5)
              ])
            .brushOn(false) // disables the fiddle/violin selection tool
          ;

          composite.margins().left = m[0]; // sets the left margin for the composite chart
          composite.margins().right = m[1]; // sets the right margin for the composite chart
          
          composite.xAxis().tickFormat(function(v) {return displayDate(new Date(v));}); // sets the tick format to be the month/year only
          composite.render();
          return composite;
      };

      compositeChart();
  
      //$scope.redraw();
      $scope.$apply() // no idea
    });
}]);