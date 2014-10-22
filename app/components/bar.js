'use strict';
 
angular.module('myApp.bar', ['ngRoute'])
.service('barService',['$timeout', function($timeout) {
		   var currentID = 0;
		   var self = this;
		   //this function simulates a 2 second delay from getting information from the server
		   //this function should be called when no data is given to the bar chart, so as to 
		   //visualize configuration details
		   //returns a promise
		   this._getDefaultBarData = function () {  
			   return $timeout(function() {
				   return [
	                  {name: "Locke",    value:  4},
	                  {name: "Reyes",    value:  8},
	                  {name: "Ford",     value: 15},
	                  {name: "Jarrah",   value: 16},
	                  {name: "Shephard", value: 23},
	                  {name: "Kwon",     value: 42}
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
		   }
		   
		   //this function should get a new ID, and also initialize heatmapConfig for the current ID		
		   //it also initializes the configuration details based upon the attributes fed into the function.
		   this.initHeatmap = function (attrs) {
		       self[currentID] = {};
		       if (0) { //if statement should parse attrs object, and determine where to grab data from
		       }
		       else { //if the data location is undefined, or not mentioned
		    	   self[currentID].barData = self._getDefaultBarData();
		       }
		       
		       self[currentID].barScale = self._initBarScale(currentID, attrs);	//init
		       
		       return currentID++;
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
}])

.controller('barCtrl', ['$scope', 'barService',
                    function($scope, barService) {
	$scope.barID = barService.initHeatmap();
	var barWidth;
	$scope.loading = "Now Loading...";
	
	barService.getBarData($scope.barID).then( function(data) {
		$scope.loading = '';
		$scope.barData = data;
		console.log(data);
		barWidth = barService.getBarWidth($scope.barID, {});
		d3.select(".chart")
		  .selectAll("div")
		    .data($scope.barData)
		  .enter().append("div")
		    .style("width", barWidth)
		    .text(function(d) { return d.name; });
	}, function() { alert('oops');});
	
}]);