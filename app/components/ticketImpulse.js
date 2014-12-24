'use strict';
angular.module('myApp.ticketImpulse', ['ngRoute'])

.factory('ticketImpulseChartService', ['$http', function ($http) {

	var _initFlatten = function (bar, unflattenedData, userParameters) {
		var flattenedData = [];
		for (var org in unflattenedData) {
			for (var fac in unflattenedData[org]) {
				for (var asset in unflattenedData[org][fac]) {
					Array.prototype.push.apply(flattenedData, unflattenedData[org][fac][asset]); //adds an array to an array. like a super push
				}
			}
		}
		return _init(bar, flattenedData, userParameters);
	}; 
	var _init = function (bar, sortedData, userParameters) {
		var getDaysBetween = function(endDate, startDate) {
			return Math.round((endDate - startDate)/(1000*60*60*24));
		};
		var chartHelper = {};
		chartHelper._ndx = crossfilter(sortedData);
		chartHelper._dimensions = {};
			//stores all dimensions generated from data
			//holds a masterDimension key that should be the dimension that is currently used on the drawn chart.
		chartHelper._group = {};
			//stores groups connected to the chart. Is made from the masterDimension
			//if the master dimension is changed, the groups should be recreated
		chartHelper._charts = {};
		
		userParameters = userParameters;
			//this variable stores all user customizable values.
			//I envision that other services and controllers can also access these to either make the customization
			//nice, or to preset certain values
		chartHelper._chartParameters = {
			"daysBetween": getDaysBetween(userParameters.highDate, userParameters.lowDate)
		};
			//these are chart parameters that should be shared amongst generate charts
			//stuff like xAxis 
		var _tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels
		var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
			//this is a function that parses lots of timestamp formats, so its convenient 
		
		chartHelper.createDimensions = function () {
			//creates, chooses and populates dimensions.
			chartHelper._dimensions.hourDimension = chartHelper._ndx.dimension(function(d) {
				var timeObj = new Date(d.createdTime);
				
				return timeObj;
			}); // creates the x-axis components using their date as a guide
			// chartHelper._dimensions.quarterDimension = chartHelper._ndx.dimension(function(d) {
				// if(d.timestamp === undefined) { d.timestamp = d.date; } 
				// var ret = d3.time.minute(_tfIso(d.timestamp));
				// ret.meterName = d.meterName;
				// return ret;
			// });
			// chartHelper._dimensions.minuteDimension = chartHelper._ndx.dimension(function(d) {
				// console.log(d);
				// if(d.timestamp === undefined) { d.timestamp = d.date; }
				// var ret = d3.time.minute(_tfIso(d.timestamp));
				// ret.meterName = d.meterName;
				// return ret;
			// });
			
			chartHelper._dimensions.masterDimension = chartHelper._dimensions.hourDimension;
		};
		
		chartHelper.createDomain = function (userParameters) {
			var topDate = chartHelper._dimensions.masterDimension.top(1)[0].createdTime;
			var topMonth = (new Date(topDate)).getMonth();
			var bottomDate = ( new Date(chartHelper._dimensions.masterDimension.bottom(1)[0].createdTime) ).setDate(1);
			topDate = (new Date((new Date(topDate)).setMonth(topMonth + 1))).setDate(0);
			
			chartHelper._chartParameters.domainX = d3.time.scale().domain([(new Date(bottomDate)), new Date(topDate)]);
				//above sets the domain of the chart to the first day of the motnh of the first
				//ticket, and the last day of the month of the last ticket
			
			var scale = d3.time.scale();
			scale.ticks(d3.time.month);
			chartHelper._chartParameters.xUnits = function (start, end) {
				var barWidth = userParameters.barWidthPercentage;
				barWidth = (barWidth > 100)||(barWidth <= 0)? 
				1 :
				parseInt(100/barWidth, 10);
				var increment = (end - start)/barWidth;
				
				var domain = [];
				var steps = Number(barWidth)+1;
				while(steps--) {domain.push(end-steps*increment);}
				
				return domain;
			};
			
			chartHelper._chartParameters.tickFormat = scale.tickFormat();
		};
		
		chartHelper.createGroups = function () {
			//these groups consider the entire dataset in question.
			chartHelper._group = chartHelper._dimensions.masterDimension.group()
			.reduce(
				function (p,v) {
					p.count++;
					p.mouseoverInfo += v.eventID;
					return p;
				},	
				function (p,v) {
					return --p.count;
				},
				function () {
					return {
						'count': 0,
						'mouseoverInfo': ''
					};
				}	
			);
		};
		
		chartHelper.drawChart = function () {
			var lX = userParameters.width - userParameters.marginRight + 25,
				lY = userParameters.height - 650;
			//legend coords
			bar
				.width(userParameters.width)
				.height(userParameters.height)
				.xAxisLabel("Month-Year")
				.yAxisLabel("Count")
				.margins({
					left: userParameters.marginLeft,
					right: userParameters.marginRight,
					top: userParameters.marginTop,
					bottom: userParameters.marginBottom
				})
				
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				
				.xUnits(chartHelper._chartParameters.xUnits) // sets X axis units
				.x(chartHelper._chartParameters.domainX)
		        .dimension(chartHelper._dimensions.masterDimension)
		        .group(chartHelper._group)
				
		        .centerBar(true)
		        .barPadding(0.5)
				.title(function (p) {return p.value.mouseoverInfo; })
				.renderTitle(true)
				.valueAccessor(function (p) {return p.value.count; })
				
				.colors(userParameters.barColor)
				
				//.elasticX(true)
				//.elasticY(true)
				.legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
				//.yAxisPadding("5%")	//WARNING: not in api, but xAxisScaling works. This was legit a stab in the dark.
				//.xAxisPadding("5%")
				
				.mouseZoomable(true)
				.brushOn(false);
			
			bar.xAxis().tickFormat(chartHelper._chartParameters.tickFormat); // sets the tick format to be the hour only
			
			bar.render();
			return bar;
		};
		
		chartHelper.meterIsntConsumption = function (meterName) {
			var regex = /kWh/ig;
			return !regex.test(meterName);
		};
		chartHelper.meterIsConsumption = function (meterName) {
			return !chartHelper._meterIsntConsumption(meterName);
		};
		chartHelper.getUserParameters = function () {
			return userParameters;
		};
		chartHelper.getChartParameters = function () {
			return chartHelper._chartParameters;
		};
		chartHelper.getMasterDimension = function () {
			return chartHelper._dimensions.masterDimension;
		};
		
		chartHelper.getCumulativeMaxGroup = function () { 
			return chartHelper._groups.cumulativeMaxGroup;
		};
		chartHelper.getCumulativeAverageGroup = function () {
			return chartHelper._groups.cumulativeAverageGroup;
		};
		
		chartHelper.getAverageGroups = function () {
			return chartHelper._groups.averageGroups;
		};
		chartHelper.getMaxGroups = function () {
			return chartHelper._groups.maxGroups;
		};
		
		chartHelper.createDimensions();
		chartHelper.createDomain(userParameters);
        chartHelper.createGroups();
		
		return chartHelper;
	};
	
	return {
		init : _init,
		initFlatten : _initFlatten
	};
	
}])
.factory('chartIdService', ['$http', function($http){
	var _count = 0;
	var _getNewId = function () {
		return "selfgen_chartid_"+_count++;
	};
	return {
		getNewId : _getNewId
	};
}])
.factory('ticketImpulseDataService', ['$http', function($http) {
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	};
	var _tfIso = d3.time.format.iso.parse;
	var _servObj = {};
		//this is what is returned by this factory
	var _getDefaultUserParameters = function () {
		return {
			width: 600,
			height: 200,
			barWidthPercentage: 1,
			marginLeft: 50,
			marginRight: 25,
			marginTop: 25,
			marginBottom: 75,
			lowDate: new Date((new Date((new Date()) - (6*28*24*60*60*1000))).toDateString()),
			highDate: new Date( (new Date()).toDateString() ),
			barColor: "rgba(215,35,35,.6)"
		};
	};
	
	var _dayToColorMap = {
			"Sun": "rgba(229,  63,   0, .8)",
			"Mon": "rgba(222, 172,   0, .8)",
			"Tue": "rgba(156, 216,   0, .8)",
			"Wed": "rgba( 46, 210,   0, .8)",
			"Thu": "rgba(  0, 203,  56, .8)",
			"Fri": "rgba(  0, 197, 153, .8)",
			"Sat": "rgba(  0, 137, 191, .8)"
	};
	
	var _getData = function (userParameters, query) {	//TODO: Singleton changes	
		//this function queries the server for all existing organizations(if query argument is undefined)
		//it's messy since it technically grabs all information after the below hardcoded date,
		//and strings together a key value pair of all organizations, but whatever.
		//if query is defined, this function the information in the query
		var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString;
		if (query === undefined) {
			requestString = {
				"createdTime": {
					"$gt": {"$date": "" + (new Date(userParameters.lowDate)).toJSON() },
					"$lt": {"$date": "" + (new Date(userParameters.highDate)).toJSON() }
				}
			}
		}
		else { //if query is specified
			//console.log(['type', (typeof query), query]);
			if (typeof query === "string") { query = JSON.parse(query); }
			var or = [];
			for (var i = 0, len = query.assets.length; i < len; i++) {
				or.push(
					{
						"asset" : query.assets[i].asset ? query.assets[i].asset : undefined,
						"facility" : query.assets[i].facility ? query.assets[i].facility : undefined,
						"organization": query.assets[i].organization ? query.assets[i].organization : undefined
					}
				);
			}
			var requestString = {
				"createdTime": {
					"$gt": {"$date": ""+( query.lowDate ? (new Date(query.lowDate)).toJSON() : (new Date(userParameters.lowDate)).toJSON() )},
					"$lt": {"$date": ""+( query.highDate ? (new Date(query.highDate)).toJSON() : (new Date(userParameters.highDate)).toJSON() )}
				},
				"$or": or
			};
		}
		//console.log('reqStr', requestString);
		var config = {
				method: 'POST',
				headers: {'Collection': 'Event'},
				url: mongoUrl,
				data: JSON.stringify(requestString)
		};
		var promise = $http(config).success(_successData)
		.error ( 
			function(e) {console.error(e); return false;}
		);
		return promise;
	};
	
	var _successData = function(data, status, headers, config){
		var treatedData = {};
		for(var i = 0, ilen = data.result.length; i < ilen; i++) {
			var org = data.result[i].organization;
			var fac = data.result[i].facility;
			var asset = data.result[i].asset;
			if(treatedData[org]) {	//if organization entry exists
				if(treatedData[org][fac]) {	//if facility entry exists
					if(treatedData[org][fac][asset]) { //if asset entry exists
						treatedData[org][fac][asset].push(data.result[i]);	//add ticket to list
					}
					else {	//asset doesn't exist but org and fac do
						treatedData[org][fac][asset] = [data.result[i]];	//init asset. save ticket under asset
					}
				}
				else {	//facility doesn't exist, but org does
					treatedData[org][fac] =	{};							//init facility
					treatedData[org][fac][asset] = [data.result[i]];	//init asset. save ticket under asset
				}
			}
			else {
				treatedData[org] = {};								//init org
				treatedData[org][fac] =	{};							//init facility
				treatedData[org][fac][asset] = [data.result[i]];	//init asset. save ticket under asset
			}
		}
		data.treatedData = treatedData;
		return true;
	};
	
	_servObj = {
		getData : _getData,
		getDefaultUserParameters: _getDefaultUserParameters
	};
	
	return _servObj;
}])
.controller('ticketImpulseCtrl', ['$scope', '$location', 'ticketImpulseChartService', 'ticketImpulseDataService', '$timeout',
function($scope, $location, chartService, dataService, $timeout) {
	$scope.timeSeries = 'ticketImpulse: '+$scope.dom;
	$scope.showButtons = true;
	$scope.chartInit = false;
	
	if ($scope.inputUserParameters === undefined) {
		$scope.userParameters = dataService.getDefaultUserParameters();
	}
	else {
		//this is VERY specific functionality. The controller will copy the reference of the inputUserParameters,
		//then populate the missing properties. This is so any userParameter manipulation in this controller is
		//propagated outwardly
		var defaultUserParameters = dataService.getDefaultUserParameters();
		//console.log(defaultUserParameters);
		for(var property in defaultUserParameters) {
			if( $scope.inputUserParameters[property] === undefined ) {
				$scope.inputUserParameters[property] = defaultUserParameters[property];
			}
		}
		$scope.userParameters = $scope.inputUserParameters;
	}
	
	$scope.treatedData = {};
	$scope.rawData = [];
	$scope.active = {};
	
	if($scope.inputRawData !== undefined) {	
		$scope.rawData = $scope.inputRawData;
	}

	var bar;
		//populated by drawChart
	
	$scope.active = $scope.query ? $scope.query
	: {
		assets : [{
			asset : "AHU1",
			facility : "60 Wall Street",
			organization : "DEU",
		}],
		lowDate: new Date((new Date((new Date()) - (6*28*24*60*60*1000))).toDateString()),
		highDate: new Date( (new Date()).toDateString() )
	};
	
	var userParameterWatches = function () {
		$scope.$watch('userParameters.barWidthPercentage', function(newVal, oldVal, scope) {
			$scope.drawChart();
		});
		$scope.$watch('userParameters.height', function(newVal, oldVal, scope) {
			if(newVal > 100) {
				$scope.redrawChart();
			}
		});
		$scope.$watch('userParameters.width', function(newVal, oldVal, scope) {
			if(newVal > 250) {
				$scope.redrawChart();
			}
		});
	};
	
	var httpCallback = function(response) {
		$scope.treatedData = response.data.treatedData;
		$scope.rawData = response.data.result;
		$scope.showButtons = false;
		try {
			$scope.drawChart();
			userParameterWatches();
		}
		catch (e) {
			console.error(e); // pass exception object to error handler
		}
		finally {
			$scope.showButtons = true;
		}
	};
	
	var httpError = function (e) { console.log("Ray broke the server"); console.error(e);};
	
	$scope.initDataStartChartDraw = function () {
		$scope.chartInit = true;
		console.log($scope.dom);
		if($scope.inputRawData !== undefined) {//if inputData is passed in, there is no need to fetch data
			$scope.showButtons = false;
			$scope.drawChart();
			userParameterWatches(); //TODO: make this set chartInit, and only execute if chart init if false if doing this over and over messes things up.
			$scope.showButtons = true;
		}	
		else {
			dataService.getData($scope.userParameters, $scope.active).then (
				httpCallback, 
				httpError
			);
		}
	};
	
	$scope.drawChart = function () {
		bar = dc.barChart('#'+$scope.dom);
		$scope.chartHelper = chartService.init(
			bar,
			$scope.rawData,
			$scope.userParameters
		);
		
		$scope.chartHelper.drawChart();
	};
	
	$scope.queryData = function () {
		dataService.getData($scope.userParameters, $scope.active).then(
			function (response) {
				$scope.treatedData = response.data.treatedData;
				$scope.rawData = response.data.result;
			}, 
			httpError
		);
	};
	$scope.queryAllData = function () {
		dataService.getData($scope.userParameters, undefined).then (
			function (response) {
				$scope.treatedData = response.data.treatedData;
			}, 
			httpError
		);
	};
	$scope.deleteActive = function (org, fac, asset) {
		for(var i = 0, len = $scope.active.assets.length; i < len; i++)
		{
			if( ($scope.active.assets[i].organization === org)
			&&($scope.active.assets[i].facility === fac)
			&&($scope.active.assets[i].asset === asset) ) {
			
				$scope.active.assets.splice(i,1);
				if($scope.active.assets.length > 0) {$scope.initDataStartChartDraw();}	//redraw if there is data to redraw
				return true;
			}
		}
		return false;
	};
	$scope.initAsset = function (org, fac, asset) {
		for(var i = 0, len = $scope.active.assets.length; i < len; i++)
		{
			if( ($scope.active.assets[i].organization === org)
			&&($scope.active.assets[i].facility === fac)
			&&($scope.active.assets[i].asset === asset) ) {
				alert("Already Exists!");
				$scope.initDataStartChartDraw();
				return false;	//Don't do anything if it already exists
			}
		}
		$scope.active.assets.push({
			asset : asset,
			facility : fac,
			organization : org,
		});
		if($scope.active.assets.length > 0) {$scope.initDataStartChartDraw();}//redraw if there is data to redraw
		return true;
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
		param.push('cyan');
	};
	$scope.removeColor = function (param) {
		param.pop();
	};
	
	$scope.logScope = function () {
		console.log($scope);
	};
	$scope.debug = function () {
		console.log($scope);
	};
	console.log($scope.dom + " ctrl is all done here!");
	$timeout(
					function () {
						if($scope.query !== undefined) { $scope.initDataStartChartDraw(); }
						else if($scope.inputRawData !== undefined) {$scope.initDataStartChartDraw();}
						else { $scope.queryData($scope.userParameters); }
					}, 0);
}])
.directive('ticketImpulse', ['chartIdService', '$timeout', function (chartIdService, $timeout) {
	return {
		restrict: "E",
		scope: {
			dom: "@", // allows the name of the chart to be assigned.  this name is the new scope variable created once a date is selected
			userParametersSidebar: "@",	//bool: true to show, false to hide. default true
			organizationSidebar: "@",
			inputUserParameters: "=userParameters",
			inputRawData: "=data",
			query: "="
		},
		compile : function (element, attrs) {
			//console.log(attrs);
			if ( !attrs.hasOwnProperty('dom') ) {
				attrs.dom = chartIdService.getNewId();
			}
			if ( !attrs.hasOwnProperty('userParametersSidebar') ) {
				attrs.userParametersSidebar = 'true';
			}
			if ( !attrs.hasOwnProperty('organizationSidebar') ) {
				attrs.organizationSidebar = 'true';
			}
			if ( !attrs.hasOwnProperty('query') ) {
				attrs.query = undefined;	//TODO: give dataService a getDefaultQuery option?
											//this can fetch user permissions, and return the best default query for user.
											//something like the first asset on the first facility the user has access to
			}
			if ( attrs.hasOwnProperty('data') ) {
				attrs.organizationSidebar = 'false'; //mostly because I don't want to deal with this usecase.
			}
		},
		templateUrl : "views/ticketImpulse.html",
		controller: 'ticketImpulseCtrl'
	}
}])
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'ticket-impulse';},
		configTag: function(){return 'ticket-impulse-config';},
		tagHtml: function(){return "<ticket-impulse></ticket-impulse>";},
		directiveName: function(){return 'ticketImpulse';},
		namespace: function(){return 'impulse'},
		paletteImage: function(){return 'tickImp.png';}
		});
}])
;

