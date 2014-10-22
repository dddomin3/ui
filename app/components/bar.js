'use strict';
 
angular.module('myApp.bar', ['ngRoute'])

.controller('barCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService',
                    function($scope, $location, $route, zoomHeatmapService, persistHeatmapService) {
	$scope.bar = 'bar';
}]);