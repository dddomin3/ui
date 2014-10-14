'use strict';
 
angular.module('myApp.zoomHeatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/zoomHeatmap', {
    templateUrl: 'views/zoomHeatmap.html',
    controller: 'zoomHeatmapCtrl'
  });
}])
 
.controller('zoomHeatmapCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.rawTime = +$routeParams.time;
	$scope.timestamp = new Date(+$routeParams.time).toString();
}]);