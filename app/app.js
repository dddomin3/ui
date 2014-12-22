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
  'myApp.workOrderGrid',
  'myApp.workOrderSummary',
  'myApp.eventOccurrences',
  'calHeatmap',
  'angularDc',
  'colorpicker.module',
  'myApp.calendar',
  'ui.bootstrap',
  'myApp.utilityGraph',
  'myApp.panelComponent',
  'myApp.dashboard',
  'myApp.ticketImpulse',
  'myApp.equipmentTickets',
  'myApp.eventPage',
  'myApp.equipmentInFaults',
  'myApp.ticketImpulseTest',
  'myApp.intervalDemandTest'
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
	when('/eventOccurrences', {
		templateUrl: 'views/eventOccurrences.html',
		controller: 'eventOccurrencesCtrl'
	}).
	when('/intervalDemand', {
		templateUrl: 'views/intervalDemandTest.html',
		controller: 'intervalDemandTestCtrl'
	}).
	when('/facilityDetails', {
		templateUrl: 'views/facilityDetails.html',
		controller: 'facilityDetailsCtrl'
	}).
	when('/workOrderSummaryModal', {
		templateUrl: 'views/workOrderSummaryModal.html',
		controller: 'workOrderSummaryModalCtrl'
	}).
	when('/workOrderSummaryConfig', {
		templateUrl: 'views/workOrderSummaryConfig.html',
		controller: 'workOrderSummaryConfigCtrl'
	}).
	
	when('/ticketImpulse', {
		templateUrl: 'views/ticketImpulseTest.html'
	}).
	when('/workOrderSummaryAsset', {
		templateUrl: 'views/workOrderSummaryAsset.html',
		controller: 'workOrderSummaryAssetCtrl'
	}).
	when('/workOrderGrid',{
		templateUrl: 'views/workOrderGrid.html',
		controller: 'workOrderGridCtrl'
	}).
	when('/eventPage',{
		templateUrl: 'views/eventPage.html',
		controller: 'eventPageCtrl'
	}).
	when('/equipmentTickets', {
		templateUrl: 'views/equipmentTickets.html',
		controller: 'equipmentTicketsCtrl'
	}).
	when('/equipmentTickets/:facility/:assetId', {
		templateUrl: 'views/equipmentTickets.html',
		controller: 'equipmentTicketsCtrl'
	}).
	when('/equipmentInFaults',{
		templateUrl: 'views/equipmentInFaults.html',
		controller: 'equipmentInFaultsCtrl'
	}).
	otherwise({redirectTo: '/dashboard'});
}]);
