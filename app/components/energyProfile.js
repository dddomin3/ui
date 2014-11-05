'use strict';
 
angular.module('myApp.energyProfile', ['ngRoute'])

.factory('energyProfileDataService', ['$http', function($http){
	var _servObj = {};
	var _dataArr = [];
	var ndx;	//TODO:Underscores dood
	var dimensions = {};
	var groups = {};
	var _charts = {};
	var _userParameters = {
			savingsColor : ['cyan', 'orange'],
			actualColor : 'blue',
			expectedColor : 'red',
			cumulativeColor : "gray",
			width: 750,
			height: 680,
			marginLeft: 75,
			marginRight: 150,
			marginTop: 25,
			marginBottom: 25
	};
	var chartParameters = {};
	var monthNumber = d3.time.format("%m").parse;
	var tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels
	var tfHour = d3.time.format("%H");
	var minDate;
	var maxDate;
	var _composite;
	
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
		return $http.get('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595')
		.success(successHandler)
		.error(errorHandler);
	};
	
	var successHandler = function(data) {
		_dataArr = data.his;
		console.log(data.his);
		
		var ddate = new Date(data.his[0].timestamp);
		
		ndx = crossfilter(_dataArr);
		//dimensions.dateDimension = ndx.dimension(function(d) { return parse(d.date).getMonth()+1;});
		dimensions.dateDimension = ndx.dimension(function(d) { 
			return d3.time.hour((new Date(d.timestamp)));			
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
        
		//TODO:This may not be correct... 
		chartParameters.minDate = (new Date(dimensions.dateDimension.bottom(1)[0].timestamp)).getHours(); // sets the lowest date value from the available data
        chartParameters.maxDate = (new Date(dimensions.dateDimension.top(1)[0].timestamp)).getHours(); // sets the highest date value from the available data
        
        console.log([chartParameters.minDate, chartParameters.maxDate]);
        
        chartParameters.domainX = d3.scale.linear().domain([chartParameters.minDate, chartParameters.maxDate]);
		
        chartParameters.xUnits = d3.time.hours;
        chartParameters.tickFormat = function(v) {return tfHour(new Date(v));};
        
		console.log('success????');
	};
	
	var errorHandler = function(data){
		console.log('error???');
		throw('there was problem getting data');
	};
	
	var _csvInit = function (energyData, doubleize) {
			_dataArr = energyData;
			var multi = 1;	//multi just fudges the data. Honestly, this should
			if(doubleize) {	//be handled by crossfiltering the data together, or whatevr
				multi = 2;
			}
			var parse = d3.time.format("%m/%d/%Y").parse;
	        var totalSum = 0;
	        groups.savingsGroups = [];
	        
			ndx = crossfilter(_dataArr);
			
			dimensions.dateDimension = ndx.dimension(function(d) { return d3.time.month(parse(d.date)); });
			
			groups.actualGroup = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.actualKWH; });
			groups.expectedGroup = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.expectedKWH; });
			groups.savingsGroups[0] = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.savings; });
			groups.savingsGroups[multi-1] = dimensions.dateDimension.group().reduceSum(function(d) { return multi*d.savings; });
			//yeah, i just did multi-1. I live dangerously.
			
			chartParameters.minDate = dimensions.dateDimension.bottom(1)[0]; // sets the lowest date value from the available data
	        chartParameters.maxDate = dimensions.dateDimension.top(1)[0]; // sets the highest date value from the available data
	        
	        chartParameters.domainX = d3.scale.linear().domain([chartParameters.minDate, chartParameters.maxDate]);

	        console.log([chartParameters.minDate, chartParameters.maxDate]);
	        
			groups.cumulativeSavingsGroup = dimensions.dateDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
	        		function(p,v) {totalSum = (multi*v.savings) + totalSum;  return totalSum;}, // sets the method for adding an entry into the total
	        		function(p,v) {totalSum = totalSum-(multi*v.savings); return totalSum;}, // sets the method for removing an entry from the total
	        		function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
	        );
	        chartParameters.xUnits = d3.time.months;
	        chartParameters.tickFormat = function(v) {return tfMonthYear(new Date(v));};
	        
			console.log("Dummy Data!");
	};
	
	//TODO: make this work
	var _initCompositeChart = function (domString) {
		_composite = dc.compositeChart("#"+domString);
		return _composite;
	};
	//TODO: make this work
	var _generateCharts = function () {
		_charts.cumulativeArea = dc.lineChart(_composite)
		    .dimension(dimensions.dateDimension)
		    .interpolate("basis")
		    .colors(_userParameters.cumulativeColor)
		    .group(groups.savingsSum, "Total Savings/Waste")
		    .renderArea(true);
		_charts.actualLine = dc.lineChart(_composite)
	        .dimension(dimensions.dateDimension)
	        .interpolate("basis")
	        .colors(_userParameters.actualColor)
	        .group(groups.actualGroup, "Actual KWH");
		_charts.expectedLine = dc.lineChart(_composite)
	        .dimension(dimensions.dateDimension)
	        .interpolate("basis")
	        .colors(_userParameters.expectedColor)
	        .group(groups.expectedGroup, "Expected KWH");
		_charts.savingsBar = dc.barChart(_composite)
	        .dimension(dimensions.dateDimension)
	        .group(groups.savingsGroups[0], "Savings")
	        .ordinalColors(_userParameters.savingsColor)
	        .centerBar(true);
		
		//TODO: take care, since this defaults and writes the ranger to the ranger DOM id
		_charts.ranger = dc.barChart("#ranger")
	        .dimension(dimensions.dateDimension)
	        .group(groups.savingsGroups[0], "Savings")
	        .ordinalColors(_userParameters.savingsColor)
	        .x(chartParameters.domainX);
		
		for (var i = 1, len = groups.savingsGroups.length; i < len; i++) {
			_charts.savingsBar = _charts.savingsBar.stack(groups.savingsGroups[i], "Savings"+i); //TODO:these should hav emore meaningful names
		}
		return _charts;
	};
	
	var _getUserParameters = function () {
		return _userParameters;
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
	var _getSavingsGroup = function () {	//TODO: dafuq is this supposed to be
		return groups.savingsGroups[0];
	};
	var _getSavingsGroups = function () {
		return groups.savingsGroups;
	};
	var _getCumulativeSavingsGroup = function() {
		return groups.cumulativeSavingsGroup;
	};
	
	var _getXUnits = function () {
		return chartParameters.xUnits;
	};
	var _getTickFormat = function () {
		return chartParameters.tickFormat;
	};
	var _getDomainX = function () {
		return chartParameters.domainX;
	};
	
	var _getCharts = function () {
		return _charts;
	};
	
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
		getUserParameters : _getUserParameters,
		
		getXUnits : _getXUnits,
		getTickFormat : _getTickFormat,
		getDomainX : _getDomainX,
		
		csvInit : _csvInit,
		initCompositeChart : _initCompositeChart,
		generateCharts : _generateCharts,
		getCharts : _getCharts
	};
	
	return _servObj;
	
}])	//TODO:controller shouldn't have http...
.controller('energyProfileCtrl', ['$scope', '$location', '$route', 'energyProfileDataService', '$http', 
                    function($scope, $location, $route, dataService, $http) {
	$scope.timeSeries = 'energyProfile';
	$scope.showButtons = true;
	$scope.chartInit = false;
	$scope.userParameters = dataService.getUserParameters();
	$scope.chartParameters = {};
	//data init stuff
	$scope.organization = 'ANDO';
	$scope.highDate = new Date();
	$scope.lowDate = new Date((new Date()) - (28*24*60*60*1000)); //28 days*hours*minutes*seconds*milliseconds
	
	var composite; //variable that stores the composite chart generated by program
	//populated by drawChart
	
	var drawChart = function () {
		var lX = $scope.userParameters.width - $scope.userParameters.marginRight + 25,
			lY = $scope.userParameters.height - 650;
		
		composite = dataService.initCompositeChart("test_composed");
		//composite = dc.compositeChart("#test_composed");
		
		$scope.charts = dataService.generateCharts();
		console.log($scope.charts);
		var cumulativeArea = dc.lineChart(composite)
		    .dimension($scope.dateDimension)
		    .interpolate("basis")
		    .colors($scope.userParameters.cumulativeColor)
		    .group($scope.savingsSum, "Total Savings/Waste")
		    .renderArea(true);
		console.log($scope.charts.cumulativeArea);
		console.log(cumulativeArea);
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
	        .group($scope.savingsGroups[0], "Savings")
	        .ordinalColors($scope.userParameters.savingsColor)
	        .centerBar(true);
		
		var ranger = dc.barChart("#ranger")
	        .dimension($scope.dateDimension)
	        .group($scope.savingsGroups[0], "Savings")
	        .ordinalColors($scope.userParameters.savingsColor)
	        .x($scope.domainX);
		
		
		for (var i = 1, len = $scope.savingsGroups.length; i < len; i++) {
			savingsBar = savingsBar.stack($scope.savingsGroups[i], "Savings"+i); //TODO:these should hav emore meaningful names
		}
		
		composite.xAxis().tickFormat($scope.chartParameters.tickFormat); // sets the tick format to be the month/year only
		
		composite	//configure composite graph object
			.width($scope.userParameters.width) //sets width
			.height($scope.userParameters.height)
			.margins({
				left: $scope.userParameters.marginLeft,
				right: $scope.userParameters.marginRight,
				top: $scope.userParameters.marginTop,
				bottom: $scope.userParameters.marginBottom
			})
		.compose([
		          cumulativeArea,
		          savingsBar,
		          actualLine,
		          expectedLine
		          ])

	      .x($scope.domainX)
	      .xUnits($scope.chartParameters.xUnits) // sets X axis units
	      .elasticX(true)
	
	      .elasticY(true)
	      .renderHorizontalGridLines(true)
	      .legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
	
	      .mouseZoomable(true)
	
	      .brushOn(false)
	      .rangeChart(ranger);

		ranger.xAxis().tickFormat($scope.chartParameters.tickFormat); // sets the tick format to be the month/year only
		ranger.width($scope.userParameters.width)
		.centerBar(true)
		.margins({
			left: $scope.userParameters.marginLeft,
			right: $scope.userParameters.marginRight,
			top: $scope.userParameters.marginTop,
			bottom: $scope.userParameters.marginBottom
		})
		.xUnits($scope.chartParameters.xUnits); // sets X axis units;
	    
	    dc.renderAll();
	    return composite;
	};
	
	var populateScope = function () {
		//this function populates necessary variables onto the scope.
		$scope.dateDimension  = dataService.getDateDimension();
        
        $scope.actualGroup = dataService.getActualGroup();
        $scope.expectedGroup = dataService.getExpectedGroup();
        $scope.savingsGroups = dataService.getSavingsGroups();
        
        $scope.savingsSum = dataService.getCumulativeSavingsGroup();
        
        $scope.domainX = dataService.getDomainX();
        $scope.chartParameters.xUnits = dataService.getXUnits();
        $scope.chartParameters.tickFormat = dataService.getTickFormat();
	};
	
	var http = function(data) {
		$scope.showButtons = false;
        
		populateScope();
        
        composite = drawChart();
        $scope.showButtons = true;
    };
    
	var csv = function (doubleize) {	//doubleize is a variable which delivers the view that has multi (2) facilities!
		d3.csv("expectedActual.csv", function(error, energyData) {
			$scope.showButtons = false;
	    	dataService.csvInit(energyData, doubleize);
	    	
	    	populateScope();
	        
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
		console.log(dataService.getUserParameters());
		composite = drawChart();
	};
	
	$scope.isColor = function (paramName) {
		var regex = /color/ig;
		return regex.test(paramName);
	};
	$scope.isArray = function (param) {
		return typeof param === "object";
	};
	
	$scope.addColor = function (param) {
		console.log($scope);
		param.push('cyan');
	};
	$scope.removeColor = function (param) {
		console.log($scope);
		param.pop();
	};
	
	$scope.logScope = function () {
		console.log($scope);
	};
	$scope.getOrganization = function () {
		
		$http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send',
				'{'
					+'"organization": "'+$scope.organization+'",'
					+'"date": {'
				        +'"$gt": {'
				            +'"$date": "'+$scope.lowDate.toISOString()+'",'
				        +'},'
				        +'"$lt": {'
				            +'"$date": "'+$scope.highDate.toISOString()+'"'
				        +'}'
				    +'}'
				+'}'
				
				)
		.success(showOrganizationDetails)
		.error(function () { alert('fail to query data'); });
	};
	var showOrganizationDetails = function (data) {
		console.log('fuckyou');
		console.log(data);
		console.log(Date());
	};
}]);