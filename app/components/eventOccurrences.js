'use strict';
angular.module('myApp.eventOccurrences', ['ngRoute'])

.controller('eventOccurrencesCtrl', ['$scope', '$location', '$route', 
  function($scope, $location, $route) {
	
	
   $scope.debug = function () {
		console.log($scope);

	};
}]);
