'use strict';
 
angular.module('myApp.workOrderSummary', ['ngRoute'])

.controller('workOrderSummaryCtrl', ['$scope', '$location', '$route','$window', 
  function($scope, $location, $route, $window){
	$scope.tableData = [{name: "Beavis", age: 15},
	                    {name: "Butthead", age: 15},
	                    {name: "Buzzcut", age: 37},
	                    {name: "Daria", age: 15},
	                    {name: "Van Dreissen", age: 55}];
	$scope.gridOptions = {data: 'tableData'};
});
