'use strict';
angular.module('myApp.intervalDemand', ['ngRoute'])

.factory('intervalDemandChartService', ['$http', function($http){

	var _init = function (series, activeOrganizations, sortedData, userParameters) {
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
		var _tfYearMonthDay = d3.time.format("%Y-%m-%e"); //format for x-axis labels USED BY CSV INIT
		var _tfHour = d3.time.format("%H"); //format for x-axis labels USED BY CSV INIT
		var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
			//this is a function that parses lots of timestamp formats, so its convenient 
		chartHelper._activeOrganizations = activeOrganizations;
			//this stores all organizations that need to be drawn on the chart. this stores information like which meters,
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
				var key = new Date(d.timestamp).getHours()+1;
				var series = new Date(d.timestamp).getDay();
				
				var monthYearDay = new Date(d.timestamp);
				monthYearDay = _tfYearMonthDay(new Date(monthYearDay));
				
				return [key , series, monthYearDay];
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
			var scale = d3.scale.linear();
			chartHelper._chartParameters.domainX = scale.domain([1, 24]);
			
			chartHelper._chartParameters.xUnits = dc.units.integers;
			
			scale.ticks();
			chartHelper._chartParameters.tickFormat = scale.tickFormat();
		};
		
		chartHelper.createGroups = function () {
			//Start: create cumulative groups
			//these groups consider the entire dataset in question.
			chartHelper._groups.cumulativeMaxGroup = chartHelper._dimensions.masterDimension.group()
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
			
			chartHelper._groups.cumulativeAverageGroup = chartHelper._dimensions.masterDimension.group()
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
				
				var averageGroup = chartHelper._dimensions.masterDimension.group()
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
				var averageDemandChart = dc.lineChart(series)
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
				var maxDemandChart = dc.lineChart(series)
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
			
			var composedCharts = average ? chartHelper._charts.maxCharts : chartHelper._charts.averageCharts;
			series = series	//configure series graph object
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
				.colors(d3.scale.category20())
				
				.seriesAccessor(function (d) {return d.key[2]+', '+_dayStringArray[d.key[1]];})
				.keyAccessor(function (d) {return d.key[0];})
				.valueAccessor(function(p) {return (p.value.total/p.value.cnt); })
				.renderHorizontalGridLines(true)
				.renderVerticalGridLines(true)
				
				.x(chartHelper._chartParameters.domainX)
				.xUnits(chartHelper._chartParameters.xUnits) // sets X axis units
				.elasticX(true)
				//.elasticY(true)
				.legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
				.shareTitle(false)	//required so that each individual chart's titles are rendered, and series doesnt try to get its grubby hands on it
				.yAxisPadding("5%")	//WARNING: not in api, but xAxisScaling works. This was legit a stab in the dark.
				
				.mouseZoomable(true)
				.brushOn(false)
				.dimension(chartHelper._dimensions.masterDimension)
				.group(chartHelper._groups.cumulativeAverageGroup)
				.title(function(p) {return p.value[0]; })
				.renderTitle(true);
				
			series.xAxis().tickFormat(chartHelper._chartParameters.tickFormat); // sets the tick format to be the hour only
			
			series.render();
			return series;
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
.factory('intervalDemandDataService', ['$http', function($http) {
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
	
	var _getOrganizations = function () {	//TODO: Singleton changes	
		//this function queries the server for all existing organizations
		//it's messy since it technically grabs all information after the below hardcoded date,
		//and strings together a key value pair of all organizations, but whatever.
		var message = {
				"date": {
			        "$gt": {
			            "$date": "2014-10-22T22:02:48.488Z"
			        }
			    }
			};
		
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
		.success(
				function (data) {
					var organizationQuery = {};
					for(var i = 0, ilen = data.result.length; i < ilen; i++) { organizationQuery[data.result[i].organization] = '';	}//keeps track of all meters in query
					data.organizationQuery = organizationQuery;
				}
		)
		.error( function () { alert('fail to query data'); } );
	};
	var _getMeters = function (organization, activeOrganizations, userParameters) {	
		//this function queries the server for all existing meters and stores it under the _activeOrganizations entry
		//it's messy since it technically grabs all information after the below hardcoded date,
		//and strings together a key value pair of all organizations, but whatever.
		var message = {
			    "date": {
			        "$gt": {
			            "$date": "2014-10-15T22:02:48.488Z"
			        }
			    },
			    "organization" : organization ? organization : undefined
			};
		
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
		.success(
			function (data) {
				console.log(data);
				for(var i = 0, ilen = data.result.length; i < ilen; i++) {
					activeOrganizations[organization].meterQuery[data.result[i].name] = '';	//keeps track of all meters in query
				}
			}
		)
		.error( function () { alert('fail to query meters'); } );
	};

	var _getData = function (activeOrganizations, userParameters) {
		//this function queries for all meters outlined within the _activeOrganizations 
		if (Object.keys(activeOrganizations).length === 0) {
			activeOrganizations["ANDO"] = {
				"meter" : "SITE_kW",
				"meterQuery" : {
					"SITE_kW": '',
					"kWdiv": ''
				},
				'color' : 'rgba(127,127,55,0.5)'
			};
		}
		var or = [];
		for (var organization in activeOrganizations) {
			or.push(
				{
	            	"name": activeOrganizations[organization].meter,
	            	"organization": organization
	            }
			);
		}
		var message = {
				"date": {
					"$gte": {
						"$date": userParameters.lowDate ? userParameters.lowDate : undefined
					},
					"$lt": {
						"$date": userParameters.highDate ? userParameters.highDate : undefined
					}
				},
				"$or": or
			};
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
		.success(function(d) {
			return _successData(d, activeOrganizations);
		})
		.error( function () { alert('fail to query data'); } );
	};
	var _successData = function (data, activeOrganizations) {
		var dataArray = [];
		for(var i = 0, ilen = data.result.length; i < ilen; i++) {
			for(var j = 0, jlen = data.result[i].his.length; j < jlen; j++) {
				data.result[i].his[j].meterName = data.result[i].name;	//adds name of meter to the datapoint.
				data.result[i].his[j].organization = data.result[i].organization;
				
				if(activeOrganizations[data.result[i].organization].meter === data.result[i].name) {//marks actual
					data.result[i].his[j].type = 'meter';
				}
			}
			Array.prototype.push.apply(dataArray, data.result[i].his); //adds an array to an array. like a super push
			//_ndx.add(data.result[i].his);
		}
		var sorter = crossfilter.quicksort.by( function (d) {
			return new Date(d.timestamp); 
		});
		sorter(dataArray, 0, dataArray.length);
		data.sortedData = dataArray;
	};
	
	var _getOrganizationQuery =  function () {
		return _organizationQuery;
	};
	var _initActiveOrganization = function (organization, activeOrganizations) {
		activeOrganizations[organization] = {
			"meter" : "",
			"meterQuery" : {},
			'color' : 'rgba(0,255,255,0.5)'
		};
		_getMeters(organization, activeOrganizations);
	};
	
	_servObj = {
		getData : _getData,
		initActiveOrganization: _initActiveOrganization,
		getOrganizations: _getOrganizations,
		getOrganizationQuery: _getOrganizationQuery,
		getDefaultUserParameters: _getDefaultUserParameters
	};
	
	return _servObj;
}])
.controller('intervalDemandCtrl', 
['$scope', '$location', 'intervalDemandChartService',
'intervalDemandDataService', '$timeout', 'userIdService',
function($scope, $location, chartService, dataService, $timeout, userIdService) {
	$scope.showButtons = true;
	$scope.chartInit = false;
	var savedUserDetailsHelper; 
	if ($scope.userId !== undefined) {
	//should saved user parameters override any "compilation time" parameters?
	//the answer to that question will change this process
		savedUserDetailsHelper = userIdService.init($scope.userId);	//inits users specific version of widget
		
		var savedUserConfigs = savedUserDetailsHelper.getSavedParameters();
		console.log(savedUserConfigs);
		$scope.userParameters = savedUserConfigs.userParameters;
		$scope.userParametersSidebar = savedUserConfigs.userParametersSidebar;
		$scope.organizationSidebar = savedUserConfigs.organizationSidebar;
	}
	else {
		$scope.organizationSidebar = $scope.inputOrganizationSidebar;
		$scope.userParametersSidebar = $scope.inputUserParametersSidebar;
	}
	if ( ($scope.inputUserParameters === undefined)&&($scope.userParameters === undefined) ) {
		$scope.userParameters = dataService.getDefaultUserParameters();
	}
	else {
		//this is VERY specific functionality. The controller will copy the reference of the inputUserParameters,
		//then populate the missing properties. This is so any userParameter manipulation in this controller is
		//propagated outwardly
		var defaultUserParameters = dataService.getDefaultUserParameters();
		//console.log(defaultUserParameters);
		if ($scope.userParameters === undefined) {
			for(var property in defaultUserParameters) {
				if( $scope.inputUserParameters[property] === undefined ) {
					$scope.inputUserParameters[property] = defaultUserParameters[property];
				}
				
			}
			$scope.userParameters = $scope.inputUserParameters;
		}
		else { //user parameters defined by saved user details flow
			for(var property in defaultUserParameters) {
				if( $scope.userParameters[property] === undefined ) {
					$scope.userParameters[property] = defaultUserParameters[property];
				}
				
			}
		}
	}
	
	
	if ( ($scope.inputRawData !== undefined)&&($scope.directiveInputtedData === undefined) ) {	
		$scope.directiveInputtedData = $scope.inputRawData;
	}
	$scope.treatedData = {};
	$scope.active = {};
	$scope.activeOrganizations = {};
	$scope.inactiveOrganizations = {};
	console.log($scope.activeOrganizations);
	
	$scope.dom = $scope.chartId ? $scope.chartId : 'test_composed';
	$scope.timeSeries = 'intervalDemand: ' + $scope.dom;
	
	var series; //variable that stores the series chart generated by program
		//populated by redrawChart
	
	var userParameterWatches = function () {
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
	
	var http = function(response) {
		$scope.chartHelper = chartService.init(
			series,
			$scope.activeOrganizations,
			response.data.sortedData,
			$scope.userParameters
		);
		$scope.showButtons = false;
		try {
			series = $scope.chartHelper.drawChart(false);
			userParameterWatches();
		}
		catch (e) {
			console.error(e); // pass exception object to error handler
		}
		finally {
			$scope.showButtons = true;
		}
    };
	
	$scope.initDataDrawChart = function () {
		$scope.chartInit = true;
		if ($scope.directiveInputtedData === undefined) { //if there is no inputted data
			dataService.getData($scope.activeOrganizations, $scope.userParameters).then( http, function () {alert("epicfail");} );
		}
		else {
			$scope.showButtons = false;
			try {
				$timeout( function () {	//timeout necessary to make sure the DOM for chart has been fully instantiated
					series = dc.seriesChart("#"+$scope.dom); 
					userParameterWatches();
					$scope.chartHelper = chartService.init(
						series,
						$scope.activeOrganizations,
						$scope.directiveInputtedData,
						$scope.userParameters
					);
					series = $scope.chartHelper.drawChart(false);
				}, 0 );
			}
			catch (e) {
				console.error(e); // pass exception object to error handler
			}
			finally {
				$scope.showButtons = true;
			}
		}
	};
	$scope.redrawChart = function () {
		series = $scope.chartHelper.drawChart(false);
	};
	
	$scope.queryOrganizations = function () {
		dataService.getOrganizations().then( function (response) {
			$scope.organizationQuery = response.data.organizationQuery;
		});
	};
	$scope.deleteOrganization = function (organization) {
		if(organization in $scope.activeOrganizations) {
			delete $scope.activeOrganizations[organization];
		}
		else if(organization in $scope.inactiveOrganizations) {
			delete $scope.inactiveOrganizations[organization];
		}
		$scope.redrawChart();
	};
	$scope.initOrganization = function (organization) {
		dataService.initActiveOrganization(organization, $scope.activeOrganizations);
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
		console.log(Object.keys($scope.activeOrganizations).length);
	};
	$scope.debug = function () {
		console.log($scope.activeOrganizations);
	};
	if ($scope.directiveInputtedData === undefined) {
		$scope.queryOrganizations();
	}
	else {
		$scope.initDataDrawChart();
	}
}])
.factory('userIdService', ['$http', function($http) {
	var _init = function (userId) {
		//TODO: query database for user ID to populate variables between TODOs
		var helperObj = {};
		helperObj.userParametersSidebar = false;	//bool: true to show, false to hide. default true
		helperObj.organizationSidebar = false;
		helperObj.inputUserParameters = {
				"height": 500
			};
		//END TODO
		helperObj.getSavedParameters = function () {
			return {
				"userParameters": helperObj.inputUserParameters,
				"userParametersSidebar": helperObj.userParametersSidebar,
				"organizationSidebar": helperObj.organizationSidebar
			}

		}
		return helperObj;
	};
	
	return {
		init : _init
	};
}])
.directive('intervalDemand', ['chartIdService', 'userIdService', function (chartIdService, userIdService) {
	return {
		restrict: "E",
		scope: {
			chartId: "@", // allows the name of the chart to be assigned.  this name is the new scope variable created once a date is selected
			inputUserParametersSidebar: "@userParametersSidebar",	//bool: true to show, false to hide. default true
			inputOrganizationSidebar: "@organizationSidebar",
			inputUserParameters: "=userParameters",
			inputRawData: "=data",
			query: "=",
			userId: "@"
		},
		compile : function (element, attrs) {
		console.log(attrs);
			if ( !attrs.hasOwnProperty('chartId') ) {
				attrs.chartId = chartIdService.getNewId();
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
			if (attrs.userId !== undefined) {
			//should saved user parameters override any "compilation time" parameters?
			//the answer to that question will change this process
				var savedUserDetailsHelper = userIdService.init(attrs.userId);	//inits users specific version of widget
				
				var savedUserConfigs = savedUserDetailsHelper.getSavedParameters();
				console.log(savedUserConfigs);
				attrs.userParametersSidebar = savedUserConfigs.userParametersSidebar;
				attrs.organizationSidebar = savedUserConfigs.organizationSidebar;
				//TODO: toss this savedUserDetailsHelper onto the scope so controller doesnt have to requery
				//TODO: How will an http request-based savedUserDetails request function?
			}
		},
		templateUrl : "views/intervalDemand.html",
		controller: 'intervalDemandCtrl'
	}
}])
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'interval-demand';},
		configTag: function(){return 'interval-demand-config';},
		tagHtml: function(){return "<interval-demand user-parameters-sidebar=\"false\"></interval-demand>";},
		directiveName: function(){return 'intervalDemand';},
		namespace: function(){return 'interval'},
		paletteImage: function(){return 'intDem.png';}
		});
}])
;
