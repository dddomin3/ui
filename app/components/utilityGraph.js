'use strict';
 
angular.module('myApp.utilityGraph', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/utilityGraph', {
    template: '<utility-graph></utility-graph>'
  });
}])

.factory('utilityGraphDataService', ['$http', function($http){
	var serviceObject = {};
	
	var _query = {
		name: "kWh2"
	};
	
	var _getData = function(){
		
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(_query));
	};
	
	serviceObject = {
		getData : _getData
	}
	
	return serviceObject;
}])

.controller('utilityGraphController', ['utilityGraphDataService', function(utilityGraphDataService){
	var vm = this;
	
	vm.rendered = true;
	vm.data = [];

	utilityGraphDataService.getData().success(function(data){
		//Iterate through the result[] array
		angular.forEach(data.result, function(value, key){
			//In each result.his, iterate through all objects
			angular.forEach(data.result[key].his, function(val, kee){
				//Need to make the string a number....
				val.value=+val.value;
				
				vm.data.push(val);
			});
			
		});
	})

	//after data is loaded, this callback assigns the dimension and group.
	.finally(function(){
		
		vm.utilityDimension = crossfilter(vm.data).dimension(function(d){
			return d3.time.month(new Date(d.timestamp));
		});
		vm.utilityGroup = vm.utilityDimension.group().reduceSum(function(d){
			return d.value;
		})
	});
	
}])

.controller('utilityConfigController', [ function(){
}])

.directive('utilityGraph', [function() {
	return {
		restrict: 'E',
		scope: {},
		controller: 'utilityGraphController as utility',
		templateUrl: 'views/utilityGraph.html'
	}
}])