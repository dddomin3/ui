'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService',
                    function($scope, $location, $route, zoomHeatmapService, persistHeatmapService) {
	$scope.timeSeries = 'timeSeries';
    d3.csv("morley.csv", function(error, experiments) {
        var ndx = crossfilter(experiments)
        $scope.runDimension  = ndx.dimension(function(d) {return "run-"+d.Run;})
        $scope.speedSumGroup = $scope.runDimension.group().reduceSum(function(d) {return d.Speed * d.Run;});
        
        $scope.domainX = function () { return d3.scale.linear().domain([0,21]); }
        
        $scope.barDimension = ndx.dimension(function(d) {return +d.Run;});
        $scope.barGroup = $scope.barDimension.group().reduceSum(function(d) {return d.Speed;});
		// for simplicity we use d3.csv, but normally, we should use $http in order for this
		// to be called in the $digest
        $scope.barGroupTwo = $scope.barDimension.group().reduceSum(function(d) {return d.Speed/2;});
        
        var composite = dc.compositeChart("#test_composed");
        d3.select(".dc-chart");
       
        composite
        .width(768)
        .height(480)
        .x(d3.scale.linear().domain([0,20]))
        .yAxisLabel("The Y Axis")
        .legend(dc.legend().x(0).y(25).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .compose([
            dc.barChart(composite)
                .dimension($scope.barDimension)
                .colors('red')
                .group($scope.barGroup, "Bar"),
            dc.lineChart(composite)
                .dimension($scope.barDimension)
                .colors('blue')
                .group($scope.barGroup, "Top Line")
                .dashStyle([5,5]),
            dc.lineChart(composite)
                .dimension($scope.barDimension)
                .colors('cyan')
                .group($scope.barGroupTwo, "Bottom Line")
                .dashStyle([2,2])
                .renderArea('true')
            ])
        .brushOn(false)
        .render();
        
        $scope.$apply()
    });
}]);