'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService',
                    function($scope, $location, $route, zoomHeatmapService, persistHeatmapService) {
	$scope.timeSeries = 'timeSeries';
}]);