'use strict';

angular.module('myApp.workOrderGrid', ['ngRoute', 'ui.grid', 'ui.grid.edit', 'ui.grid.autoResize', 'ui.grid.exporter', 'ui.grid.selection'])

.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'work-order-grid';},
		configTag: function(){return 'work-order-grid-config';},
		tagHtml: function(){return "<work-order-grid></work-order-grid>";},
		directiveName: function(){return 'workOrderGrid';},
		namespace: function(){return 'workorders';},
		paletteImage: function(){return 'smallChart.png';}
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
			onRegisterApi: function(gridApi){
				$scope.gridApi = gridApi;
			},
			enableFiltering: true,
			enableRowHeaderSelection: false,
			multiSelect: false,
			enableGridMenu: true,
			exporterLinkLabel: 'click to download file',
			/*exporterPdfDefaultStyle: {fontSize: 9},
			exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
			exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
			exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
			exporterPdfFooter: function ( currentPage, pageCount ) {
			return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
			},
			exporterPdfCustomFormatter: function ( docDefinition ) {
			docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
			docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
			return docDefinition;
			},
			exporterPdfOrientation: 'portrait',
			exporterPdfPageSize: 'LETTER',
			exporterPdfMaxGridWidth: 500,*/
			exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
			data: 'eventData',
			rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			columnDefs: [
			             {field: 'organization', displayName: 'Organization', visible: true},
			             {field: 'facility', displayName: 'Facility', visible: true},
			             {field: 'asset', displayName: 'Asset', visible: true},
			             {field: 'anomaly', displayName: 'Anomaly', visible: true},
			             {field: 'createdTime', displayName: 'Ticket Creation Date', visible: true},
			             {field: 'closedTime', displayName: 'Ticket Closing Date', visible: true},
			             {field: 'eventID', displayName: 'Event ID', visible: true},
			             ]
	
		};
		
		$scope.cleanPoo = function(){
			alert("Are you sure you want to change this chart???");
			$location.url('\workOrderGrid');
			$route.reload();
		}
		
		$scope.reset = function(){
			for(var i=0;i<$scope.gridOptions.columnDefs.length;i++){
				$scope.gridOptions.columnDefs[i].visible = true;
			}
			$scope.gridApi.grid.refresh();
		}
		
		 
		 /*Below is how you redraw a ui-grid chart dynamically.  Apparently, the 'data' field is just a 
		  * reference to the data used in the chart.  This reference persists, so attempting
		  * something like $scope.gridOptions.data = something different; then refreshing will 
		  * have no effect but changing the variable on the scope ('eventData' in this case)
		  * and then refreshing (really wonky methodology BTW) will redraw the chart with new
		  * data, column definitions etc.  Also, the 'onRegisterApi: yada, yada' is not needed the second time.
		  * Since there really is just one chart, the initial placement on the scope is sufficient */ 
		  /*
		   * 
		   *$scope.reset = function(){
				for(var i=0;i<$scope.gridOptions.columnDefs.length;i++){
					$scope.gridOptions.columnDefs[i].visible = true;
					
				}
				$scope.eventData = [{name: "Butt", age: "Head"}, {name: "Bea", age: "Vis"}];
				$scope.gridOptions = {
						enableSorting: true,
						/*onRegisterApi: function(gridApi){
							$scope.gridApi = gridApi;
						},
						enableFiltering: true,
						multiSelect: false,
						data: 'eventData',
						rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
						columnDefs: [
						             {field: 'name', displayName: 'First Name', visible: true},
						             {field: 'age', displayName: 'Last Name', visible: true}
						             ]
				
					};
				$scope.gridApi.grid.refresh();
			}*/	
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
