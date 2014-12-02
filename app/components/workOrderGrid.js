'use strict';

angular.module('myApp.workOrderGrid', ['ngRoute', 'ui.grid'])

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
				
				var eventRow = {organization: $scope.responseData[i].organization, facility: $scope.responseData[i].facility, asset: $scope.responseData[i].asset, anomaly: anomaly, eventID: $scope.responseData[i].eventID, createdTime: ticketCreationDate, closedTime: ticketClosingDate};
				eventData.push(eventRow);
			}
			$scope.eventData = eventData;
		});
		$scope.gridOptions = {
			enableSorting: true,
			enableFiltering: true,
			multiSelect: false,
			data: 'eventData',
			columnDefs: [
			             {field: 'organization', displayName: 'Organization', enableFiltering: true},
			             {field: 'facility', displayName: 'Facility'},
			             {field: 'asset', displayName: 'Asset'},
			             {field: 'anomaly', displayName: 'Anomaly'},
			             {field: 'createdTime', displayName: 'Ticket Creation Date'},
			             {field: 'closedTime', displayName: 'Ticket Closing Date'},
			             {field: 'eventID', displayName: 'Event ID'}
			             ]
		};
		
		$scope.reset = function(){
			$location.templateUrl = "/views/workOrderGrid";
			$route.reload();
		}
		
}]);