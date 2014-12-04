'use strict';
 
angular.module('myApp.equipmentInFaults')
 
.controller('equipmentInFaultsConfigController', ['$scope', '$modal', function($scope, $modal){
				
		$scope.open = function(size) {
		
		var modalInstance = $modal.open({
			templateUrl: 'views/equipmentInFaultsConfig.html',
			controller: 'equipmentInFaultsConfigInstance',
			size: size,
			scope: $scope
			});
		
		}
}])

.controller('equipmentInFaultsConfigInstance', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	var parent = $scope.$parent;
	$scope.active = {};
	
	$scope.ok = function() {
		$modalInstance.close();
		
	};
	

	
	$scope.domainOpts = [
		//{domain: 'hour'}, 
		{domain: 'day'}//, {domain: 'week'}, {domain: 'month'}, {domain: 'year'}
	];
	
	$scope.subDomainOpts = [
		//{domain: 'min'}, 
		{domain: 'hour'}//, {domain: 'day'}, {domain: 'week'}, {domain: 'month'}
	];
	
	$scope.cal = function($event){
		$event.preventDefault();
		$event.stopPropagation();
		
		$scope.opened = true;
	};
	
	
	

	
}]);




