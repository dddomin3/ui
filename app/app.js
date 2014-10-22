'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.heatmap',
  'myApp.zoomHeatmap',
  'myApp.persistView',
  'myApp.bar',
  'myApp.timeSeries',
  'calHeatmap'
]).

config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/bar', {
		templateUrl: 'views/bar.html',
		controller: 'barCtrl'
	}).
	when('/timeSeries', {
		templateUrl: 'views/timeSeries.html',
		controller: 'timeSeriesCtrl'
	}).
	otherwise({redirectTo: '/heatmap'});
}]);
