'use strict';
 
angular.module('myApp.bar', ['ngRoute'])
.service('barService', function() {
		   var currentID = 0;
		   var self = this;
		   //this function should get a new ID, and also initialize heatmapConfig for the current ID
		   this._getDefaultBarData = function () {
			   return [4, 8, 15, 16, 23, 42];
		   };
		   this._initBarScale = function (id, attrs) { 
			   //this function should generate the scale function for the bar chart
			   //depending on attrs
			   if (1) {
				   return function(d) { return d * 10 + "px"; };
			   }
			   else
			   {
				   return 0;
			   }
		   }
		   
		   this.initHeatmap = function (attrs) {
		       self[currentID] = {};
		       self[currentID].barData = self._getDefaultBarData();
		       self[currentID].barScale = self._initBarScale(currentID, attrs);	//init
		       
		       return currentID++;
		   };
		   
		   this.getBarData = function (id) {
		       return self[id].barData;
		   };
		   this.setBarData = function (id, data) {
			   self[id].barData = data;
			   return self[id].barData;
		   }
		   this.getBarWidth = function (id) {
			   return self[id].barScale;
		   }
})

.controller('barCtrl', ['$scope', 'barService',
                    function($scope, barService) {
	$scope.barID = barService.initHeatmap();
	$scope.barData = barService.getBarData($scope.barID);
	
	var barWidth = barService.getBarWidth($scope.barID, {});
	
	d3.select(".chart")
	  .selectAll("div")
	    .data($scope.barData)
	  .enter().append("div")
	    .style("width", barWidth)
	    .text(function(d) { return d; });
	
}]);