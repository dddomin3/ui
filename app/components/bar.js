'use strict';
 
angular.module('myApp.bar', ['ngRoute'])
.service('barService',['$timeout', function($timeout) {
		   var currentID = 0;
		   var self = this;
		   var defaultChartParallel = 400;
		   var defaultChartPerpendicular = 600;
		   var defaultBarStyle = {'fill': "cyan"};
		   var defaultTextStyle = {
					  'fill': 'black',
					  'font': '10px sans-serif',
					  'text-anchor': 'end'
				  };
		   
		   //this function simulates a 2 second delay from getting information from the server
		   //this function should be called when no data is given to the bar chart, so as to 
		   //visualize configuration details
		   //returns a promise
		   this._getDefaultBarData = function () {  
			   return $timeout(function() {
				   return [
						{name: "Ford",     value: 15},
						{name: "Jarrah",   value: 16},
						{name: "Locke",    value:  4},
						{name: "Reyes",    value:  8},
						{name: "Shephard", value: 23},
						{name: "Kwon",     value: 49}
	                ];
				   }, 2000);	//2000 ms = 2 seconds
		   };
		   
		   this._initBarScale = function (id, attrs) { 
		   //this function should generate the scale function for the bar chart
		   //depending on attrs. maybe data as well?
			   if (1) {
				   return function(d) { return d.value * 10 + "px"; };
			   }
			   else
			   {
				   return 0;
			   }
		   };
		   
		   this._calculateDataRanges = function (data, id) {
		   //this function should calculate the mins and maxes of the dataset. Useful for things like scaling
			   var sortedData = data.slice(0);	//clones array
			   sortedData.sort(function(a, b){return a.value-b.value});
			   console.log('calcing data ranges');
			   console.log(sortedData);
			   self[id].max = sortedData[sortedData.length - 1].value;
			   self[id].min = sortedData[0].value;
			   return {
				   max: sortedData[sortedData.length - 1].value,
				   min: sortedData[0].value, 
			   };
		   };
		   
		   //this function should get a new ID, and also initialize heatmapConfig for the current ID		
		   //it also initializes the configuration details based upon the attributes fed into the function.
		   this.initHeatmap = function (attrs) {
			   var id = currentID++;
		       self[id] = {};
		       self[id].barStyle = attrs.barStyle ? attrs.barStyle : defaultChartColor;
		       self[id].textStyle = attrs.textStyle ? attrs.textStyle : defaultTextStyle;
		       
		       if (0) { //if statement should parse attrs object, and determine where to grab data from
		    	   var dataURL = attrs.dataSource;
		    	   dataURL.getData();
		       }
		       else { //if the data location is undefined, or not mentioned
		    	   self[id].barData = self._getDefaultBarData();
		    	   self[id].barData.then(
		    			   function (data) {
		    				   var range = self._calculateDataRanges(data, id);
		    			   },
		    			   function (error) {alert('oops2');}
    			   );
		       }
		       if(attrs.rotate === 'y') {
		    	   self[id].height = attrs.height ? attr.height : defaultChartPerpendicular;
		    	   self[id].width = attrs.width ? attr.width : defaultChartParallel;
		       }
		       else {
		    	   attrs.rotate = 'x';
		    	   self[id].height = attrs.height ? attrs.height : defaultChartParallel;
		    	   self[id].width = attrs.width ? attrs.width : defaultChartPerpendicular;
		       }
		       
		       return id;
		   };
		   
		   //discrete getters and setters
		   //require id in order to correctly serve/reference the controller/chart instance
		   this.getBarData = function (id) {
		       return self[id].barData;
		   };
		   this.setBarData = function (id, data) {
		   //this may have the ability to alter data on server-side...
			   //currently jsut alters the $scope data.
			   self[id].barData = data;
			   return self[id].barData;
		   };
		   this.getBarWidth = function (id) {
			   return self[id].barScale;
		   };
		   this.getMax = function (id) {return self[id].max};
		   this.getMin = function (id) {return self[id].min};
		   this.getHeight = function(id) {return self[id].height};
		   this.getWidth = function(id) {return self[id].width};
		   this.getBarStyle = function(id) {return self[id].barStyle};
		   this.getTextStyle = function(id) {return self[id].textStyle};
}])

.controller('barCtrl', ['$scope', 'barService',
                    function($scope, barService) {
	var attrs = {
			'rotate': 'y',
			'barStyle': {
				'fill':'steelblue'
			},
			'textStyle': {
				'fill': 'cyan',
				'font': '10px sans-serif',
				'text-anchor': 'end'
			}
	}; //USER CONFIGURABLE DETAILS
	$scope.barID = barService.initHeatmap(attrs);
	var id = $scope.barID;
	$scope.loading = "Now Loading...";
	
	barService.getBarData(id).then( function(data) {
		$scope.loading = '';
		$scope.barData = data;
		console.log(barService[id]);
		if(attrs.rotate === 'x') {
			var width = barService.getWidth(id),
			    height = barService.getHeight(id),
			    dataLength = data.length,
			    barThickness = height/dataLength;
	
			var x = d3.scale.linear()
			    .domain([0, barService.getMax(id)])
			    .range([0, width]);
	
			var chart = d3.select(".chart")
			    .attr("width", width)
			    .attr("height", height);
	
			var bar = chart.selectAll("g")
			    .data(data)
			  .enter().append("g")
			    .attr("transform", function(d, i) { return "translate(0," + i * barThickness + ")"; });
	
			 bar.append("rect")
			  .style(barService.getBarStyle(id))
		      .attr("width", function(d) { return x(d.value); })
		      .attr("height", barThickness - 1);
			 
	
			bar.append("text")
		  	    .style(barService.getTextStyle(id))
			    .attr("x", function(d) { return x(d.value) - 3; })
			    .attr("y", barThickness / 2)
			    .attr("dy", ".35em")
			    .text(function(d) { return d.value; });
		}
		else {
			var width = barService.getWidth(id),
		    height = barService.getHeight(id),
		    dataLength = data.length,
		    barThickness = width/dataLength;

			var y = d3.scale.linear()
			    .range([height, 0]);
		
			var chart = d3.select(".chart")
			    .attr("width", width)
			    .attr("height", height);
		
		  y.domain([0, d3.max(data, function(d) { return d.value; })]);
	
		  var bar = chart.selectAll("g")
		      .data(data)
		    .enter().append("g")
		      .attr("transform", function(d, i) { return "translate(" + i * barThickness + ",0)"; });
	
		  bar.append("rect")
		  	  .style(barService.getBarStyle(id))
		      .attr("y", function(d) { return y(d.value); })
		      .attr("height", function(d) { return height - y(d.value); })
		      .attr("width", barThickness - 1);
	
		  bar.append("text")
		  	  .style(barService.getTextStyle(id))
		      .attr("x", barThickness / 2)
		      .attr("y", function(d) { return y(d.value) + 3; })
		      .attr("dy", ".75em")
		      .text(function(d) { return d.value; });
		}
	}, function(error) { alert('oops');});
	
}]);