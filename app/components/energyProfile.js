'use strict';
angular.module('myApp.energyProfile', ['ngRoute'])

.factory('energyProfileDataService', ['$http', function($http){
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	} 
	var _servObj = {};
	var _ndx;	//TODO:Underscores dood
	var _dimensions = {};
	var _groups = {};
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
			marginBottom: 25,
			lowDate: new Date((new Date()) - (28*24*60*60*1000)),
			highDate: new Date(),
			organization: "ANDO",
			meterName: "Site_kWh1"
	};
	var _chartParameters = {};
	var _tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels USED BY CSV INIT
	var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
	var _composite;
	var _meters = {};
	
	var _getData = function () {	
		//TODO: Dates must exist! If left blank, http request may fail
		var message = {
			    "date": {
			        "$gt": {
			            "$date": _userParameters.lowDate ? _userParameters.lowDate : undefined
			        },
			        "$lt": {
			            "$date": _userParameters.highDate ? _userParameters.highDate : undefined
			        }
			    },
			    "organization" : _userParameters.organization ? _userParameters.organization : undefined,
				"name" : _userParameters.meterName ? _userParameters.meterName : undefined,
			};
		
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
		.success(_successData)
		.error( function () { alert('fail to query data'); } );
	};
	var _successData = function (data) {
		_ndx = crossfilter();
		console.log(data);
		for(var i = 0, ilen = data.result.length; i < ilen; i++) {
			for(var j = 0, jlen = data.result[i].his.length; j < jlen; j++) {
				data.result[i].his[j].name = data.result[i].name;	//adds name of meter to the datapoint.
				_meters[data.result[i].his[j].name] = '';	//keeps track of all meters that the chart currently has data for
			}
			_ndx.add(data.result[i].his);
		}
		console.log(_meters);
		_chartParameters.daysBetween = (_userParameters.highDate - _userParameters.lowDate)/(1000*60*60*24);
		
		_createDimensions();
        
		console.log('success????');
		//TODO: this is the extent of below, lol.
	};
	
	var _csvInit = function (energyData, doubleize) {
			var multi = 1;	//multi just fudges the data. Honestly, this should
			if(doubleize) {	//be handled by crossfiltering the data together, or whatevr
				multi = 2;
			}
	        var totalSum = 0;
	        _groups.savingsGroups = [];
	        _groups.expectedGroups = [];
	        _groups.actualGroups = [];
	        _groups.cumulativeSavingsGroups = [];
	        
			_ndx = crossfilter(energyData);
			
			_dimensions.masterDimension = _ndx.dimension(function(d) { return d3.time.month(_tfIso(d.date)); });
			
			_groups.actualGroups[0] = _dimensions.masterDimension.group().reduceSum(function(d) { return multi*d.actualKWH; });
			_groups.expectedGroups[0] = _dimensions.masterDimension.group().reduceSum(function(d) { return multi*d.expectedKWH; });
			_groups.savingsGroups[0] = _dimensions.masterDimension.group().reduceSum(function(d) { return multi*d.savings; });
			_groups.savingsGroups[multi-1] = _dimensions.masterDimension.group().reduceSum(function(d) { return multi*d.savings; });
			//yeah, i just did multi-1. I live dangerously.
			
			_chartParameters.minDate = _dimensions.masterDimension.bottom(1)[0]; // sets the lowest date value from the available data
	        _chartParameters.maxDate = _dimensions.masterDimension.top(1)[0]; // sets the highest date value from the available data
	        
	        _chartParameters.domainX = d3.scale.linear().domain([_chartParameters.minDate, _chartParameters.maxDate]);

	        console.log([_chartParameters.minDate, _chartParameters.maxDate]);
	        
			_groups.cumulativeSavingsGroups[0] = _dimensions.masterDimension.group().reduce( // groups a value for each entry in the dimension by finding the total aggregated savings
	        		function(p,v) {totalSum = (multi*v.savings) + totalSum;  return totalSum;}, // sets the method for adding an entry into the total
	        		function(p,v) {totalSum = totalSum-(multi*v.savings); return totalSum;}, // sets the method for removing an entry from the total
	        		function() {totalSum = 0; return totalSum;}	 // sets the method for initializing the total
	        );
	        _chartParameters.xUnits = d3.time.months;
	        _chartParameters.tickFormat = function(v) {return _tfMonthYear(new Date(v));};
	        
			console.log("Dummy Data!");
	};
	
	var _createDimensions = function () {
		//_dimensions.masterDimension = _ndx.dimension(function(d) { return parse(d.date).getMonth()+1;});
	    var monthDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; }
	    	var ret = d3.time.month(_tfIso(d.timestamp));
	    	ret.name = d.name;	//retains meter name on value. Since its a Date object, the toString function
	    	//(or whatever dc decides is the important/common return) will be the same even if the datapoints
	    	//have different 'name' keys
	    	return ret;
	    }); // creates the x-axis components using their date as a guide
	    var weekDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; } 
	    	var ret = d3.time.week(_tfIso(d.timestamp));
	    	ret.name = d.name;
	    	return ret;
	    });
	    var dayDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; }
	    	var ret = d3.time.day(_tfIso(d.timestamp));
	    	ret.name = d.name;
	    	return ret;
	    });
	    
	    if(_chartParameters.daysBetween <= 30){
	    	_dimensions.masterDimension = dayDimension;
  			_chartParameters.xUnits = d3.time.days;
  		    var displayDate = d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  		    _chartParameters.tickFormat = function(v) {return displayDate(new Date(v));}; 
  		    //numberOfTicks = _chartParameters.daysBetween;
  		}
  		else if(_chartParameters.daysBetween <= (180)){
  			_dimensions.masterDimension = weekDimension;
  			_chartParameters.xUnits = d3.time.weeks;
  			var displayDate = d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  			_chartParameters.tickFormat = function(v) {return displayDate(new Date(v));};
  			//numberOfTicks = _chartParameters.daysBetween/7;
  		}
  		else{
  			_dimensions.masterDimension = monthDimension;
  			_chartParameters.xUnits = d3.time.months;
  			var displayDate = d3.time.format("%m-%y"); // function to change the format of a date object to mm-yyyy
  			_chartParameters.tickFormat = function(v) {return displayDate(new Date(v));};
  			//numberOfTicks = _chartParameters.daysBetween/30;
  		}
		
	    _createDomain();
        
        _groups.savingsGroups = [];
        _groups.expectedGroups = [];
        _groups.actualGroups = [];
        _groups.cumulativeSavingsGroups = [];
        
        for (var meterName in _meters) {	//separates each meter into its own group
        	if (_meterIsntConsumption(meterName)) { continue; }
			_groups.actualGroups.push(
				_dimensions.masterDimension.group().reduceSum(function(d) {
					return d.name === meterName ? d.value*.85 : 0;
				})
			);
			_groups.expectedGroups.push(
				_dimensions.masterDimension.group().reduceSum(function(d) {
					return d.name === meterName ? d.value : 0;
				})
			);
			_groups.savingsGroups.push(
				_dimensions.masterDimension.group().reduceSum(function(d) {
					return d.name === meterName ? d.value*.15 : 0;
				})
			);
			var totalSum = 0;
			_groups.cumulativeSavingsGroups.push(
				_dimensions.masterDimension.group().reduce(
					//groups a value for each entry in the dimension by finding the total aggregated savings
	        		function(p,v) {
	        			totalSum = (v.name === meterName ? v.value*.15 : 0) + totalSum;
	        			return totalSum;
	        		},	// sets the method for adding an entry into the total
	        		function(p,v) {
	        			totalSum = totalSum - (v.name === meterName ? v.value*.15 : 0 );
	        			return totalSum;
	        		},	// sets the method for removing an entry from the total
	        		function() {
	        			totalSum = 0;
	        			return totalSum;
	        		}	// sets the method for initializing the total
				)
			);
        }
	};
	
	var _createDomain = function () {
		var lowest = new Date(_dimensions.masterDimension.bottom(1)[0].timestamp);
		var highest = new Date(_dimensions.masterDimension.top(1)[0].timestamp);
		
		_chartParameters.minDate = lowest; // sets the lowest date value from the available data
        _chartParameters.maxDate = highest;// sets the highest date value from the available data
        
        console.log([_chartParameters.minDate, _chartParameters.maxDate]);
        
        _chartParameters.domainX = d3.scale.linear().domain([_chartParameters.minDate, _chartParameters.maxDate]);
	};
	//TODO: make this work
	var _initCompositeChart = function (domString) {
		_composite = dc.compositeChart("#"+domString);
		return _composite;
	};
	//TODO: make this work
	var _generateCharts = function () {
		_charts.cumulativeArea = dc.lineChart(_composite)
		    .dimension(_dimensions.masterDimension)
		    .interpolate("cardinal")
		    .colors(_userParameters.cumulativeColor)
		    .group(_groups.savingsSum, "Total Savings/Waste")
		    .renderArea(true);
		_charts.actualLine = dc.lineChart(_composite)
	        .dimension(_dimensions.masterDimension)
	        .interpolate("cardinal")
	        .colors(_userParameters.actualColor)
	        .group(_groups.actualGroups[0], "Actual KWH");
		_charts.expectedLine = dc.lineChart(_composite)
	        .dimension(_dimensions.masterDimension)
	        .interpolate("cardinal")
	        .colors(_userParameters.expectedColor)
	        .group(_groups.expectedGroups[0], "Expected KWH");
		_charts.savingsBar = dc.barChart(_composite)
	        .dimension(_dimensions.masterDimension)
	        .group(_groups.savingsGroups[0], "Savings")
	        .ordinalColors(_userParameters.savingsColor)
	        .centerBar(true);
		
		//TODO: take care, since this defaults and writes the ranger to the ranger DOM id
		_charts.ranger = dc.barChart("#ranger")
	        .dimension(_dimensions.masterDimension)
	        .group(_groups.savingsGroups[0], "Savings")
	        .ordinalColors(_userParameters.savingsColor)
	        .x(_chartParameters.domainX);
		
		for (var i = 1, len = _groups.savingsGroups.length; i < len; i++) {
			_charts.savingsBar = _charts.savingsBar.stack(_groups.savingsGroups[i], "Savings"+i); //TODO:these should hav emore meaningful names
		}
		return _charts;
	};
	
	var _meterIsntConsumption = function (meterName) {
		var regex = /kWh/ig;
		return !regex.test(meterName);
	};
	var _getUserParameters = function () {
		return _userParameters;
	};
	var _getChartParameters = function () {
		return _chartParameters;
	};
	var _getMasterDimension = function () {
		return _dimensions.masterDimension;
	};
	
	var _getActualGroup = function () { //TODO: dafuq is this supposed to be
		return _groups.actualGroups[0];
	};
	var _getExpectedGroup = function () { //TODO: dafuq is this supposed to be
		return _groups.expectedGroups[0];
	};
	var _getSavingsGroup = function () {	//TODO: dafuq is this supposed to be
		return _groups.savingsGroups[0];
	};
	var _getCumulativeSavingsGroup = function() { //TODO: dafuq is this supposed to be
		return _groups.cumulativeSavingsGroups[0];
	};
	
	var _getActualGroups = function () {
		return _groups.actualGroups;
	};
	var _getExpectedGroups = function () {
		return _groups.expectedGroups;
	};
	var _getSavingsGroups = function () {
		return _groups.savingsGroups;
	};
	var _getCumulativeSavingsGroups = function() { 
		return _groups.cumulativeSavingsGroups;
	};
	
	var _getCharts = function () {
		return _charts;
	};
	
	_servObj = {
		getData : _getData,
		
		getMasterDimension : _getMasterDimension,
		getExpectedGroup : _getExpectedGroup,
		getActualGroup : _getActualGroup,
		getSavingsGroup : _getSavingsGroup,
		getCumulativeSavingsGroup : _getCumulativeSavingsGroup,
		
		getExpectedGroups : _getExpectedGroups,
		getActualGroups : _getActualGroups,
		getSavingsGroups : _getSavingsGroups,
		getCumulativeSavingsGroups : _getCumulativeSavingsGroups,
		getChartParameters : _getChartParameters,
		getUserParameters : _getUserParameters,
		
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
		    .dimension($scope.masterDimension)
		    .interpolate("cardinal")
		    .colors($scope.userParameters.cumulativeColor)
		    .group($scope.cumulativeSavingsGroups[0], "Total Savings/Waste")
		    .renderArea(true);
		var actualLine = dc.lineChart(composite)
	        .dimension($scope.masterDimension)
	        .interpolate("cardinal")
	        .colors($scope.userParameters.actualColor)
	        .group($scope.actualGroups[0], "Actual KWH");
		var expectedLine = dc.lineChart(composite)
	        .dimension($scope.masterDimension)
	        .interpolate("cardinal")
	        .colors($scope.userParameters.expectedColor)
	        .group($scope.expectedGroups[0], "Expected KWH");
		var savingsBar = dc.barChart(composite)
	        .dimension($scope.masterDimension)
	        .group($scope.savingsGroups[0], "Savings")
	        .ordinalColors($scope.userParameters.savingsColor)
	        .centerBar(true);
		
		var ranger = dc.barChart("#ranger")
	        .dimension($scope.masterDimension)
	        .group($scope.savingsGroups[0], "Savings")
	        .ordinalColors($scope.userParameters.savingsColor)
	        .x($scope.chartParameters.domainX);
		var chartArray = [
				          cumulativeArea,
				          savingsBar,
				          actualLine,
				          expectedLine
		];
		
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
		.compose(chartArray)

	      .x($scope.chartParameters.domainX)
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
		$scope.masterDimension  = dataService.getMasterDimension();
        
        $scope.actualGroups = dataService.getActualGroups();
        $scope.expectedGroups = dataService.getExpectedGroups();
        $scope.savingsGroups = dataService.getSavingsGroups();
        
        $scope.cumulativeSavingsGroups = dataService.getCumulativeSavingsGroups();
        $scope.chartParameters = dataService.getChartParameters();
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
	$scope.isDate = function (paramName) {
		var regex = /date/ig;
		return regex.test(paramName);
	};
	$scope.isArray = function (param) {
		return typeof param === "object";
	};
	$scope.isntSpecial = function (param, paramName) {		//true when isn't a color, date or array, or something else
		return !$scope.isColor(paramName)&&!$scope.isDate(paramName)&&!$scope.isArray(param);
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
}]);