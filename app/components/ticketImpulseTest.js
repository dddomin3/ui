angular.module('myApp.ticketImpulseTest', ['ngRoute'])
.controller('ticketImpulseTestCtrl', ['$scope', 'ticketImpulseDataService',
						function($scope, dataService) {
	$scope.custQuery= "{\"assets\":[{\"asset\":\"AHU2\",\"facility\":\"60 Wall Street\",\"organization\":\"DEU\"}],\"highDate\":\"Wed Dec 10 2014 11:38:39 GMT-0500 (Eastern Standard Time)\",\"lowDate\":\"Wed Jun 25 2014 11:38:39 GMT-0500 (Eastern Standard Time)\"}";
	$scope.custQuery = JSON.parse($scope.custQuery);
	$scope.custParams = dataService.getDefaultUserParameters();
	$scope.logScope = function () {
		console.log($scope);
	};
	
}]);