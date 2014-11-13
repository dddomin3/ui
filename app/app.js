'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.heatmap',
  'myApp.zoomHeatmap',
  'myApp.persistView',
  'myApp.bar',
  'myApp.energyProfile',
  'myApp.timeSeries',
  'myApp.facilityDetails',
  'calHeatmap',
  'angularDc',
  'colorpicker.module',
  'myApp.calendar',
  'ui.bootstrap'
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
	when('/energyProfile', {
		templateUrl: 'views/energyProfile.html',
		controller: 'energyProfileCtrl'
	}).
	when('/facilityDetails', {
		templateUrl: 'views/facilityDetails.html',
		controller: 'facilityDetailsCtrl'
	}).
	otherwise({redirectTo: '/heatmap'});
}]);
