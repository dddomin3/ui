'use strict';

angular.module('myApp.equipmentTickets')

.controller('equipmentTicketsConfigCtrl', ['$scope', 'clientService', function($scope, clientService) {
	$scope.clientList = null;
	$scope.facilityList = null;
	$scope.assetList = null;
	
	$scope.currentClientName = null;
	$scope.currentFacilityName = null;
	$scope.currentAssetName = null;
	
	var clientListPromise = clientService.getClientList();
	clientListPromise.then(function(clientList) {
		$scope.clientList = clientList;
	}, function() {
		alert('fail to query clients from client service');
	});
	
	$scope.$watch("currentClientName", function() { // because $scope.currentClientName
		console.log('client name changed');


		var facilityListPromise = clientService.getFacilityList($scope.currentClientName);
		facilityListPromise.then(function(facilityList) {
			$scope.facilityList = facilityList;
		}, function() {
			alert('fail to query facilities from client service');
		});
		
		$scope.$watch("currentFacilityName", function() { // because $scope.currentClientName
			console.log('facility name changed');
			
			
			var assetListPromise = clientService.getAssetList($scope.currentClientName, $scope.currentFacilityName);
			assetListPromise.then(function(assetList) {
				$scope.assetList = assetList;
			}, function() {
				alert('fail to query assets from client service');
			});
			
			$scope.$watch("currentAssetName", function() { // because $scope.currentClientName
			console.log('asset name changed');
			});
		});
    });
}]);