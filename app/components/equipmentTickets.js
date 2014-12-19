// Angela's code; equipmentTickets.js

'use strict';

angular.module('myApp.equipmentTickets', ['ngRoute'])

.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'equipment-tickets';},
		configTag: function(){return 'equipment-tickets-config';},
		tagHtml: function(){return "<equipment-tickets></equipment-tickets>";},
		directiveName: function(){return 'equipmentTickets';},
		namespace: function(){return 'equipment-tickets'},
		paletteImage: function(){return 'ticket.png';}
		});
}])

.controller('equipmentTicketsCtrl', ['$scope', '$modal', '$routeParams', 'assetService', function($scope, $modal, $routeParams, assetService) {
	
	var populateData = function(facility, assetId) {
		$scope.asset = null;
		$scope.events = null;
		
		var assetPromise = assetService.getAsset(facility, assetId);
		assetPromise.then(function(asset) {
			$scope.asset = asset;
			
		}, function() {
			console.log('fail to query asset data');
		});
		
		var eventsPromise = assetService.getEvents(facility, assetId);
		eventsPromise.then(function(events) {
			$scope.events = events;
		}, function() {
			console.log('fail to query event data');
		});
	};
	
	// Configuration window
	$scope.openConfig = function() {
	
		var modalInstance = $modal.open({
            templateUrl: 'views/equipmentTicketsConfig.html',
            controller: 'equipmentTicketsConfigCtrl',
			resolve: {
				configData: function(){
					return $scope.configData;
				}
			}
        });
		
		modalInstance.result.then(function(configData){
			populateData(configData.facility, configData.assetId);
		}, function() {
			console.log('fail to receive results from config modal');
		});
	};
	
	// If routeParameters are given, use them
	// otherwise, automatically open the configuration window
	if ($routeParams.facility != null && $routeParams.assetId != null) {
		populateData($routeParams.facility, $routeParams.assetId);
	} else $scope.openConfig();
	
}])

.directive('equipmentTickets', ['$routeParams', function($routeParams) {
	return {
		restrict: 'E',
		controller: 'equipmentTicketsCtrl',
		templateUrl: 'views/equipmentTickets.html'
	}
}]);
