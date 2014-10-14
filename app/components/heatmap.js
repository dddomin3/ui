'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html',
    controller: 'heatmapCtrl'
  });
}])
 
.controller('heatmapCtrl', ['$scope', '$window', function($scope, $window) {
	$scope.onClick = function(date, value){
		console.log(date.getTime());
		console.log(value);
		
		$window.location.href = '/app/#/zoomHeatmap?time='+date.getTime();
		$window.location.reload();
	}

}]);