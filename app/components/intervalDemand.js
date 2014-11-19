'use strict';
angular.module('myApp.intervalDemand', ['ngRoute'])

.factory('intervalDemandDataService', ['$http', function($http){
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	} 
	var _servObj = {};
		//this is what is returned by this factory
	var _rawData;
	var _ndx;
	var _dimensions = {};
		//stores all dimensions generated from data
		//holds a masterDimension key that should be the dimension that is currently used on the drawn chart.
	var _groups = {};
		//stores all groups connected to the chart. Is made from the masterDimension
		//if the master dimension is changed, the groups should be recreated
	var _charts = {};
		//TODO: if the charts could be created on the service, this is where they would go
	var _userParameters = {
			width: 750,
			height: 680,
			marginLeft: 75,
			marginRight: 150,
			marginTop: 25,
			marginBottom: 40,
			lowDate: new Date((new Date((new Date()) - (28*24*60*60*1000))).toDateString()),
			highDate: new Date( (new Date()).toDateString() )
	};
		//this variable stores all user customizable values.
		//I envision that other services and controllers can also access these to either make the customization
		//nice, or to preset certain values
	var _chartParameters = {};
		//these are chart parameters that should be shared amongst generate charts
		//stuff like xAxis 
	var _tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels USED BY CSV INIT
	var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
		//this is a function that parses lots of timestamp formats, so its convienent 
	var _composite;
		//stores the composite graph that is generated by _initCompositeChart (sic)
	var _activeMeters = {};
	var _activeOrganizations = {};
	//this stores all organizations that need to be drawn on the chart. this stores information like which meters,
	var _organizationQuery = {};
		//stores the organization query. populated by _getOrganizations
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
	
	var _getOrganizations = function () {	
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
					for(var i = 0, ilen = data.result.length; i < ilen; i++) {
						_organizationQuery[data.result[i].organization] = '';	//keeps track of all meters in query
					}
				}
		)
		.error( function () { alert('fail to query data'); } );
	};
	var _getMeters = function (organization) {	
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
						_activeOrganizations[organization].meterQuery[data.result[i].name] = '';	//keeps track of all meters in query
					}
				}
		)
		.error( function () { alert('fail to query data'); } );
	};

	var _getData = function () {
		//this function queries for all meters outlined within the _activeOrganizations actual and expected keys
		var or = [];
		for (var organization in _activeOrganizations) {
			or.push(
				{
	            	"name": _activeOrganizations[organization].meter,
	            	"organization": organization
	            }
			);
		}
		var message = {
				"date": {
					"$gte": {
						"$date": _userParameters.lowDate ? _userParameters.lowDate : undefined
					},
					"$lt": {
						"$date": _userParameters.highDate ? _userParameters.highDate : undefined
					}
				},
				"$or": or
			};
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
		.success(_successData)
		.error( function () { alert('fail to query data'); } );
	};
	var _successData = function (data) {
		_rawData = data;
		var dataArray = [];
		//_ndx = crossfilter();
		console.log(data);
		for(var i = 0, ilen = data.result.length; i < ilen; i++) {
			for(var j = 0, jlen = data.result[i].his.length; j < jlen; j++) {
				data.result[i].his[j].meterName = data.result[i].name;	//adds name of meter to the datapoint.
				data.result[i].his[j].organization = data.result[i].organization;
				
				if(_activeOrganizations[data.result[i].organization].meter === data.result[i].name) {//marks actual
					data.result[i].his[j].type = 'meter';
				}
				_activeMeters[data.result[i].name] = '';	//keeps track of all meters that the chart currently has data for
				//TODO:Remove_activeMeters? 
			}
			Array.prototype.push.apply(dataArray, data.result[i].his); //adds an array to an array. like a super push
			//_ndx.add(data.result[i].his);
		}
		var sorter = crossfilter.quicksort.by( function (d) {
			return new Date(d.timestamp); 
		});
		sorter(dataArray, 0, dataArray.length);
		console.log(dataArray);
		_ndx = crossfilter(dataArray);

		_chartParameters.daysBetween = (_userParameters.highDate - _userParameters.lowDate)/(1000*60*60*24);
		
		_createDimensions();
		_createDomain();
        _createGroups();
        
		console.log('success????');
		//TODO: this is the extent of below, lol.
	};
	var getDaysBetween = function(endDate, startDate){
    	var _daysBetween = Math.round((endDate - startDate)/(1000*60*60*24));
    	
    	return _daysBetween;
    };
    
	var _createDimensions = function () {
		//creates, chooses and populates dimensions.
	    _dimensions.hourDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; }
	    	var ret = d3.time.hour(_tfIso(d.timestamp));
	    	ret.meterName = d.meterName;	//retains meter name on value. Since its a Date object, the toString function
	    	//(or whatever dc decides is the important/common return) will be the same even if the datapoints
	    	//have different 'name' keys
	    	var displayDate = d3.time.format("%H");
	    	var hour = displayDate(new Date(ret));
	    	return +hour;
	    }); // creates the x-axis components using their date as a guide
	    _dimensions.quarterDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; } 
	    	var ret = d3.time.minute(_tfIso(d.timestamp));
	    	ret.meterName = d.meterName;
	    	return ret;
	    });
	    _dimensions.minuteDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; }
	    	var ret = d3.time.minute(_tfIso(d.timestamp));
	    	ret.meterName = d.meterName;
	    	return ret;
	    });
	    
  		_dimensions.masterDimension = _dimensions.hourDimension;
	};
	
	var _createDomain = function () {     
        _chartParameters.domainX = d3.scale.linear().domain([1, 24]);
        _chartParameters.xUnits = dc.units.integers;
		var displayDate = d3.time.format("%H"); // function to change the format of a date object to hour
		_chartParameters.tickFormat = function(v) {return +v;};
	};
	
	var _createGroups = function () {
	    //Start: create cumulative groups
	    //these groups consider the entire dataset in question.
	    _groups.cumulativeMaxGroup = _dimensions.masterDimension.group(function(v) {
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
	    
	    _groups.cumulativeAverageGroup = _dimensions.masterDimension.group(function(v) {
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
	    
		var daysBetween = getDaysBetween(_userParameters.highDate,_userParameters.lowDate);
		//Per Day Groups
	    _groups.averageGroups = [];
	    _groups.maxGroups = [];
	    while(daysBetween) {
	    	var day = new Date( _userParameters.highDate - (1000*60*60*24)*daysBetween );
	    	var dayOfWeek = day.getDay();
	    	
	    	var averageGroup = _dimensions.masterDimension.group(
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
	    	_groups.averageGroups.push(averageGroup);
	    	
	    	var maxGroup = _dimensions.masterDimension.group(function(v) {
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
	    	_groups.maxGroups.push(maxGroup);
	    	
	    	
	    	daysBetween--;
	    }
	};
	
	var _meterIsntConsumption = function (meterName) {
		var regex = /kWh/ig;
		return !regex.test(meterName);
	};
	var _meterIsConsumption = function (meterName) {
		return !_meterIsntConsumption(meterName);
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
	
	var _getCumulativeMaxGroup = function () { 
		return _groups.cumulativeMaxGroup;
	};
	var _getCumulativeAverageGroup = function () {
		return _groups.cumulativeAverageGroup;
	};
	
	var _getAverageGroups = function () {
		return _groups.averageGroups;
	};
	var _getMaxGroups = function () {
		return _groups.maxGroups;
	};
	
	var _getRawData = function () {
		return _rawData;
	};
	
	var _getOrganizationQuery =  function () {
		return _organizationQuery;
	};
	var _getActiveOrganizations = function () {
		return _activeOrganizations;
	};
	var _deleteActiveOrganization = function (organization) {
		delete _activeOrganizations[organization];
	};
	var _initActiveOrganization = function (organization) {
		_activeOrganizations[organization] = {
				"meter" : "",
				"meterQuery" : {},
				'color' : 'rgba(0,255,255,0.5)',
				'groups' : {
					'meter' : {},
					'savings' : {},
					'cumulativeSavings': {}
				}
		};
		_getMeters(organization);
	};
	
	_servObj = {
		getData : _getData,
		getMeters : _getMeters,
		getOrganizations: _getOrganizations,
		
		getMasterDimension : _getMasterDimension,
		
		getCumulativeMaxGroup : _getCumulativeMaxGroup,
		getCumulativeAverageGroup : _getCumulativeAverageGroup,
		
		getAverageGroups : _getAverageGroups,
		getMaxGroups : _getMaxGroups,
		
		getChartParameters : _getChartParameters,
		getUserParameters : _getUserParameters,
		
		getRawData : _getRawData,
		getOrganizationQuery : _getOrganizationQuery,
		getActiveOrganizations : _getActiveOrganizations,
		initActiveOrganization : _initActiveOrganization,
		deleteActiveOrganization : _deleteActiveOrganization  
	};
	
	return _servObj;
}])
.controller('intervalDemandCtrl', ['$scope', '$location', '$route', 'intervalDemandDataService', 
                    function($scope, $location, $route, dataService) {
	$scope.timeSeries = 'intervalDemand';
	$scope.showButtons = true;
	$scope.chartInit = false;
	$scope.userParameters = dataService.getUserParameters();
	$scope.activeOrganizations = dataService.getActiveOrganizations();
	$scope.inactiveOrganizations = {};
	$scope.average = true;
	console.log($scope.activeOrganizations);
	
	var composite = dc	.compositeChart("#test_composed") //variable that stores the composite chart generated by program
						.shareTitle(false)	//required so that each individual chart's titles are rendered, and composite doesnt try to get its grubby hands on it
						.yAxisPadding("5%");	//WARNING: not in api, but xAxisScaling works. This was legit a stab in the dark.
	//populated by drawChart
	var drawChart = function () {
		var lX = $scope.userParameters.width - $scope.userParameters.marginRight + 25,
			lY = $scope.userParameters.height - 650;
		//legend coords
		var charts = {}
		charts.averageCharts = [];
		for(var i = 0, len = $scope.averageGroups.length; i < len; i++) {
			var averageDemandChart = dc.lineChart(composite)
		        .dimension($scope.masterDimension)
		        .interpolate("cardinal")
		        .colors($scope.averageGroups[i].color)
		        .group(
		        		$scope.averageGroups[i], 
		        		$scope.averageGroups[i].day
		        		)
		        .valueAccessor(function(p) {return p.value.total/p.value.cnt; })
		        .title(function(p) {return (p.value.total/p.value.cnt);})
		        .renderTitle(true)
		        .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
		        .tension(0.5)
		        .defined(function (d) {if(d.data.value.total/d.data.value.cnt < 100) {return false;} else {return true;}});//doesn't draw values less than 100
			charts.averageCharts.push(averageDemandChart)
		}
		
		charts.maxCharts = [];
		for(var i = 0, len = $scope.maxGroups.length; i < len; i++) {
			var maxDemandChart = dc.lineChart(composite)
		        .dimension($scope.masterDimension)
		       // .interpolate("cardinal")
		        .colors($scope.maxGroups[i].color)
		        .group(
		        		$scope.maxGroups[i], 
		        		$scope.maxGroups[i].day
		        		)
		        .valueAccessor(function(p) {return p.value[0]; })
		        .renderTitle(true)
		        .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
		        .tension(0.5)
				.defined(function (d) {if(d.data.value[0] < 100) {return false;} else {return true;}});//doesn't draw values less than 100
			charts.maxCharts.push(maxDemandChart)
		}
		
		composite.xAxis().tickFormat($scope.chartParameters.tickFormat); // sets the tick format to be the month/year only
		var composedCharts = $scope.average ? charts.averageCharts : charts.maxCharts;
		composite	//configure composite graph object
			.width($scope.userParameters.width) //sets width
			.height($scope.userParameters.height)
			.margins({
				left: $scope.userParameters.marginLeft,
				right: $scope.userParameters.marginRight,
				top: $scope.userParameters.marginTop,
				bottom: $scope.userParameters.marginBottom
			})
			.compose(composedCharts)
			.renderTitle(true)
			
			.x($scope.chartParameters.domainX)
			.xUnits($scope.chartParameters.xUnits) // sets X axis units
			.xAxisLabel("Date/Time")
			.elasticX(true)

			//.elasticY(true)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.yAxisLabel("kWh")
			.legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
	
			.mouseZoomable(true)

			.brushOn(false);
	    
	    dc.renderAll();
	    return composite;
	};
	
	var populateScope = function () {
		//this function populates necessary variables onto the scope.
		$scope.masterDimension  = dataService.getMasterDimension();
        
        $scope.cumulativeAverageGroup = dataService.getCumulativeAverageGroup();
        $scope.cumulativeMaxGroup = dataService.getCumulativeMaxGroup();
        $scope.averageGroups = dataService.getAverageGroups();
        $scope.maxGroups = dataService.getMaxGroups();
        
        $scope.chartParameters = dataService.getChartParameters();
	};
	
	var http = function(data) {
		$scope.showButtons = false;
        
		populateScope();
        
        composite = drawChart();
        $scope.showButtons = true;
    };
  
	
	$scope.drawHttpChart = function () {
		$scope.chartInit = true;
		dataService.getData().then( http, function () {alert("epicfail");} );
	};
	$scope.redrawChart = function () {
		composite = drawChart();
	};
	
	$scope.queryOrganizations = function () {
		dataService.getOrganizations().then( function () {
			$scope.organizationQuery = dataService.getOrganizationQuery();
		});
	};
	$scope.deleteOrganization = function (organization) {
		if(organization in $scope.activeOrganizations) {
			dataService.deleteActiveOrganization(organization);
		}
		else if(organization in $scope.inactiveOrganizations) {
			delete $scope.inactiveOrganizations[organization];
		}
		$scope.redrawChart();
	};
	$scope.initOrganization = function (organization) {
		dataService.initActiveOrganization(organization);
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

	$scope.queryOrganizations();
}]);