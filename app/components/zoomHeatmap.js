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
	var _servObj = {};
	angular.extend(_servObj, zoomHeatmapFactory);
	
	this.timestamp = new Date(0);
	
	_servObj.timestamp = this.timestamp;
	
	return _servObj;
	
}])
 
.controller('zoomHeatmapCtrl', ['$scope', '$routeParams', 'zoomHeatmapService', function($scope, $routeParams, zoomHeatmapService) {
	$scope.timestamp = new Date(+zoomHeatmapService.getTimestamp()).toString();
}]);