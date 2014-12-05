'use strict';

angular.module('myApp.workOrderGrid', ['ngRoute', 'ui.grid', 'ui.grid.edit', 'ui.grid.autoResize'])

.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'work-order-grid';},
		configTag: function(){return 'work-order-grid-config';},
		tagHtml: function(){return "<work-order-grid></work-order-grid>";},
		directiveName: function(){return 'workOrderGrid';},
		namespace: function(){return 'workorders';},
		paletteImage: function(){return 'hotcool.png';}
		}
	);
}])

.factory('workOrderGridService', ['$http', function($http){
	console.log("Word up, homey");
	var _getWorkOrders = function(){
		var _serviceObject = {};
		var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{}";
		var config = {
				method: 'POST',
				headers: {'Collection' : 'Event'},
				url: mongoUrl,
				data: requestString
			};
			
			var promise = $http(config).success(function(data, status, headers, config){
				console.log("Off the hook, G");
			}).error(function(data, status, headers, config){
				console.log("Ray broke the server");
			})
			return promise;
	};
	var serviceObject = {
			getWorkOrders : _getWorkOrders,
		};
		return serviceObject;	
}])

.controller('workOrderGridCtrl', ['$scope', '$http', '$location', 'uiGridConstants', '$route', 'workOrderGridService', 
    function($scope, $http, $location, uiGridConstants, $route, workOrderGridService){
		
		$scope.test = {
				showMessage: function(row){
					console.log(row)
				},
				mouse: function(row){
					//console.log(row);
					
				}
		};
		workOrderGridService.getWorkOrders().then(function(response){
			$scope.responseData = response.data.result;
			var eventData = [];
			for(var i=0;i<$scope.responseData.length;i++){
				
				var anomaly = $scope.responseData[i].anomaly;
				
				if(anomaly == "null"){
					anomaly = "Not Available";
				}
				var ticketCreationDate = $scope.responseData[i].createdTime;
				if(ticketCreationDate == "null"){
					ticketCreationDate = "Not Available";
				}
				var ticketClosingDate = $scope.responseData[i].closedTime;
				if(ticketClosingDate == "null"){
					ticketClosingDate = "Pending";
				}
				
				var eventRow = {organization: $scope.responseData[i].organization, facility: $scope.responseData[i].facility, asset: $scope.responseData[i].asset, anomaly: anomaly, eventID: $scope.responseData[i].eventID, createdTime: ticketCreationDate, closedTime: ticketClosingDate, exportEvent: null};
				eventData.push(eventRow);
			}
			$scope.eventData = eventData;
		});
		$scope.gridOptions = {
			enableSorting: true,
			enableFiltering: true,
			multiSelect: false,
			data: 'eventData',
			rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			columnDefs: [
			             {field: 'organization', displayName: 'Organization'},
			             {field: 'facility', displayName: 'Facility'},
			             {field: 'asset', displayName: 'Asset'},
			             {field: 'anomaly', displayName: 'Anomaly'},
			             {field: 'createdTime', displayName: 'Ticket Creation Date'},
			             {field: 'closedTime', displayName: 'Ticket Closing Date'},
			             {field: 'eventID', displayName: 'Event ID'},
			             ]
	
		};
		
		$scope.reset = function(){
			$location.templateUrl = "/views/workOrderGrid";
			$route.reload();
		}
}])

.controller('workOrderGridConfigCtrl', [ function(){
}])

.directive('workOrderGridConfig', [function() {
	return {
		restrict: 'E',
		controller: 'workOrderGridConfigCtrl',
		templateUrl: 'views/configButton.html'
	}
}])

.directive('workOrderGrid', [function() {
	return {
		restrict: 'E',
		scope: {},
		controller: 'workOrderGridCtrl',
		templateUrl: 'views/workOrderGrid.html'
	}
}]);