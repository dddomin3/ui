// Angela's code; equipmentTicketsConfig.js

'use strict';

angular.module('myApp.equipmentTickets')



.controller('equipmentTicketsConfigCtrl', ['$scope', '$modalInstance', 'clientService', function($scope, $modalInstance, clientService) {
	
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
		console.log('fail to query clients from client service');
	});
	
	$scope.$watch("currentClientName", function() {
		if ($scope.currentClientName!==null){
			var facilityListPromise = clientService.getFacilityList($scope.currentClientName);
			facilityListPromise.then(function(facilityList) {
				$scope.facilityList = facilityList;
			}, function() {
				console.log('fail to query facilities from client service');
			});
		}
	});
	
	$scope.$watch("currentFacilityName", function() {
		if ($scope.currentFacilityName!==null){
			var assetListPromise = clientService.getAssetList($scope.currentClientName, $scope.currentFacilityName);
			assetListPromise.then(function(assetList) {
				$scope.assetList = assetList;
			}, function() {
				console.log('fail to query assets from client service');
			});
		}
	});
	
	$scope.ok = function() {
		var configData = {
			facility: $scope.currentFacilityName,
			assetId: $scope.currentAssetName
		};
		$modalInstance.close(configData);
	};
}]);