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
		console.log(data.his[0].timestamp);
		var ddate = new Date(data.his[0].timestamp);
		console.log( (new Date(data.his[0].timestamp)).getDate() );
		ndx = crossfilter(_dataArr);
		//dimensions.dateDimension = ndx.dimension(function(d) { return parse(d.date).getMonth()+1;});
		dimensions.dateDimension = ndx.dimension(function(d) { 
			return (new Date(d.timestamp)).getHours();
			
		});
		
		//how it should be
		//groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.actualKWH;});
		//groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.expectedKWH;});
		//groups.savingsGroup = dimensions.dateDimension.group().reduceSum(function(d) { return +d.savings;});
		var totalSum = 0;
		groups.savingsGroups = [];
		
		groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return d.value*.85;});
		groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return d.value;});
		groups.savingsGroups[0] = dimensions.dateDimension.group().reduceSum(function(d) { return d.value*.15;});
		groups.cumulativeSavingsGroup = dimensions.dateDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
        		function(p,v) {totalSum = (v.value*.15) + totalSum;  return totalSum;}, // sets the method for adding an entry into the total
        		function(p,v) {totalSum = totalSum-(v.value*.15); return totalSum;}, // sets the method for removing an entry from the total
        		function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
        );
		
		console.log('success????');
	};
	
	var errorHandler = function(data){
		console.log('error???');
		throw('there was problem getting data');
	};
	
	var _csvInit = function (energyData, doubleize) {
			_dataArr = energyData;
			var multi = 1;
			if(doubleize) {
				multi = 2;
			}
			var parse = d3.time.format("%m/%d/%Y").parse;
	        var totalSum = 0;
	        groups.savingsGroups = [];
	        
			ndx = crossfilter(_dataArr);
			
			dimensions.dateDimension = ndx.dimension(function(d) { return parse(d.date).getMonth()+1; });
			
			groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.actualKWH; });
			groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.expectedKWH; });
			groups.savingsGroups[0] = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.savings; });
			groups.savingsGroups[multi-1] = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.savings; });
			
			groups.cumulativeSavingsGroup = dimensions.dateDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
	        		function(p,v) {totalSum = (multi*v.savings) + totalSum;  return totalSum;}, // sets the method for adding an entry into the total
	        		function(p,v) {totalSum = totalSum-(multi*v.savings); return totalSum;}, // sets the method for removing an entry from the total
	        		function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
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
		return groups.savingsGroups[0];
	};
	var _getSavingsGroups = function () {
		return groups.savingsGroups;
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
		getSavingsGroups : _getSavingsGroups,
		getCumulativeSavingsGroup : _getCumulativeSavingsGroup,
		csvInit : _csvInit
	};
	
	return _servObj;
	
}])
.controller('energyProfileCtrl', ['$scope', '$location', '$route', 'energyProfileDataService',
                    function($scope, $location, $route, dataService) {
	$scope.timeSeries = 'energyProfile';
	$scope.showButtons = true;
	$scope.chartInit = false;
	$scope.userParameters = {
			savingsColor : 'cyan',
			actualColor : 'blue',
			expectedColor : 'red',
			cumulativeColor : "gray",
			width: 750,
			height: 680
	};
	
	var composite; //variable that stores the composite chart generated by program
	//populated by drawChart
	
	var drawChart = function () {
		composite = dc.compositeChart("#test_composed");
		var cumulativeArea = dc.lineChart(composite)
		    .dimension($scope.dateDimension)
		    .interpolate("basis")
		    .colors($scope.userParameters.cumulativeColor)
		    .group($scope.savingsSum, "Total Savings/Waste")
		    .renderArea(true);
		var actualLine = dc.lineChart(composite)
	        .dimension($scope.dateDimension)
	        .interpolate("basis")
	        .colors($scope.userParameters.actualColor)
	        .group($scope.actualGroup, "Actual KWH");
		var expectedLine = dc.lineChart(composite)
	        .dimension($scope.dateDimension)
	        .interpolate("basis")
	        .colors($scope.userParameters.expectedColor)
	        .group($scope.expectedGroup, "Expected KWH");
		var savingsBar = dc.barChart(composite)
	        .dimension($scope.dateDimension)
	        .group($scope.savingsGroup[0], "Savings")
	        .ordinalColors([$scope.userParameters.savingsColor, 'rgba(255,0,0,0.3)']);
		
		var ranger = dc.barChart("#ranger")
	        .dimension($scope.dateDimension)
	        .group($scope.savingsGroup[0], "Savings")
	        .ordinalColors([$scope.userParameters.savingsColor, 'rgba(255,0,0,0.3)'])
	        .x($scope.domainX);
		
		
		for (var i = 1, len = $scope.savingsGroup.length; i < len; i++) {
			savingsBar = savingsBar.stack($scope.savingsGroup[i], "Savings"+i); //TODO:these should hav emore meaningful names
		}
		
	    composite.margins().left = 75;
	    
	    composite
	      .width($scope.userParameters.width)
	      .height($scope.userParameters.height)
	      .x($scope.domainX)
	      .elasticX(true)
	      .elasticY(true)
	      .yAxisLabel("The Y Axis")
	      .legend(dc.legend().x($scope.userParameters.width*.75).y($scope.userParameters.height*.05).itemHeight(13).gap(5))
	      .renderHorizontalGridLines(true)
	      .mouseZoomable(true)
	    .compose([
			cumulativeArea,
	        savingsBar,
	        actualLine,
	        expectedLine
	        ])
	    .brushOn(false)
	    .rangeChart(ranger);
	    
	    
	    dc.renderAll();
	    return composite;
	};
	
	var http = function(data) {
		$scope.showButtons = false;
        $scope.dateDimension  = dataService.getDateDimension();
        
        $scope.actualGroup = dataService.getActualGroup();
        $scope.expectedGroup = dataService.getExpectedGroup();
        $scope.savingsGroup = dataService.getSavingsGroups(); //[dataService.getSavingsGroup(), dataService.getSavingsGroup()];
        
        $scope.savingsSum = dataService.getCumulativeSavingsGroup();
       
        //TODO: this is grouping by hour...
        var bottom = (new Date($scope.dateDimension.bottom(1)[0].timestamp)).getHours();
        var top = (new Date($scope.dateDimension.top(1)[0].timestamp)).getHours();
        console.log([bottom, top]);
        $scope.domainX = d3.scale.linear().domain([bottom, top]); 
        
        composite = drawChart();
        $scope.showButtons = true;
    };
    
	var csv = function (doubleize) {	//doubleize is a variable which delivers the view that has multi (2) facilities!
		d3.csv("expectedActual.csv", function(error, energyData) {
			$scope.showButtons = false;
	    	dataService.csvInit(energyData, doubleize);
	    	console.log(dataService.dataArr());
	    	
	    	$scope.dateDimension  = dataService.getDateDimension();
	        
	        $scope.actualGroup = dataService.getActualGroup();
	        $scope.expectedGroup = dataService.getExpectedGroup();
	        $scope.savingsGroup = dataService.getSavingsGroups();
	        
	        $scope.savingsSum = dataService.getCumulativeSavingsGroup();
	        
	        var bottom = (new Date($scope.dateDimension.bottom(1)[0].timestamp)).getMonth();
	        var top = (new Date($scope.dateDimension.top(1)[0].timestamp)).getMonth();
	        console.log([bottom, top]); //TODO:this is borken
	        $scope.domainX = d3.scale.linear().domain([bottom, top]);
	        
	        composite = drawChart();
	        $scope.showButtons = true;
	    });
	};
	
	$scope.drawHttpChart = function () {
		$scope.chartInit = true;
		dataService.getData().then( http, csv );
	};
	
	$scope.drawCsvChart = function () {
		$scope.chartInit = true;
		csv();
	};
	
	$scope.drawMultiChart = function () {
		$scope.chartInit = true;
		csv("doubleize");
	};
	
	$scope.redrawChart = function () {
		composite = drawChart();
	};
	
	$scope.isColor = function (paramName) {
		var regex = /color/ig;
		return regex.test(paramName);
	};
}]);