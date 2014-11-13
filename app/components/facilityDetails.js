'use strict';
angular.module('myApp.facilityDetails', ['ngRoute'])

.factory('facilityDetailsService', ['$http', function($http){
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	} 
	var _servObj = {};
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
	

	
	
	
	
		
		
        for (var organization in _activeOrganizations) {	//separates each organization into its own group
        	//if (_meterIsntConsumption(meterName)) { continue; }//if the dataset doesn't represent kWh data, do not make a group
			var actualGroup = _dimensions.masterDimension.group().reduceSum(actualReduceSumGenerator(organization));
			actualGroup.meterName = organization;	//saving metername on group
        	_groups.actualGroups.push(actualGroup);
        	
        	var expectedGroup = _dimensions.masterDimension.group().reduceSum(expectedReduceSumGenerator(organization));
			expectedGroup.meterName = organization;
        	_groups.expectedGroups.push(expectedGroup);
        	
        	var savingsGroup =_dimensions.masterDimension.group().reduce(
				//groups a value for each entry in the dimension by finding the total aggregated savings
				savingsReduceAddGenerator(organization),	// sets the method for adding an entry into the total
				savingsReduceRemoveGenerator(organization),	// sets the method for removing an entry from the total
				savingsReduceInitialGenerator(organization)	// sets the method for initializing the total
			);
        	
        	savingsGroup.meterName = organization;
			_groups.savingsGroups.push(savingsGroup);
			
			var totalSum = 0;
			var cumulativeSavingsGroup = _dimensions.masterDimension.group().reduce(
					//groups a value for each entry in the dimension by finding the total aggregated savings
	        		function(p,v) {
	        			totalSum = (v.meterName === organization ? v.value*.15 : 0) + totalSum;
	        			return totalSum;
	        		},	// sets the method for adding an entry into the total
	        		function(p,v) {
	        			totalSum = totalSum - (v.meterName === organization ? v.value*.15 : 0 );
	        			return totalSum;
	        		},	// sets the method for removing an entry from the total
	        		function() {
	        			totalSum = 0;
	        			return totalSum;
	        		}	// sets the method for initializing the total
				);
			cumulativeSavingsGroup.meterName = organization;
			_groups.cumulativeSavingsGroups.push(cumulativeSavingsGroup);
        }
	
	
	
	
	

	
	
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
				"meterQuery" : {}
		};
		_getMeters(organization);
	};
	
	_servObj = {
		
		getOrganizations: _getOrganizations,
		
		
		
		
		getOrganizationQuery : _getOrganizationQuery,
		
	};
	
	return _servObj;
}])
.controller('facilityDetailsCtrl', ['$scope', '$location', '$route', 'facilityDetailsService', 
                    function($scope, $location, $route, dataService) {
	
	
	$scope.queryOrganizations = function () {
		dataService.getOrganizations().then( function () {
			$scope.organizationQuery = dataService.getOrganizationQuery();
		});
	};
	$scope.queryOrganizations();
}]);