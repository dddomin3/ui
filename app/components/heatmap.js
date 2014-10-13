'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html',
    controller: 'heatmapCtrl'
  });
}])
 
.controller('heatmapCtrl', [function() {
 
}]);