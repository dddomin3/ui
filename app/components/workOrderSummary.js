'use strict';
 
angular.module('myApp.workOrderSummary', ['ngRoute', 'ui.grid'])

.controller('workOrderSummaryCtrl', ['$scope', 'uiGridConstants', '$route', 
  function($scope, uiGridConstants, $location, $route, $window){
	$scope.tableData = [{facility: "BRB", events: 15},
	                    {facility: "BRTC", events: 15},
	                    {facility: "GO", events: 37},
	                    {facility: "MBC", events: 15},
	                    {facility: "SJC", events: 55},
	                    {facility: "SWIC", events: 29},
	                    {facility: "WHBC", events: 13},
	                    {facility: "BJIC", events: 57},
	                    {facility: "BRUS", events: 55},
	                    {facility: "KRON", events: 11},
	                    {facility: "NWCL", events: 5}];
	$scope.gridOptions = {
			enableSorting: true,
			showFooter: true,
			enableFiltering: true,
			data: 'tableData',
			columnDefs: [{field: 'facility', displayName: 'Facility'}, {field: 'events', aggregationType: uiGridConstants.aggregationTypes.sum, displayName: 'Events', enableFiltering: false}],			
	};
}]);
