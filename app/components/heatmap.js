'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html',
    controller: 'heatmapCtrl'
  });
}])
 
.controller('heatmapCtrl', ['$scope', function($scope) {
	$scope.onClick = function(date, value){
		console.log(date);
		console.log(value);
	}

}]);