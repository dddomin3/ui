'use strict';
 
angular.module('myApp.zoomHeatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/zoomHeatmap', {
    templateUrl: 'views/zoomHeatmap.html',
    controller: 'zoomHeatmapCtrl'
  });
}])

.factory('zoomHeatmapService', [ function() { 
	var _servObj;
	var _timestamp; 
	
	var _setTimestamp = function(timestamp){
		_timestamp = timestamp;
		
		return _servObj;
	}
	
	var _getTimestamp = function(){
		return _timestamp;
	}
	
	_servObj = {
		getTimestamp : _getTimestamp,
		setTimestamp : _setTimestamp
	};
	
	return _servObj;
}])
 
.controller('zoomHeatmapCtrl', ['$scope', '$routeParams', 'zoomHeatmapService', function($scope, $routeParams, zoomHeatmapService) {
	console.log(zoomHeatmapService.getTimestamp());
	$scope.timestamp = new Date(+zoomHeatmapService.getTimestamp()).toString();
}]);