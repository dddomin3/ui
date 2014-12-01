'use strict';
 
angular.module('myApp.eventPage', ['ngRoute'])

.controller('eventPageCtrl', ['$scope', '$location', '$route', '$window', 
  function($scope, $location, $route, $window) {

	$scope.timeseries = "Hello";
	
}])