'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html',
    controller: 'heatmapCtrl'
  });
}])
 
.controller('heatmapCtrl', ['$scope', '$window', function($scope, $window) {
	$scope.heatmapConfig = {
		onClick:function(date, value){
			console.log(date.getTime());
			console.log(value);
			
			$window.location.href = '/app/#/zoomHeatmap?time='+date.getTime();
			$window.location.reload();},
		domain: 'day',
		subDomain: 'hour',
		range: 30,	//number of domains (days in current implementation)
		cellSize: 20, //px size of cells
		cellPadding: 1,	//px between cells
		cellRadius: 2,	//px of cell radius
		domainGutter: 0, //px padding between dates
		colLimit: 1, //number of colums per domain
		legend: [0,1,2,3,4,5,6,7,8,9,10,11,12],	//legend. Remember its like actually the count
												//TODO: make this change dependant on dataset
		legendVerticalPosition: "center",
		legendHorizontalPosition: "right",
		legendOrientation: "vertical",
		legendMargin: [10, 10, 10, 10],
		legendColors: ['#00FF00', '#FF0000'],	//colors of legend gradient
		subDomainTextFormat: '%H', /*function(date, value) {
			if (date.getMinutes() === 0) {
				return date.getHours();
			}
			else return date.getMinutes();
		},*/
		domainLabelFormat: function(date) {//format of each domain label. "x axis" labels
			var month = 
				["Jan", "Feb", "Mar", "Apr",
				 "May", "Jun", "Jul", "Aug",
				 "Sep", "Oct", "Nov", "Dec"];
			if (date.getDate() % 2 === 0) {
				return date.getDate();
			}
			else {
				return month[date.getMonth()];
			}
		},	
		label: {
			width: 30,
			position: 'bottom'
			//rotate: 'left' doesn't work if position is bottom!
		}
	};
	console.log($scope.heatmapConfig);
	
	$scope.onClick = function(date, value){
		console.log(date.getTime());
		console.log(value);
		
		$window.location.href = '/app/#/zoomHeatmap?time='+date.getTime();
		$window.location.reload();
	};

}]);