'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.heatmap',
  'myApp.zoomHeatmap',
  'myApp.persistView',
  'myApp.bar',
  'myApp.energyProfile',
  'myApp.intervalDemand',
  'myApp.timeSeries',
  'myApp.facilityDetails',
  'myApp.workOrderSummary',
  'calHeatmap',
  'angularDc',
  'colorpicker.module',
  'myApp.calendar',
  'ui.bootstrap',
  'myApp.utilityGraph',
  'myApp.panelComponent',
  'myApp.equipmentInFaults'
 
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
	when('/intervalDemand', {
		templateUrl: 'views/intervalDemand.html',
		controller: 'intervalDemandCtrl'
	}).
	when('/facilityDetails', {
		templateUrl: 'views/facilityDetails.html',
		controller: 'facilityDetailsCtrl'
	}).
	when('/workOrderSummary', {
		templateUrl: 'views/workOrderSummary.html',
		controller: 'workOrderSummaryCtrl'
	}).
	when('/equipmentInFaults',{
		templateUrl:'views/equipmentInFaults.html',
		controller:'equipmentInFaultsCtrl'
	}).
	otherwise({redirectTo: '/heatmap'});
}]);
