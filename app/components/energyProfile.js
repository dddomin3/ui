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
	var _rawData;
	var _ndx;
	var _dimensions = {};
	var _groups = {};
	var _charts = {};
	var _userParameters = {
			actualColor : 'rgba(0,0,255,0.9)',
			expectedColor : 'rgba(255,0,0,0.9)',
			cumulativeColor : 'rgba(0,0,0,0.5)',
			width: 750,
			height: 680,
			marginLeft: 75,
			marginRight: 150,
			marginTop: 25,
			marginBottom: 40,
			lowDate: new Date((new Date()) - (28*24*60*60*1000)),
			highDate: new Date()
	};
	var _chartParameters = {};
	var _tfMonthYear = d3.time.format("%m-%Y"); //format for x-axis labels USED BY CSV INIT
	var _tfIso = d3.time.format.iso.parse; //TODO: maybe the service can populate the users scope with convienence values like this?
	var _composite;
	var _activeMeters = {};
	var _activeOrganizations = {};
	var _organizationQuery = {};

	var _getOrganizations = function () {	
		//this function queries the server for all existing organizations
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
		//this function queries the server for all existing meters
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
		var or = [];
		for (var organization in _activeOrganizations) {
			or.push(
				{
	            	"name": _activeOrganizations[organization].actual,
	            	"organization": organization
	            },
	            {
	            	"name": _activeOrganizations[organization].expected,
	            	"organization": organization
	            }
			)
		}
		var message = {
				"date": {
					"$gt": {
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
				
				if(_activeOrganizations[data.result[i].organization].actual === data.result[i].name) {//marks actual
					data.result[i].his[j].type = 'actual';
				}
				else if(_activeOrganizations[data.result[i].organization].expected === data.result[i].name) {//marks expected
					data.result[i].his[j].type = 'expected';
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
        
		console.log('success????');
		//TODO: this is the extent of below, lol.
	};
	
	var _csvInit = function (energyData) {
	        var totalSum = 0;
	        _activeOrganizations.ANDO = {
				'actual' : '',
				'expected' : '',
				'meterQuery' : {},
				'color': 'rgba(64,128,128,0.5)',
				'groups' : {
					'actual' : {},
					'expected' : {},
					'savings' : {},
					'cumulativeSavings': {}
				}
			};
			_activeOrganizations.GLOB = {
				'actual' : '',
				'expected' : '',
				'meterQuery' : {},
				'color' : 'rgba(0,255,255,0.5)',
				'groups' : {
					'actual' : {},
					'expected' : {},
					'savings' : {},
					'cumulativeSavings': {}
				}
			};
				
	        _groups.savingsGroups = [];
	        _groups.expectedGroups = [];
	        _groups.actualGroups = [];
	        _groups.cumulativeSavingsGroups = [];
	        
			_ndx = crossfilter(energyData);
			
			_dimensions.masterDimension = _ndx.dimension(function(d) { return d3.time.month(_tfIso(d.date)); });
			
			_groups.totalActualGroup= _dimensions.masterDimension.group().reduceSum(function(d) { return +d.actualKWH; });
			_groups.totalActualGroup.organization = "Fake";
			
			_groups.totalExpectedGroup = _dimensions.masterDimension.group().reduceSum(function(d) { return +d.expectedKWH; });
			_groups.totalExpectedGroup.organization = "Fake";
			
			
			var savingsReduceSumGenerator = function (organization) {
				return function(d) {
					if(organization === "ANDO") {
						return .66*d.savings;
					}
					else {
						return .33*d.savings;
					}
				}
			};
			var expectedReduceSumGenerator = function (organization) {
				return function(d) {
	        		if(organization === 'ANDO') {return d.expected*0.66;}
	        		else if(organization === 'GLOB') {return d.expected*0.33;}
	        		else {return 0;}
				};
			};
			var actualReduceSumGenerator = function (organization) {
				return function(d) {
					if(organization === 'ANDO') {return d.actual*0.66;}
	        		else if(organization === 'GLOB') {return d.actual*0.33;}
	        		else {return 0;}
				};
			};
			
			for(var organization in _activeOrganizations) {//generating individual groups
				var savingsGroup = _dimensions.masterDimension.group().reduceSum(savingsReduceSumGenerator(organization));
				savingsGroup.organization = organization;
				_groups.savingsGroups.push(savingsGroup);
				_activeOrganizations[organization].groups.savings = savingsGroup;
				
				var actualGroup = _dimensions.masterDimension.group().reduceSum(actualReduceSumGenerator(organization));
				actualGroup.organization = organization;	//saving organization on group
	        	_groups.actualGroups.push(actualGroup);
	        	_activeOrganizations[organization].groups.actual = actualGroup;
	        	
	        	var expectedGroup = _dimensions.masterDimension.group().reduceSum(expectedReduceSumGenerator(organization));
				expectedGroup.organization = organization;
	        	_groups.expectedGroups.push(expectedGroup);
	        	_activeOrganizations[organization].groups.expected = expectedGroup;
			}
			
			//_groups.savingsGroups[multi-1] = _dimensions.masterDimension.group().reduceSum(function(d) { return multi*d.savings; });
			//_groups.savingsGroups[multi-1].meterName = "Fake "+(multi);
			//yeah, i just did multi-1. I live dangerously.
			
			_chartParameters.minDate = _dimensions.masterDimension.bottom(1)[0]; // sets the lowest date value from the available data
	        _chartParameters.maxDate = _dimensions.masterDimension.top(1)[0]; // sets the highest date value from the available data
	        
	        _chartParameters.domainX = d3.scale.linear().domain([_chartParameters.minDate, _chartParameters.maxDate]);

	        console.log([_chartParameters.minDate, _chartParameters.maxDate]);
	        
			var totalCumulativeSum = 0;
			_groups.totalCumulativeSavingsGroup = _dimensions.masterDimension.group().reduce(
				//groups a value for each entry in the dimension by finding the total aggregated savings
				function (p,v) {
					totalCumulativeSum = (+v.savings) + totalCumulativeSum;	//positive if expected, negative if actual
					return totalCumulativeSum;
				},	// sets the method for adding an entry into the total
				function (p,v) {
					totalCumulativeSum = totalCumulativeSum-v.savings;
					return totalCumulativeSum;
				},	// sets the method for removing an entry from the total
				function () {
					return totalCumulativeSum;
				}	// sets the method for initializing the total
			);
			_groups.totalCumulativeSavingsGroup.organization = "Fake";
			
	        _chartParameters.xUnits = d3.time.months;
	        _chartParameters.tickFormat = function(v) {return _tfMonthYear(new Date(v));};
	        
			console.log("Dummy Data!");
	};
	
	var _createDimensions = function () {
		//_dimensions.masterDimension = _ndx.dimension(function(d) { return parse(d.date).getMonth()+1;});
	    var monthDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; }
	    	var ret = d3.time.month(_tfIso(d.timestamp));
	    	ret.meterName = d.meterName;	//retains meter name on value. Since its a Date object, the toString function
	    	//(or whatever dc decides is the important/common return) will be the same even if the datapoints
	    	//have different 'name' keys
	    	return ret;
	    }); // creates the x-axis components using their date as a guide
	    var weekDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; } 
	    	var ret = d3.time.week(_tfIso(d.timestamp));
	    	ret.meterName = d.meterName;
	    	return ret;
	    });
	    var dayDimension = _ndx.dimension(function(d) {
	    	if(d.timestamp === undefined) { d.timestamp = d.date; }
	    	var ret = d3.time.day(_tfIso(d.timestamp));
	    	ret.meterName = d.meterName;
	    	return ret;
	    });
	    
	    if(_chartParameters.daysBetween <= 30) {
	    	_dimensions.masterDimension = dayDimension;
  			_chartParameters.xUnits = d3.time.days;
  		    var displayDate = d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  		    _chartParameters.tickFormat = function(v) {return displayDate(new Date(v));}; 
  		    //numberOfTicks = _chartParameters.daysBetween;
  		}
  		else if(_chartParameters.daysBetween <= (180)) {
  			_dimensions.masterDimension = weekDimension;
  			_chartParameters.xUnits = d3.time.weeks;
  			var displayDate = d3.time.format("%m-%d-%y"); // function to change the format of a date object to mm-yyyy
  			_chartParameters.tickFormat = function(v) {return displayDate(new Date(v));};
  			//numberOfTicks = _chartParameters.daysBetween/7;
  		}
  		else {
  			_dimensions.masterDimension = monthDimension;
  			_chartParameters.xUnits = d3.time.months;
  			var displayDate = d3.time.format("%m-%y"); // function to change the format of a date object to mm-yyyy
  			_chartParameters.tickFormat = function(v) {return displayDate(new Date(v));};
  			//numberOfTicks = _chartParameters.daysBetween/30;
  		}
		
	    _createDomain();
        
	    //Start: create total groups
	    _groups.totalActualGroup = _dimensions.masterDimension.group().reduceSum(function(d) {
			return (d.type === 'actual' ? +d.value : 0);
		});
	    _groups.totalActualGroup.organization = "Total";
	    
	    _groups.totalExpectedGroup = _dimensions.masterDimension.group().reduceSum(function(d) {
	    	return (d.type === 'expected' ? +d.value : 0);
		});
	    _groups.totalExpectedGroup.organization = "Total";
	    
	    var totalCumulativeSum = 0;
	    _groups.totalCumulativeSavingsGroup = _dimensions.masterDimension.group().reduce(
			//groups a value for each entry in the dimension by finding the total aggregated savings
    		function (p,v) {
    			totalCumulativeSum = (v.type === 'expected' ? +v.value : -v.value) + totalCumulativeSum;	//positive if expected, negative if actual
    			return totalCumulativeSum;
    			//console.log([v.timestamp, p, v]);
    			//return p + (v.type === 'expected' ? +v.value : -v.value);
    		},	// sets the method for adding an entry into the total
    		function (p,v) {
    			totalCumulativeSum = totalCumulativeSum - (v.type === 'expected' ? +v.value : -v.value);
    			return totalCumulativeSum;
    			//console.log(['rem', v.timestamp, p, v]);
    			//return p - (v.type === 'expected' ? +v.value : -v.value);
    		},	// sets the method for removing an entry from the total
    		function () {
    			return totalCumulativeSum;
    			//return 0;
    		}	// sets the method for initializing the total
		);
	    _groups.totalCumulativeSavingsGroup.organization = "Total";
	    //end: create total groups
	    
	    //start: create individual groups
        _groups.savingsGroups = [];
        _groups.expectedGroups = [];
        _groups.actualGroups = [];
        _groups.cumulativeSavingsGroups = [];
		var savingsReduceAddGenerator = function (organization) {
			return function (p,v) {
    			if (v.organization === organization) {
    				return p + (v.type === 'expected' ? +v.value : -v.value);
    			}
    			else { return p; }
    		};
		};
		var savingsReduceRemoveGenerator = function (organization) {
			return function (p,v) {
				if (v.organization === organization) {
					return p - (v.type === 'expected' ? +v.value : -v.value);
				}
				else { return p; }
			};
		};
		var savingsReduceInitialGenerator = function (organization) {
			return function () {
				return 0;
			};
		};
		var expectedReduceSumGenerator = function (organization) {
			return function(d) {
        		if(organization !== d.organization) {return 0;}
        		return (d.meterName === _activeOrganizations[organization].expected ? +d.value : 0);
			};
		};
		var actualReduceSumGenerator = function (organization) {
			return function(d) {
				if(organization !== d.organization) {return 0;}
				return (d.meterName === _activeOrganizations[organization].actual ? +d.value : 0);
				
			};
		};
		
        for (var organization in _activeOrganizations) {	//separates each organization into its own group
        	//if (_meterIsntConsumption(meterName)) { continue; }//if the dataset doesn't represent kWh data, do not make a group
			var actualGroup = _dimensions.masterDimension.group().reduceSum(actualReduceSumGenerator(organization));
			actualGroup.organization = organization;	//saving metername on group
        	_groups.actualGroups.push(actualGroup);
        	_activeOrganizations[organization].groups.actual = actualGroup;
        	
        	var expectedGroup = _dimensions.masterDimension.group().reduceSum(expectedReduceSumGenerator(organization));
			expectedGroup.organization = organization;
        	_groups.expectedGroups.push(expectedGroup);
        	_activeOrganizations[organization].groups.expected = expectedGroup;
        	
        	var savingsGroup =_dimensions.masterDimension.group().reduce(
				//groups a value for each entry in the dimension by finding the total aggregated savings
				savingsReduceAddGenerator(organization),	// sets the method for adding an entry into the total
				savingsReduceRemoveGenerator(organization),	// sets the method for removing an entry from the total
				savingsReduceInitialGenerator(organization)	// sets the method for initializing the total
			);
        	_activeOrganizations[organization].groups.savings = savingsGroup;
        	
        	savingsGroup.organization = organization;
			_groups.savingsGroups.push(savingsGroup);
			
			var totalSum = 0;
			//TODO: Broken. Don't make functions in a loop.
			//create generator function outside loop, and use that inside the loop
			var cumulativeSavingsGroup = _dimensions.masterDimension.group().reduce(
					//groups a value for each entry in the dimension by finding the total aggregated savings
	        		function(p,v) {
	        			totalSum = (v.organization === organization ? v.value*.15 : 0) + totalSum;
	        			return totalSum;
	        		},	// sets the method for adding an entry into the total
	        		function(p,v) {
	        			totalSum = totalSum - (v.organization === organization ? v.value*.15 : 0 );
	        			return totalSum;
	        		},	// sets the method for removing an entry from the total
	        		function() {
	        			return totalSum;
	        		}	// sets the method for initializing the total
				);
			cumulativeSavingsGroup.organization = organization;
			_groups.cumulativeSavingsGroups.push(cumulativeSavingsGroup);
			_activeOrganizations[organization].groups.cumulativeSavings = cumulativeSavingsGroup;
        }
	};
	
	var _createDomain = function () {
		var lowest = new Date(_dimensions.masterDimension.bottom(1)[0].timestamp);
		var highest = new Date(_dimensions.masterDimension.top(1)[0].timestamp);
		
		_chartParameters.minDate = lowest; // sets the lowest date value from the available data
        _chartParameters.maxDate = highest;// sets the highest date value from the available data
        
        _chartParameters.domainX = d3.scale.linear().domain([_chartParameters.minDate, _chartParameters.maxDate]);
	};
	var _initCompositeChart = function (domString) {
		_composite = dc.compositeChart("#"+domString);
		return _composite;
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
	
	var _getTotalActualGroup = function () {
		return _groups.totalActualGroup;
	};
	var _getTotalExpectedGroup = function () {
		return _groups.totalExpectedGroup;
	};
	var _getTotalCumulativeSavingsGroup = function() {
		return _groups.totalCumulativeSavingsGroup;
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
				"actual" : "",
				"expected" : "",
				"meterQuery" : {},
				'color' : 'rgba(0,255,255,0.5)',
				'groups' : {
					'actual' : {},
					'expected' : {},
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
		getTotalActualGroup : _getTotalActualGroup,
		getTotalExpectedGroup : _getTotalExpectedGroup,
		getTotalCumulativeSavingsGroup : _getTotalCumulativeSavingsGroup,
		
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
		getCharts : _getCharts,
		
		getRawData : _getRawData,
		getOrganizationQuery : _getOrganizationQuery,
		getActiveOrganizations : _getActiveOrganizations,
		initActiveOrganization : _initActiveOrganization,
		deleteActiveOrganization : _deleteActiveOrganization  
	};
	
	return _servObj;
}])
.controller('energyProfileCtrl', ['$scope', '$location', '$route', 'energyProfileDataService', 
                    function($scope, $location, $route, dataService) {
	$scope.timeSeries = 'energyProfile';
	$scope.showButtons = true;
	$scope.chartInit = false;
	$scope.userParameters = dataService.getUserParameters();
	$scope.activeOrganizations = dataService.getActiveOrganizations();
	$scope.inactiveOrganizations = {};
	console.log($scope.activeOrganizations);
	
	var composite; //variable that stores the composite chart generated by program
	//populated by drawChart
	
	var drawChart = function () {
		var lX = $scope.userParameters.width - $scope.userParameters.marginRight + 25,
			lY = $scope.userParameters.height - 650;
		//legend coords
		
		composite = dataService.initCompositeChart("test_composed");
		//composite = dc.compositeChart("#test_composed");
		var cumulativeAreaCharts = [];
		var actualLineCharts = [];
		var expectedLineCharts = [];
		var savingsBarCharts = []; //needed?
		var chartArray = [];
		var barColors = [];
	
		for (var organization in $scope.activeOrganizations) {
			barColors.push($scope.activeOrganizations[organization].color);
		}
			
		var cumulativeArea = dc.lineChart(composite)
		    .dimension($scope.masterDimension)
		    .interpolate("cardinal")
		    .colors($scope.userParameters.cumulativeColor)
		    .group($scope.totalCumulativeSavingsGroup, $scope.totalCumulativeSavingsGroup.organization + " Total Savings/Waste")
		    .renderArea(true)
		    .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
		    .tension(0.5);
		var actualLine = dc.lineChart(composite)
	        .dimension($scope.masterDimension)
	        .interpolate("cardinal")
	        .colors($scope.userParameters.actualColor)
	        .group($scope.totalActualGroup, $scope.totalActualGroup.organization + " Actual KWH")
	        .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
	        .tension(0.5);
		var expectedLine = dc.lineChart(composite)
	        .dimension($scope.masterDimension)
	        .interpolate("cardinal")
	        .colors($scope.userParameters.expectedColor)
	        .group($scope.totalExpectedGroup, $scope.totalExpectedGroup.organization + " Expected KWH")
	        .renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
	        .tension(0.5);
		var savingsBar = {};
		
		var ranger = dc.barChart("#ranger")
	        .dimension($scope.masterDimension)
	        .group($scope.savingsGroups[0], $scope.savingsGroups[0].organization + " Savings")
	        .ordinalColors(barColors)
	        .x($scope.chartParameters.domainX);
		var barInitFlag = false;
		
		for (var organization in $scope.activeOrganizations) {
			var savingsGroup = $scope.activeOrganizations[organization].groups.savings;
			if (barInitFlag === false ) {
			savingsBar = dc.barChart(composite)
		        .dimension($scope.masterDimension)
		        .group(savingsGroup, savingsGroup.organization + " Savings")
		        .ordinalColors(barColors)
		        .centerBar(true)
		        .barPadding(0.5)
		        .hidableStacks(true);
				barInitFlag = true;
			}
			else {
				savingsBar.stack(savingsGroup, savingsGroup.organization + " Savings");
			}
		}
		
		chartArray.push(cumulativeArea);
		chartArray.push(savingsBar);
		chartArray.push(actualLine);
		chartArray.push(expectedLine);
		
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
			.xAxisLabel("Date/Time")
			.elasticX(true)

			.elasticY(true)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.yAxisLabel("kWh")
			.legend(dc.legend().x(lX).y(lY).itemHeight(13).gap(5)) // legend position and add'l info
	
			.mouseZoomable(true)

			.brushOn(false)
			.renderlet(function(_chart){ // this provides the functionality for an on click check for the composite chart focusing on the bar graphs (or any drawn rectangles)      	  
				_chart.selectAll("rect").on("click", function(_item){
					console.log(_item);
					
					if(_item.x !== undefined){ // if the x property appears, its a graphical 'rect', otherwise it's legend
						var allEntries = _chart.selectAll("rect.bar")[0];
						var clickOrganization = _item.layer.slice(0, -8); //layer is the label on the legend, which was previously set to org+" Savings"
						console.log($scope.activeOrganizations[clickOrganization]);
						for(var organization in $scope.activeOrganizations) {
							if(clickOrganization === organization) {continue;} //do not remove if it was the organization clicked
							$scope.inactiveOrganizations[organization] = $scope.activeOrganizations[organization];
							delete $scope.activeOrganizations[organization];
						}
						console.log({"active": $scope.activeOrganizations, "inactive": $scope.inactiveOrganizations});
					}
					
					else{ // it's a legend item
						console.log("legend: " + _item.name);
					}
					$scope.$apply();
					$scope.redrawChart();
				})
			});
	     // .rangeChart(ranger);

		//ranger.xAxis().tickFormat($scope.chartParameters.tickFormat); // sets the tick format to be the month/year only
		//ranger.width($scope.userParameters.width)
		//.centerBar(true)
		//.margins({
		//	left: $scope.userParameters.marginLeft,
		//	right: $scope.userParameters.marginRight,
		//	top: $scope.userParameters.marginTop,
		//	bottom: $scope.userParameters.marginBottom
		//})
		//.xUnits($scope.chartParameters.xUnits); // sets X axis units;
	    
	    dc.renderAll();
	    return composite;
	};
	
	var populateScope = function () {
		//this function populates necessary variables onto the scope.
		$scope.masterDimension  = dataService.getMasterDimension();
        
        $scope.actualGroups = dataService.getActualGroups();
        $scope.expectedGroups = dataService.getExpectedGroups();
        $scope.savingsGroups = dataService.getSavingsGroups();
        
        $scope.totalExpectedGroup = dataService.getTotalExpectedGroup();
        $scope.totalActualGroup = dataService.getTotalActualGroup();
        $scope.totalCumulativeSavingsGroup = dataService.getTotalCumulativeSavingsGroup();
        
        $scope.cumulativeSavingsGroups = dataService.getCumulativeSavingsGroups();
        $scope.chartParameters = dataService.getChartParameters();
	};
	
	var http = function(data) {
		$scope.showButtons = false;
        
		populateScope();
        
        composite = drawChart();
        $scope.showButtons = true;
    };
    
	var csv = function () {
		d3.csv("expectedActual.csv", function(error, energyData) {
			$scope.showButtons = false;
	    	dataService.csvInit(energyData);
	    	
	    	populateScope();
	        
	        composite = drawChart();
	        $scope.showButtons = true;
			$scope.$apply();
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
	$scope.redrawChart = function () {
		composite = drawChart();
	};
	
	$scope.queryOrganizations = function () {
		dataService.getOrganizations().then( function () {
			$scope.organizationQuery = dataService.getOrganizationQuery();
		});
	};
	$scope.deleteOrganization = function (organization) {
		dataService.deleteActiveOrganization(organization);
	};
	$scope.initOrganization = function (organization) {
		dataService.initActiveOrganization(organization);
	};
	$scope.countActiveOrganizations = function () {
		return Object.keys($scope.activeOrganizations).length;
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