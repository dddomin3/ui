'use strict';
angular.module('myApp.ticketImpulse', ['ngRoute'])

.factory('ticketImpulseChartService', ['$http', function($http){

	var _init = function (composite, sortedData, userParameters) {
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
			//TODO: this is where i would put my charts... IF I HAD ONE
		chartHelper._userParameters = userParameters;
			//this variable stores all user customizable values.
			//I envision that other services and controllers can also access these to either make the customization
			//nice, or to preset certain values
		chartHelper._chartParameters = {
			"daysBetween": getDaysBetween(chartHelper._userParameters.highDate, chartHelper._userParameters.lowDate)
		};
			//these are chart parameters that should be shared amongst generate charts
			//stuff like xAxis 
		var _tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels USED BY CSV INIT
		var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
			//this is a function that parses lots of timestamp formats, so its convenient 
		var _dayStringArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			//Date.getDay returns a number, which this array translates into the day fo week
		var _dayToColorMap = {
				"Sun": "rgba(229,63,0,.8)",
				"Mon": "rgba(222,172,0,.8)",
				"Tue": "rgba(156, 216,0,.8)",
				"Wed": "rgba(46, 210, 0, .8)",
				"Thu": "rgba(0, 203, 56, .8)",
				"Fri": "rgba(0, 197, 153, .8)",
				"Sat": "rgba(0, 137, 191, .8)"
		};
		
		chartHelper.createDimensions = function () {
			//creates, chooses and populates dimensions.
			chartHelper._dimensions.hourDimension = chartHelper._ndx.dimension(function(d) {
				if(d.timestamp === undefined) { d.timestamp = d.date; }
				var ret = d3.time.hour(_tfIso(d.timestamp));
				ret.meterName = d.meterName;	//retains meter name on value. Since its a Date object, the toString function
				//(or whatever dc decides is the important/common return) will be the same even if the datapoints
				//have different 'name' keys
				var displayDate = d3.time.format("%H");
				var hour = displayDate(new Date(ret));
				return +hour;
			}); // creates the x-axis components using their date as a guide
			chartHelper._dimensions.quarterDimension = chartHelper._ndx.dimension(function(d) {
				if(d.timestamp === undefined) { d.timestamp = d.date; } 
				var ret = d3.time.minute(_tfIso(d.timestamp));
				ret.meterName = d.meterName;
				return ret;
			});
			chartHelper._dimensions.minuteDimension = chartHelper._ndx.dimension(function(d) {
				if(d.timestamp === undefined) { d.timestamp = d.date; }
				var ret = d3.time.minute(_tfIso(d.timestamp));
				ret.meterName = d.meterName;
				return ret;
			});
			
			chartHelper._dimensions.masterDimension = chartHelper._dimensions.hourDimension;
		};
		
		chartHelper.createDomain = function () {     
			chartHelper._chartParameters.domainX = d3.scale.linear().domain([1, 24]);
			chartHelper._chartParameters.xUnits = dc.units.integers;
			var displayDate = d3.time.format("%H"); // function to change the format of a date object to hour
			chartHelper._chartParameters.tickFormat = function(v) {return +v;};
		};
		
		chartHelper.createGroups = function () {
			//Start: create cumulative groups
			//these groups consider the entire dataset in question.
			chartHelper._groups.cumulativeMaxGroup = chartHelper._dimensions.masterDimension.group(function(v) {
				var displayDate = d3.time.format("%H"); // function to change the format of a date object to mm-yyyy
				return displayDate(new Date(v));
				})
				.reduce(
					//groups a value for each entry in the dimension by finding the total aggregated savings
					function (p,v) {
						return v.value > p ? v.value : p;	//returns the higher of the two values
					},	
					function (p,v) {
						return p;
						//how can we do this?
						//make array, sort array, max is 0th index
					},
					function () {
						return 0;
					}	
				);
			//_groups.maxGroup.organization = "Total";
			
			chartHelper._groups.cumulativeAverageGroup = chartHelper._dimensions.masterDimension.group(function(v) {
					return v+1;
				})
				.reduce(
					//groups a value for each entry in the dimension by finding the total aggregated savings
					function (p,v) {
						p.cnt++;
						p.total += +v.value;
						return p;	
					},	
					function (p,v) {
						p.cnt--;
						p.total -= +v.value;
						return p;
					},
					function () {
						var init = {}
						init.total = 0;
						init.cnt = 0;
						return init;
				})
				.order(function (p) { return p.total/p.cnt;});	//makes sure group is ordered by average
			
			var averageReduceAddGenerator = function (dayOfWeek) {
				return function (p,v) {
					var dataOfWeek = _tfIso(v.timestamp).getDay();
					if(dataOfWeek === dayOfWeek) {	//compares inputed dayOfWeek to data's day of week
						p.cnt++;
						p.total += +v.value;	
					}
					return p;
				}
			};
			var averageReduceRemoveGenerator = function (dayOfWeek) {
				return function (p,v) {
				var dataOfWeek = _tfIso(v.timestamp).getDay();
				if(dataOfWeek === dayOfWeek) {
						p.cnt--;
						p.total -= +v.value;
					}
				return p;
				}
			};
			var averageReduceInitGenerator = function () {
				return function () {
					var init = {}
					init.total = 0;
					init.cnt = 0;
					return init;
				}
			};
			var averageOrder = function (p) {
				return p.total/p.cnt;
			};
			
			//TODO:make array, sort array, max is 0th index
			var maxReduceAddGenerator = function (dayOfWeek) {
				return function (p,v) {
					var dataOfWeek = _tfIso(v.timestamp).getDay();
					if(dataOfWeek === dayOfWeek) {	//compares inputed dayOfWeek to data's day of week
						p.push(v.value);
						p.sort(function(a,b) {return b > a;});
					}
					return p;
				};
			};
			var maxReduceRemoveGenerator = function (dayOfWeek) {
				return function (p,v) {
					var dataOfWeek = _tfIso(v.timestamp).getDay();
					if(dataOfWeek === dayOfWeek) {
						return p;
						//this is broken without doing: TODO:make array, sort array, max is 0th index
					}
					else return p;
				};
			};
			var maxReduceInitGenerator = function () {
				return function () {
					return [0];
				};
			};
			var maxOrder = function (p) {
				console.log(p);
				return p[0];
			};
			
			var daysBetween = chartHelper._chartParameters.daysBetween;
			//Per Day Groups
			chartHelper._groups.averageGroups = [];
			chartHelper._groups.maxGroups = [];
			while(daysBetween) {
				var day = new Date( chartHelper._userParameters.highDate - (1000*60*60*24)*daysBetween );
				var dayOfWeek = day.getDay();
				
				var averageGroup = chartHelper._dimensions.masterDimension.group(
					function(v) {
						return v+1;
					})
					.reduce(
						averageReduceAddGenerator(dayOfWeek),	
						averageReduceRemoveGenerator(dayOfWeek),
						averageReduceInitGenerator()
					)
					.order( averageOrder );//makes sure group is ordered by average
				averageGroup.day = _dayStringArray[dayOfWeek]+ " Average";
				averageGroup.color = _dayToColorMap[_dayStringArray[dayOfWeek]];
				chartHelper._groups.averageGroups.push(averageGroup);
				
				var maxGroup = chartHelper._dimensions.masterDimension.group(function(v) {
						return v+1;
					})
					.reduce(
							maxReduceAddGenerator(dayOfWeek),	
							maxReduceRemoveGenerator(dayOfWeek),
							maxReduceInitGenerator()
					)
					.order( maxOrder );	//makes sure group is ordered by max
				maxGroup.day = _dayStringArray[dayOfWeek] + " Max";
				maxGroup.color = _dayToColorMap[_dayStringArray[dayOfWeek]];
				chartHelper._groups.maxGroups.push(maxGroup);
				
				
				daysBetween--;
			}
		};
		
		chartHelper.drawChart = function (average) {
			var lX = chartHelper._userParameters.width - chartHelper._userParameters.marginRight + 25,
				lY = chartHelper._userParameters.height - 650;
			//legend coords
			chartHelper._charts.averageCharts = [];
			for(var i = 0, len = chartHelper._groups.averageGroups.length; i < len; i++) {
				var averageDemandChart = dc.lineChart(composite)
					.dimension(chartHelper._dimensions.masterDimension)
					.interpolate("cardinal")
					.colors(chartHelper._groups.averageGroups[i].color)
					.group(
							chartHelper._groups.averageGroups[i], 
							chartHelper._groups.averageGroups[i].day
					)
					.valueAccessor(function(p) {return (p.value.total/p.value.cnt); })
					.title(function(p) {return (p.value.total/p.value.cnt)+" "+p.value.total+" "+p.value.cnt;})
					.renderTitle(true)
					.renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
					.tension(0.5)
					.defined(function (d) {if(d.data.value.total/d.data.value.cnt < 100) {return false;} else {return true;}});//doesn't draw values less than 100
				chartHelper._charts.averageCharts.push(averageDemandChart)
			}
			
			chartHelper._charts.maxCharts = [];
			for(var i = 0, len = chartHelper._groups.maxGroups.length; i < len; i++) {
				var maxDemandChart = dc.lineChart(composite)
					.dimension(chartHelper._dimensions.masterDimension)
					.interpolate("cardinal")
					.colors(chartHelper._groups.maxGroups[i].color)
					.group(
							chartHelper._groups.maxGroups[i], 
							chartHelper._groups.maxGroups[i].day
					)
					.valueAccessor(function(p) {return p.value[0]; })
					.title(function(p) {return p.value[0]; })
					.renderTitle(true)
					.renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
					.tension(0.5)
					.defined(function (d) {if(d.data.value[0] < 100) {return false;} else {return true;}});//doesn't draw values less than 100
				chartHelper._charts.maxCharts.push(maxDemandChart)
			}
			
			composite.xAxis().tickFormat(chartHelper._chartParameters.tickFormat); // sets the tick format to be the hour only
			var composedCharts = average ? chartHelper._charts.maxCharts : chartHelper._charts.averageCharts;
			composite	//configure composite graph object
				.width(chartHelper._userParameters.width)
				.height(chartHelper._userParameters.height)
				.xAxisLabel("Hour")
				.yAxisLabel("kW")
				.margins({
					left: chartHelper._userParameters.marginLeft,
					right: chartHelper._userParameters.marginRight,
					top: chartHelper._userParameters.marginTop,
					bottom: chartHelper._userParameters.marginBottom
				})
				
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				
				.x(chartHelper._chartParameters.domainX)
				.xUnits(chartHelper._chartParameters.xUnits) // sets X axis units
				.elasticX(true)
				//.elasticY(true)
				.legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
				.shareTitle(false)	//required so that each individual chart's titles are rendered, and composite doesnt try to get its grubby hands on it
				.yAxisPadding("5%")	//WARNING: not in api, but xAxisScaling works. This was legit a stab in the dark.
				
				.mouseZoomable(true)
				.brushOn(false)
				
				.compose(composedCharts);
			
			dc.renderAll();
			return composite;
		};
		
		chartHelper.meterIsntConsumption = function (meterName) {
			var regex = /kWh/ig;
			return !regex.test(meterName);
		};
		chartHelper.meterIsConsumption = function (meterName) {
			return !chartHelper._meterIsntConsumption(meterName);
		};
		chartHelper.getUserParameters = function () {
			return chartHelper._userParameters;
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
		chartHelper.createDomain();
        chartHelper.createGroups();
		
		return chartHelper;
	};
	
	return {
		init : _init
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
			width: 750,
			height: 680,
			marginLeft: 75,
			marginRight: 150,
			marginTop: 25,
			marginBottom: 40,
			lowDate: new Date((new Date((new Date()) - (28*24*60*60*1000))).toDateString()),
			highDate: new Date( (new Date()).toDateString() )
		};
	};
	
	var _dayToColorMap = {
			"Sun": "rgba(229,63,0,.8)",
			"Mon": "rgba(222,172,0,.8)",
			"Tue": "rgba(156, 216,0,.8)",
			"Wed": "rgba(46, 210, 0, .8)",
			"Thu": "rgba(0, 203, 56, .8)",
			"Fri": "rgba(0, 197, 153, .8)",
			"Sat": "rgba(0, 137, 191, .8)"
	};
	
	var _getData = function () {	//TODO: Singleton changes	
		//this function queries the server for all existing organizations
		//it's messy since it technically grabs all information after the below hardcoded date,
		//and strings together a key value pair of all organizations, but whatever.
		var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var today = new Date();
		var firstOfMonth = new Date(today.getFullYear(), today.getMonth()-6, 1);
		
		var requestString = requestString = {
			"createdTime": {
				"$gt": {"$date": ""+firstOfMonth.toJSON()},
				"$lt": {"$date": ""+today.toJSON() }
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
.controller('ticketImpulseCtrl', ['$scope', '$location', 'ticketImpulseChartService', 'ticketImpulseDataService', 
                    function($scope, $location, chartService, dataService) {
	$scope.timeSeries = 'ticketImpulse';
	$scope.showButtons = true;
	$scope.chartInit = false;
	$scope.userParameters = dataService.getDefaultUserParameters();
	$scope.inactiveOrganizations = {};
	$scope.treatedData = {};
	$scope.active = {};
	console.log($scope.activeOrganizations);
	
	var composite = dc	.compositeChart("#test_composed"); //variable that stores the composite chart generated by program
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
		$scope.chartHelper = chartService.init(
			composite,
			response.data.treatedData,
			$scope.userParameters
		);
		$scope.showButtons = false;
		try {
			//populateScope();
			composite = $scope.chartHelper.drawChart(false);
		}
		catch (e) {
			console.error(e); // pass exception object to error handler
		}
		finally {
			$scope.showButtons = true;
		}
    };
  
	
	$scope.drawHttpChart = function () {
		$scope.chartInit = true;
		dataService.getData($scope.userParameters).then( http, function () {alert("epicfail");} );
	};
	$scope.redrawChart = function () {
		composite = $scope.chartHelper.drawChart(false);
	};
	
	$scope.queryData = function () {
		dataService.getData().then( function (response) {
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
		console.log($scope);
	};
	$scope.debug = function () {
		console.log($scope);
	};

	$scope.queryData();
}]);