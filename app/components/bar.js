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
		       if (0) { //if statement should parse attrs object, and determine where to grab data from
		       }
		       else { //if the data location is undefined, or not mentioned
		    	   self[id].barData = self._getDefaultBarData();
		    	   self[id].barData.then(
		    			   function (data) {self._calculateDataRanges(data, id);},
		    			   function (data) {alert('oops2');}
    			   );
		       }
		       self[id].barScale = self._initBarScale(id, attrs);	//init
		       
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
}])

.controller('barCtrl', ['$scope', 'barService',
                    function($scope, barService) {
	$scope.barID = barService.initHeatmap();
	var barWidth;
	$scope.loading = "Now Loading...";
	
	barService.getBarData($scope.barID).then( function(data) {
		$scope.loading = '';
		$scope.barData = data;
		
		barWidth = barService.getBarWidth($scope.barID, {});
		d3.select(".chart")
		  .selectAll("div")
		    .data($scope.barData)
		  .enter().append("div")
		    .style("width", barWidth)
		    .text(function(d) { return d.name; });
		console.log(barService[$scope.barID]);
		
	}, function() { alert('oops');});
	
}]);