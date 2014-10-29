'use strict';
 
angular.module('myApp.energyProfile', ['ngRoute'])

.factory('energyProfileDataService', ['$http', function($http){
	var _servObj = {};
	var _dataArr = [];
	var ndx;
	var dimensions = {};
	var groups = {};
	var monthNumber = d3.time.format("%m").parse;
	
	var _setUrl = function(url){
		_url = url;

		return _servObj;
	};
	
	var _getUrl = function(){
		return _url;
	};
	
	//get data and format it as cal-heatmap expects 
	//TODO - data obj does not need to be refereshed every time we want to get???
	//can we re-serve from memory if we dont believe anthing has changed???
	var _getData = function(){ 
		return $http.get('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595').
		success(successHandler).
		error(errorHandler);
	};
	var successHandler = function(data) {
		_dataArr = data.his;
		
		ndx = crossfilter(_dataArr);
		//dimensions.dateDimension = ndx.dimension(function(d) { return parse(d.date).getMonth()+1;});
		dimensions.dateDimension = ndx.dimension(function(d) { 
			return d.timestamp;
		});
		
		//how it should be
		//groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.actualKWH;});
		//groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.expectedKWH;});
		//groups.savingsGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.savings;});
		
		groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return d.value*.85;});
		groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return d.value;});
		groups.savingsGroup = dimensions.dateDimension.group().reduceSum(function(d) { return d.value*.15;});
		groups.cumulativeSavingsGroup = groups.savingsGroup;
		
		console.log('success????');
	};
	
	var errorHandler = function(data){
		console.log('error???');
		throw('there was problem getting data');
	};
	
	var _csvInit = function (energyData) {
			_dataArr = energyData;
			
			var parse = d3.time.format("%m/%d/%Y").parse;
	        var totalSum = 0;

			ndx = crossfilter(_dataArr);
			
			dimensions.dateDimension = ndx.dimension(function(d) { return parse(d.date).getMonth()+1;});
			
			groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.actualKWH; });
			groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.expectedKWH; });
			groups.savingsGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.savings; });
			groups.cumulativeSavingsGroup = dimensions.dateDimension.group().reduceSum (
					function(e) { 
						totalSum = totalSum+(+e.savings);  
						return totalSum;
						}
					);
			console.log("Dummy Data!");
	};
	
	var _getDateDimension = function () {
		return dimensions.dateDimension;
	};
	
	var _getActualGroup = function () {
		return groups.actualGroup;
	};
	var _getExpectedGroup = function () {
		return groups.expectedGroup;
	};
	var _getSavingsGroup = function () {
		return groups.savingsGroup;
	};
	var _getCumulativeSavingsGroup = function() {
		return groups.cumulativeSavingsGroup;
	}
	
	_servObj = {
		getUrl : _getUrl,
		setUrl: _setUrl,
		getData : _getData,
		dataArr : function () { return _dataArr; },
		getDateDimension : _getDateDimension,
		getExpectedGroup : _getExpectedGroup,
		getActualGroup : _getActualGroup,
		getSavingsGroup : _getSavingsGroup,
		getCumulativeSavingsGroup : _getCumulativeSavingsGroup,
		csvInit : _csvInit
	};
	
	return _servObj;
	
}])
.controller('energyProfileCtrl', ['$scope', '$location', '$route', 'energyProfileDataService',
                    function($scope, $location, $route, dataService) {
	$scope.timeSeries = 'energyProfile';
	var composite; //variable that stores the composite chart generated by program
	//populated by drawChart
	
	var drawChart = function () {
		var composite = dc.compositeChart("#test_composed");
	    
	    composite.margins().left = 75;
	    
	    console.log(dc.lineChart(composite));
	    
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
	            .group($scope.savingsGroup, "Savings"),
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
	            .interpolate("basis")
	            .colors('gray')
	            .group($scope.savingsSum, "Total Savings/Waste")
	            .renderArea(true)
	        ])
	    .brushOn(false)
	    .render();
	    
	    $scope.$apply();
	    
	    return composite;
	};
	
	var http = function(data) {
		
        $scope.dateDimension  = dataService.getDateDimension();
        
        $scope.actualGroup = dataService.getActualGroup();
        $scope.expectedGroup = dataService.getExpectedGroup();
        $scope.savingsGroup = dataService.getSavingsGroup();
        
        $scope.savingsSum = dataService.getCumulativeSavingsGroup();
       // console.log([$scope.dateDimension.bottom(1)[0], $scope.dateDimension.top(1)[0]]);
        
        //$scope.domainX = function () { 
        //	return d3.scale.linear()
        //		.domain([$scope.dateDimension.bottom(1)[0].timestamp, $scope.dateDimension.top(1)[0].timestamp]); 
        //	};
        composite = drawChart();
    };
    
	var csv = function (data) {
		d3.csv("expectedActual.csv", function(error, energyData) {
	    	dataService.csvInit(energyData);
	    	console.log(dataService.dataArr());
	    	
	    	$scope.dateDimension  = dataService.getDateDimension();
	        
	        $scope.actualGroup = dataService.getActualGroup();
	        $scope.expectedGroup = dataService.getExpectedGroup();
	        $scope.savingsGroup = dataService.getSavingsGroup();
	        
	        $scope.savingsSum = dataService.getCumulativeSavingsGroup();
	        
	        $scope.domainX = function () { return d3.scale.linear().domain([0,12]); } // 12 months in a year.  make this adjustable to fit the possibility of a dynamically changing view
	        composite = drawChart();
	    });
	};
	
	dataService.getData().then( http, csv );
	//csv();
}]);