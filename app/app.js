'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.heatmap',
  'myApp.zoomHeatmap',
  'myApp.persistView',
  'calHeatmap'
]).

config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/bar', {
		templateUrl: 'views/bar.html',
		controller: 'barController'
	}).
	when('/timeSeries', {
		templateUrl: 'views/time-series.html',
		controller: 'timeSeriesController'
	}).
	otherwise({redirectTo: '/heatmap'});
}]);
