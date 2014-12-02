'use strict';
 
angular.module('myApp.facilityDetails')
 
.controller('detailedFacilityDetailsController', ['$scope', '$modal', function($scope, $modal){
				
		$scope.openConfig = function(size) {
		
		var modalInstance = $modal.open({
			templateUrl: 'views/detailedFacilityDetails.html',
			controller: 'facilityDetailsConfigInstance',
			size: size,
			scope: $scope.$parent.$parent
			});
		
		}
}])

