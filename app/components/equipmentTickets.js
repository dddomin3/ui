// Angela's code

'use strict';

angular.module('myApp.equipmentTickets')

.controller('equipmentTicketsCtrl', ['$scope', '$routeParams', 'assetService', function($scope, $routeParams, assetService) {
	
	var facility = $routeParams.facility;
	var assetId = $routeParams.assetId;
	var asset = { id: assetId, type: "ahu" }; // replace existing line
	
	$scope.events = null;
	$scope.asset = asset;
	
	var promise = assetService.getEvents(facility, asset.id); // need to eventually pass the org, fac, and asset id in
	promise.then(function(events) {
		$scope.events = events;
		
	}, function() {
		alert('fail to query data');
	});
}]);