'use strict';
 
angular.module('myApp.energyProfile', ['ngRoute'])

.factory('energyProfileDataService', ['$http', function($http){
	var _servObj = {};	
	var _dataArr = [];

	
	var _setUrl = function(url){
		_url = url;

		return _servObj;
	}
	
	var _getUrl = function(){
		return _url;
	}
	
	//get data and format it as cal-heatmap expects 
	//TODO - data obj does not need to be refereshed every time we want to get???
	//can we re-serve from memory if we dont believe anthing has changed???
	var _getData = function(){ 
		return $http.get('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595').
		success(function(data){
				_dataArr = data.his;
				console.log(_dataArr);
				console.log('success????');
			}).
		error(function(data){
			console.log('error???');
			throw('there was problem getting data');
		});
	}
	
	_servObj = {
		getUrl : _getUrl,
		setUrl: _setUrl,
		getData : _getData,
		dataObj : _dataArr
	}
	
	return _servObj;
	
}])
.controller('energyProfileCtrl', ['$scope', '$location', '$route', 'energyProfileDataService',
                    function($scope, $location, $route, dataService) {
	$scope.something = 'energyProfile';
	dataService.getData().then( function(data) {
		console.log(dataService.dataObj);
        var ndx = crossfilter(data.data.his);
        $scope.runDimension  = ndx.dimension(function(d) {return "run-"+d.timestamp;});
        $scope.barDimension = ndx.dimension(function(d) {return +d.timestamp;});
        $scope.speedSumGroup = $scope.runDimension.group().reduceSum(function(d) {return d.value*d.value;});
        
        console.log([$scope.barDimension.bottom(1)[0], $scope.barDimension.top(1)[0]]);
        $scope.domainX = function () { 
        	return d3.scale.linear()
        		.domain([$scope.barDimension.bottom(1)[0].timestamp, $scope.barDimension.top(1)[0].timestamp]); 
        	};
        
        $scope.barGroup = $scope.barDimension.group().reduceSum(function(d) {return +d.value;});
		// for simplicity we use d3.csv, but normally, we should use $http in order for this
		// to be called in the $digest
        $scope.barGroupTwo = $scope.barDimension.group().reduceSum(function(d) {return +d.value/2;});
        
        var composite = dc.compositeChart("#test_composed");
        d3.select(".dc-chart");
       
        composite
        .width(768)
        .height(480)
        .x($scope.domainX())
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
    });
}]);