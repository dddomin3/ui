'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route','$window', 
  function($scope, $location, $route, $window) {
	
	$scope.timeSeries = 'timeSeries';
    d3.csv("expectedActual.csv", function(error, energyData) {
    	
    var daysBetween;  // stores the number of days between the min time and max time to determine the new scaling
    
    var getDomain = function(){
      $scope.startDate = $scope.startDate ? $scope.startDate : new Date(myDimension.bottom(1)[0].date);
  	  $scope.endDate = $scope.endDate ? $scope.endDate : new Date(myDimension.top(1)[0].date);
  	  		 
  	  daysBetween = ($scope.endDate - $scope.startDate)/(1000*60*60*24) 
  	  
  	  var tempDomain = d3.scale.linear().domain([$scope.startDate,$scope.endDate]);
  	  
  	  return tempDomain;
    };
    
    var parse = d3.time.format("%m/%d/%Y").parse; // parses out the date object from the string
    var displayDate; // function to change the format of a date object to mm-yyyy;
    	
    var ndx = crossfilter(energyData)
    
    var myDomain, 
        myDimension = ndx.dimension(function(d) { return d3.time.day(parse(d.date));}),
        actualGroup,
        expectedGroup,
        savingsGroup,
        savingsSum,
        myXUnits,
        totalSum
    ;
    	
    var windowSize = $window.innerWidth;
    
    $scope.window = $window.innerWidth;
    
    $scope.log = function() {
  	  console.log($scope);
  	};
  	  		  
  	$scope.redraw = function(){
  	  $scope.setParams();
  	  compositeChart();
  	};
  	  	
  	$scope.$watch(
      function(){return $window.innerWidth;},
      function(value){
    	  if(value*1.1 <= windowSize || value*0.9 >= windowSize){
    		  windowSize = value;
    		  $scope.redraw();  
    	  };
      }
  	);
  	
  	var withinDate = function(d){
  		if(new Date(parse(d.date)) >= $scope.startDate && new Date(parse(d.date)) <= $scope.endDate){
  			return true;
  		}
  		else{
  			return false;
  		}
  	}
  	
  	$scope.setParams = function(){
  		w = $window.innerWidth*0.9 - 50;
  		h = w*.5;
  		lX = (w-150);
  		lY = (25);
  		
  		if(h > $window.innerHeight){
  			h = $window.innerHeight - 250;
  		}
  			
  		myDomain = getDomain();

  		if(daysBetween <= 30){
  			myDimension = ndx.dimension(function(d) { return d3.time.day(parse(d.date));})
  			myXUnits = d3.time.days;
  		    displayDate= d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  		}
  		else if(daysBetween <= (180)){
  			myDimension = ndx.dimension(function(d) { return d3.time.week(parse(d.date));})
  			myXUnits = d3.time.weeks;
  			displayDate= d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  		}
  		else{
  			myDimension = ndx.dimension(function(d) { return d3.time.month(parse(d.date));})
  			myXUnits = d3.time.months;
  			displayDate = d3.time.format("%m-%y"); // function to change the format of a date object to mm-yyyy
  		}
  		
  		actualGroup = myDimension.group().reduceSum(function(d) { if(withinDate(d)){return d.actualKWH;}})
  	    expectedGroup = myDimension.group().reduceSum(function(e) { if(withinDate(e)){return +e.expectedKWH;}}) // same as above with expectedKWH
  	    savingsGroup = myDimension.group().reduceSum(function(e) { if(withinDate(e)){return +e.savings;}}) // same as above with savings
  			
  		savingsSum = myDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
  		  function(p,v) {if(withinDate(v)){totalSum = (+v.savings) + totalSum;return totalSum;}}, // sets the method for adding an entry into the total
          function(p,v) {if(withinDate(v)){totalSum = totalSum-(+v.savings);return totalSum;}}, // sets the method for removing an entry from the total
          function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
  		);
  	    
	    if(compositeChart !== undefined){
	      compositeChart();
	    }
  	};
  	
    var w, // sets the width, height, margin, legend X and legend Y values
        h,
    	m = [75,150],
    	lX,
    	lY
    ;
    
    $scope.setParams();
           
    var compositeChart = function(){
    	
      var areaChart = dc.lineChart(composite)
          .dimension(myDimension) // use the date dimension for the objects
          .colors('gray')
          .group(savingsSum, "Total Savings/Waste") // use the savings group for the grouped values
          .renderArea(true)
          .interpolate('cardinal')
          .tension(0.5)
          .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
      ;
      
      var barChart = dc.barChart(composite) // creates the bar chart
          .dimension(myDimension) // use the date Dimension for the objects
          .colors('cyan')
          .group(savingsGroup, "Savings")// use the savings group for the grouped values
          .centerBar(true)
          .barPadding(0.5)
      ;
      
      barChart.renderlet(function(_bar){
    	  console.log(_bar);
    	  _bar.selectAll("rect.bar").on("click", console.log("clicked bar"));
      });
      
      var actualChart = dc.lineChart(composite)
          .dimension(myDimension) // use the date dimension for the objects
          .colors('blue')
          .group(actualGroup, "Actual KWH")// use the savings group for the grouped values
          .interpolate('cardinal')
          .tension(0.5)
          .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
      ;
      
      var expectedChart = dc.lineChart(composite)
          .dimension(myDimension) // use the date dimension for the objects
          .colors('red')
          .group(expectedGroup, "Expected KWH")  // use the savings group for the grouped values
          .interpolate('cardinal')
          .tension(0.5)
          .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
      ;
    	
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
              areaChart,
              barChart,
              actualChart, 
              expectedChart
              ])
            .brushOn(false) // disables the fiddle/violin selection tool
          ;

          composite.margins().left = m[0]; // sets the left margin for the composite chart
          composite.margins().right = m[1]; // sets the right margin for the composite chart
          
          composite.xAxis().tickFormat(function(v) {return displayDate(new Date(v));}); // sets the tick format to be the month/year only

          composite.renderlet(function(_chart){ // this provides the functionality for an on click check for the composite chart focusing on the bar graphs (or any drawn rectangles)
        	  _chart.selectAll("rect.bar").on("click",function(_bar){
       	    	var allEntries = _chart.selectAll("rect.bar")[0];
        	    	        	    	        	    	
        	    for(var i=0; i< allEntries.length; i++){
        	      var entry = allEntries[i];

        	      var barDate = new Date(_bar.x),
        	    	  arrayItemDate = new Date(entry.__data__.x)
        	      ;
        	    		
        	      if( +barDate === +arrayItemDate){
        	      if(allEntries[i-1] !== undefined){
        	   		var date = new Date(allEntries[i-1].textContent);
        	  		$scope.startDate = date;
          		  }
            	  else{
       	    		var date = new Date(allEntries[i].textContent);
       		  		$scope.startDate = date;
       	    	  }
        	    			
       	    	  if(allEntries[i+1] !== undefined){
       	    		var date = new Date(allEntries[i+1].textContent);
       		  		$scope.endDate = date;
       	    	  }
       	          else{
       	    		var date = new Date(allEntries[i].textContent);
       		  		$scope.endDate = date;
       	          }
       	    			
       	    	  $scope.redraw();
       	    	}
       	      }
       	    })
          });
          
          composite.render();
      };

      compositeChart();
  
      //dc.renderAll();;
      $scope.$apply() // no idea
    })
}])
.directive('resize', function ($window) {
	return function (scope, element, attr) {
	    var w = angular.element($window);
	    scope.$watch(function () {
	        return {
	            'h': window.innerHeight, 
	            'w': window.innerWidth
	        };
	    }, function (newValue, oldValue) {
	        scope.windowHeight = newValue.h;
	        scope.windowWidth = newValue.w;
	
	        scope.resizeWithOffset = function (offsetH) {
	            scope.$eval(attr.notifier);
	            return { 
	                'height': (newValue.h - offsetH) + 'px'                    
	            };
	        };
	    }, 
	    true);
	    
	    w.bind('resize', function () {
	        scope.$apply();
	    });
	}
})
;