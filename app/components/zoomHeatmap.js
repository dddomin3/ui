'use strict';
 
angular.module('myApp.zoomHeatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/zoomHeatmap', {
    templateUrl: 'views/zoomHeatmap.html',
    controller: 'zoomHeatmapCtrl'
  });
}])

.factory('zoomHeatmapFactory', [ function() { 
	var _servObj;
	
	var _setTimestamp = function(timestamp){
		this.timestamp = timestamp;
		
		return _servObj;
	}
	
	var _getTimestamp = function(){
		return this.timestamp;
	}
	
	_servObj = {
		getTimestamp : _getTimestamp,
		setTimestamp : _setTimestamp
	};
	
	return _servObj;
}])

.service('zoomHeatmapService', [ 'zoomHeatmapFactory', function(zoomHeatmapFactory){
	angular.extend(this, zoomHeatmapFactory);

	this.setTimestamp(new Date(0));	
}])
 
.controller('zoomHeatmapCtrl', ['$scope', '$routeParams', 'zoomHeatmapService', function($scope, $routeParams, zoomHeatmapService) {
	$scope.timestamp = new Date(+zoomHeatmapService.getTimestamp()).toString();
}]);