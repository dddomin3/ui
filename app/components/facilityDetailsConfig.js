'use strict';
 
angular.module('myApp.facilityDetails')
 
.controller('facilityDetailsConfigController', ['$scope', '$modal', function($scope, $modal){
				
		$scope.openConfig = function(size) {
		
		var modalInstance = $modal.open({
			templateUrl: 'views/facilityDetailsConfig.html',
			controller: 'facilityDetailsConfigInstance',
			size: size,
			scope: $scope
			});
		
		}
}])

.controller('facilityDetailsConfigInstance', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	var parent = $scope.$parent;
	
	$scope.ok = function() {
		$modalInstance.close();
		
	};
	
	
	
}]);


