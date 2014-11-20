'use strict';
 
angular.module('myApp.heatmap')
 
.controller('popOutController', ['$scope', '$modal', function($scope, $modal){
				
		$scope.open = function(size) {
		
		var modalInstance = $modal.open({
			templateUrl: 'views/popoutTemplate.html',
			controller: 'popoutInstance',
			scope: $scope.$parent,
			windowClass: "widget-popup" 
			});
		};
}])

.controller('popoutInstance', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.min = function() {
		$modalInstance.close();
	};
}]);
