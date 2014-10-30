'use strict';
 
angular.module('myApp.timeSeries', ['ngRoute'])

.controller('timeSeriesCtrl', ['$scope', '$location', '$route', 
                    function($scope, $location, $route) {
	$scope.timeSeries = 'timeSeries';
    d3.csv("expectedActual.csv", function(error, energyData) {
    	
    	var parse = d3.time.format("%m/%d/%Y").parse;
    	
        var ndx = crossfilter(energyData)
        
        var totalSum = 0;
        
        $scope.dateDimension = ndx.dimension(function(d) { return parse(d.date).getMonth()+1;})
        
        $scope.actualGroup = $scope.dateDimension.group().reduceSum(function(d) { return d.actualKWH;})
        $scope.expectedGroup = $scope.dateDimension.group().reduceSum(function(e) { return +e.expectedKWH;})
        $scope.savingsGroup = $scope.dateDimension.group().reduceSum(function(e) { return +e.savings;})

        $scope.savingsSum = $scope.dateDimension.group().reduce(
        		function(p,v) {totalSum = (+v.savings) + totalSum;  return totalSum;},
        		function(p,v) {totalSum = totalSum-(+v.savings); return totalSum;},
        		function() {totalSum = 0; return totalSum;}	
        );
        
        $scope.domainX = function () { return d3.scale.linear().domain([0,12]); } // 12 months in a year.  make this adjustable to fit the possibility of a dynamically changing view
        
        var composite = dc.compositeChart("#test_composed");
        d3.select(".dc-chart");
            
        composite.margins().left = 75;
                
        composite
          .width(750)
          .height(680)
          .x(d3.scale.linear().domain([1,12]))
          .elasticX(true)
          .elasticY(true)
          .yAxisLabel("The Y Axis")
          .legend(dc.legend().x(600).y(25).itemHeight(13).gap(5))
          .renderHorizontalGridLines(true)
          .mouseZoomable(true)
        .compose([
            dc.barChart(composite)
                .dimension($scope.dateDimension)
                .colors('cyan')
                .group($scope.savingsGroup, "Savings")
                .centerBar(true),
            dc.lineChart(composite)
                .dimension($scope.dateDimension)
                .interpolate("basis")
                .colors('blue')
                .group($scope.actualGroup, "Actual KWH"),
             dc.lineChart(composite)
                .dimension($scope.dateDimension)
                .interpolate("basis")
                .colors('red')
                .group($scope.expectedGroup, "Expected KWH"),
            dc.lineChart(composite)
                .dimension($scope.dateDimension)
                .colors('gray')
                .interpolate("basis")
                .group($scope.savingsSum, "Total Savings/Waste")
                .renderArea(true)
            ])
        .brushOn(false)
        .render();
        
        $scope.$apply()
    });
}]);