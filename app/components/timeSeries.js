'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService',
                    function($scope, $location, $route, zoomHeatmapService, persistHeatmapService) {
	$scope.timeSeries = 'timeSeries';
    d3.csv("morley.csv", function(error, experiments) {
        var ndx = crossfilter(experiments)
        $scope.runDimension  = ndx.dimension(function(d) {return "run-"+d.Run;})
        $scope.speedSumGroup = $scope.runDimension.group().reduceSum(function(d) {return d.Speed * d.Run;});
		// for simplicity we use d3.csv, but normally, we should use $http in order for this
		// to be called in the $digest
        $scope.$apply()
    });
}]);