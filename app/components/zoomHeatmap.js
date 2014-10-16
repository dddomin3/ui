'use strict';
 
angular.module('myApp.zoomHeatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/zoomHeatmap', {
    templateUrl: 'views/zoomHeatmap.html',
    controller: 'zoomHeatmapCtrl'
  });
}])

.service('zoomHeatmapService', [ function(){
	var _servObj;
	
	var _timestamp = new Date(0);
	
	var _setTimestamp = function(timestamp){
		_timestamp = timestamp;
		
		return _servObj;
	}
	
	var _getTimestamp = function(){
		return _timestamp;
	}
	
	_servObj = {
		getTimestamp : _getTimestamp,
		setTimestamp : _setTimestamp,
		//temporarily expose private _timestamp
		timestamp : _timestamp,
		_timestmap : _timestamp
	}
	
	return _servObj;
	
}])
 
.controller('zoomHeatmapCtrl', ['$scope', '$routeParams', 'zoomHeatmapService', function($scope, $routeParams, zoomHeatmapService) {
	$scope.timestamp = new Date(+zoomHeatmapService.getTimestamp()).toString();
}]);