// Angela's code

'use strict';

angular.module('myApp.equipmentTickets')

.controller('equipmentTicketsCtrl', ['$scope', '$routeParams', 'assetService', function($scope, $routeParams, assetService) {
	
	var facility = $routeParams.facility;
	var assetId = $routeParams.assetId;
	
	$scope.asset = null;
	$scope.events = null;
	
	var promise = assetService.getAsset(facility, assetId);
	promise.then(function(asset) {
		$scope.asset = asset;
		
	}, function() {
		alert('fail to query asset data');
	});
	
	var promise1 = assetService.getEvents(facility, assetId);
	promise1.then(function(events) {
		$scope.events = events;
		
	}, function() {
		alert('fail to query event data');
	});
}]);