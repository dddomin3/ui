'use strict';
angular.module('myApp.ticketImpulse', ['ngRoute'])

.factory('ticketImpulseChartService', ['$http', function($http){

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
		var getDaysBetween = function(endDate, startDate){
			var daysBetween = Math.round((endDate - startDate)/(1000*60*60*24));
			
			return daysBetween;
		};
		var chartHelper = {};
		chartHelper._ndx = crossfilter(sortedData);
		chartHelper._dimensions = {};
			//stores all dimensions generated from data
			//holds a masterDimension key that should be the dimension that is currently used on the drawn chart.
		chartHelper._groups = {};
			//stores all groups connected to the chart. Is made from the masterDimension
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
		var _tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels USED BY CSV INIT
		var _tfMonthDayYear = d3.time.format("%m-%d-%Y"); //format for x-axis labels USED BY CSV INIT
		var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
			//this is a function that parses lots of timestamp formats, so its convenient 
		var _dayStringArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			//Date.getDay returns a number, which this array translates into the day fo week
		var _dayToColorMap = {
			"Sun": "rgba(229,  63,   0, .8)",
			"Mon": "rgba(222, 172,   0, .8)",
			"Tue": "rgba(156, 216,   0, .8)",
			"Wed": "rgba( 46, 210,   0, .8)",
			"Thu": "rgba(  0, 203,  56, .8)",
			"Fri": "rgba(  0, 197, 153, .8)",
			"Sat": "rgba(  0, 137, 191, .8)"
		};
		
		chartHelper.createDimensions = function () {
			//creates, chooses and populates dimensions.
			chartHelper._dimensions.hourDimension = chartHelper._ndx.dimension(function(d) {
				var timeObj = _tfIso(new Date(d.createdTime));
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
			chartHelper._chartParameters.domainX = d3.scale.linear().domain([+userParameters.lowDate, +userParameters.highDate])
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
			chartHelper._chartParameters.tickFormat = function(v) { return _tfMonthYear(new Date(v));};
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
				
				//.xUnits(chartHelper._chartParameters.xUnits) // sets X axis units
				.xUnits(chartHelper._chartParameters.xUnits)
				.x(chartHelper._chartParameters.domainX)
		        .dimension(chartHelper._dimensions.masterDimension)
		        .group(chartHelper._group)
				
		        .centerBar(true)
		        .barPadding(0.5)
				.title(function(p) {return p.value.mouseoverInfo; })
				.renderTitle(true)
				.valueAccessor(function(p) {return p.value.count; })
				
				.colors(userParameters.barColor)
				
				//.elasticX(true)
				//.elasticY(true)
				.legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
				//.yAxisPadding("5%")	//WARNING: not in api, but xAxisScaling works. This was legit a stab in the dark.
				
				.mouseZoomable(true)
				.brushOn(false);
			
			bar.xAxis().tickFormat(chartHelper._chartParameters.tickFormat); // sets the tick format to be the hour only
			
			dc.renderAll();
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
.factory('ticketImpulseDataService', ['$http', function($http) {
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	} 
	var _servObj = {};
		//this is what is returned by this factory
	var _getDefaultUserParameters = function () {
		return {
			width: 600,
			height: 200,
			barWidthPercentage: 8,
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
	
	var _getData = function (userParameters) {	//TODO: Singleton changes	
		//this function queries the server for all existing organizations
		//it's messy since it technically grabs all information after the below hardcoded date,
		//and strings together a key value pair of all organizations, but whatever.
		var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var today = new Date();
		var firstOfMonth = new Date(today.getFullYear(), today.getMonth()-6, 1);
		
		var requestString = requestString = {
			"createdTime": {
				"$gt": {"$date": ""+userParameters.lowDate.toJSON()},
				"$lt": {"$date": ""+userParameters.highDate.toJSON()}
			}
		};
		
		var config = {
				method: 'POST',
				headers: {'Collection':'Event'},
				url: mongoUrl,
				data: JSON.stringify(requestString)
		};
			
		var promise = $http(config).success(_successData)
		.error ( 
			function(e){console.error(e); return false;}
		);
		return promise;
	};
	
	var _successData = function(data, status, headers, config){
		console.log(data);
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
.directive('ticketImpulse', function () {
	return {
		restrict: "E",
		scope: {
			name: "=" // allows the name of the chart to be assigned.  this name is the new scope variable created once a date is selected
		},
		templateUrl : "views/ticketImpulse.html",
		controller: ['$scope', '$location', 'ticketImpulseChartService', 'ticketImpulseDataService', 
                    function($scope, $location, chartService, dataService) {
			$scope.timeSeries = 'ticketImpulse';
			$scope.showButtons = true;
			$scope.chartInit = false;
			$scope.userParameters = dataService.getDefaultUserParameters();
			$scope.inactiveOrganizations = {};
			$scope.treatedData = {};
			$scope.active = {};
			var bar;
				//populated by drawChart
			
			var populateScope = function () {
				//this function populates necessary variables onto the scope.
				$scope.masterDimension  = $scope.chartHelper.getMasterDimension();
				
				$scope.cumulativeAverageGroup = $scope.chartHelper.getCumulativeAverageGroup();
				$scope.cumulativeMaxGroup = $scope.chartHelper.getCumulativeMaxGroup();
				$scope.averageGroups = $scope.chartHelper.getAverageGroups();
				$scope.maxGroups = $scope.chartHelper.getMaxGroups();
				
				$scope.chartParameters = $scope.chartHelper.getChartParameters();
			};
			
			var http = function(response) {
				$scope.treatedData = response.data.treatedData;
				
				
				$scope.showButtons = false;
				//try {
					//populateScope();
					$scope.redrawChart();
					$scope.$watch('userParameters.barWidthPercentage', function(newVal, oldVal, scope) {
						$scope.redrawChart();
					});
					$scope.$watch('userParameters.height', function(newVal, oldVal, scope) {
						$scope.redrawChart();
					});
					$scope.$watch('userParameters.width', function(newVal, oldVal, scope) {
						$scope.redrawChart();
					});
					$scope.$watch('userParameters', function(newVal, oldVal, scope) {
						$scope.redrawChart();
					});
				// }
				// catch (e) {
					// console.error(e); // pass exception object to error handler
				// }
				// finally {
					$scope.showButtons = true;
				// }
			};
		  
			
			$scope.drawHttpChart = function () {
				$scope.chartInit = true;
				dataService.getData($scope.userParameters).then( http, function () {alert("epicfail");} );
			};
			$scope.redrawChart = function () {
				bar = dc.barChart("#test_composed");
				$scope.chartHelper = chartService.initFlatten(
					bar,
					$scope.active,
					$scope.userParameters
				);
				$scope.chartHelper.drawChart();
			};
			
			$scope.queryData = function () {
				dataService.getData($scope.userParameters).then( function (response) {
					$scope.treatedData = response.data.treatedData;
				});
			};
			$scope.deleteActive = function (org, fac, asset) {
				delete $scope.active[org][fac][asset];
				if( Object.keys($scope.active[org][fac]).length === 0) {	//deletes any empty entries
					delete $scope.active[org][fac];	
				}
				if( Object.keys($scope.active[org]).length === 0) {
					delete $scope.active[org];
				}
				$scope.redrawChart();
			};
			$scope.initAsset = function (org, fac, asset) {
				if($scope.active[org]) {	//if organization entry exists
					if($scope.active[org][fac]) {	//if facility entry exists
						if($scope.active[org][fac][asset]) { //if asset entry exists
							$scope.active[org][fac][asset].push($scope.treatedData[org][fac][asset]);	//add ticket to list
						}
						else {	//asset doesn't exist but org and fac do
							$scope.active[org][fac][asset] = $scope.treatedData[org][fac][asset];	//init asset. save ticket under asset
						}
					}
					else {	//facility doesn't exist, but org does
						$scope.active[org][fac] =	{};							//init facility
						$scope.active[org][fac][asset] = $scope.treatedData[org][fac][asset];	//init asset. save ticket under asset
					}
				}
				else {
					$scope.active[org] = {};								//init org
					$scope.active[org][fac] = {};							//init facility
					$scope.active[org][fac][asset] = $scope.treatedData[org][fac][asset];	//init asset. save ticket under asset
				}
			};
			$scope.countActiveOrganizations = function () {
				return Object.keys($scope.activeOrganizations).length;
			};
			$scope.countInactiveOrganizations = function () {
				return Object.keys($scope.inactiveOrganizations).length;
			};
			$scope.soloOrganization = function (soloOrg) {
				for(var organization in $scope.activeOrganizations) {
					if(soloOrg === organization) {continue;} //do not remove if it was the organization clicked
					$scope.inactiveOrganizations[organization] = $scope.activeOrganizations[organization];
					delete $scope.activeOrganizations[organization];
				}
				console.log({"active": $scope.activeOrganizations, "inactive": $scope.inactiveOrganizations});
				$scope.redrawChart();
			};
			$scope.hideOrganization = function (hideOrg) {
				$scope.inactiveOrganizations[hideOrg] = $scope.activeOrganizations[hideOrg];
				delete $scope.activeOrganizations[hideOrg];
				$scope.redrawChart();
			};
			$scope.unhideAllOrganizations = function () {
				for(var organization in $scope.inactiveOrganizations) {
					if(!(organization in $scope.activeOrganizations)) {
						$scope.activeOrganizations[organization] = $scope.inactiveOrganizations[organization];
					}
					delete $scope.inactiveOrganizations[organization];
				}
				$scope.redrawChart();
			};
			$scope.showOrganization = function (showOrg) {
				$scope.activeOrganizations[showOrg] = $scope.inactiveOrganizations[showOrg];
				delete $scope.inactiveOrganizations[showOrg];
				$scope.redrawChart();
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
				bar.redraw();
				console.log($scope);
			};
			$scope.debug = function () {
				console.log($scope);
			};

			$scope.queryData($scope.userParameters);
		}]
	}
})
;

