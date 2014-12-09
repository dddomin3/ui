'use strict';
 
angular.module('myApp.workOrderSummary', ['ngRoute', 'ui.grid', 'ui.grid.autoResize'])

.run(['directiveService', function(directiveService){
	directiveService.addSideBarComponent({
		tag: function(){return 'work-order-summary';},
		configTag: function(){return 'work-order-summary-config';},
		tagHtml: function(){return "<work-order-summary></work-order-summary>";},
		directiveName: function(){return 'workOrderSummary';},
		namespace: function(){return 'workordersummary';},
		paletteImage: function(){return 'smallChart.png';}
		}
	);
}])

.factory('workOrderSummaryService', ['$http','sharedPropertyService', function($http, sharedProperties){
	
	var _getFacilityData = function(){
		var organization = sharedProperties.getOrganization();
		
		var _serviceObject = {};
		var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var today = new Date();
		var firstOfMonth = new Date(today.getFullYear(), today.getMonth()-6, 1);
		
		var requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+firstOfMonth.toJSON()+"\" }, \"$lt\": { \"$date\": \""+today.toJSON()+"\" }}, \"organization\" : \""+organization+"\"}";
		
		var config = {
			method: 'POST',
			headers: {'Collection' : 'Event'},
			url: mongoUrl,
			data: requestString
		};
		
		var promise = $http(config).success(function(data, status, headers, config){
			
		})
		return promise;
	};
	var serviceObject = {
		getFacilityData : _getFacilityData,
	};
	return serviceObject;	
}])

.factory('sharedPropertyService', ['$http', function($http){
	
	var _assetNames;
	var _facilityNames;
	var _facility;
	var _results;
	var _asset;
	var _openTickets;
	var _organization;
		
	var _setOrganization = function(organization){
		_organization = organization;		
	}
	
	var _getOrganization = function(){
		return _organization;
	}
	
	var _setAllOpenTickets = function(openTickets){
		_openTickets = openTickets;
	}
	
	var _getAllOpenTickets = function(){
		return _openTickets;
	}
	
	var _setAssetNames = function(assetNames){
		_assetNames = assetNames;
	}
	
	var _getAssetNames = function(){
		return _assetNames;
	}
	var _setFacilityNames = function(facilityNames){
		_facilityNames = facilityNames;
	}
	
	var _getFacilityNames = function(){
		return _facilityNames;
	}
	
	var _setAsset = function(asset){
		_asset = asset;
	}
	
	var _getAsset = function(){
		return _asset;
	}
	
	var _setResults = function(results){		
		_results = results;
	}
	
	var _getResults = function(){
		return _results;
	}
	
	var _setFacility = function(facility){
		_facility = facility;
	}
	
	var _getFacility = function(){
		return _facility;
	}
	
	var _serviceObj = {
			getOrganization : _getOrganization,
			setOrganization: _setOrganization,
			setAllOpenTickets : _setAllOpenTickets,
			getAllOpenTickets : _getAllOpenTickets,
			getFacilityNames : _getFacilityNames,
			setFacilityNames : _setFacilityNames,
			getAssetNames : _getAssetNames,
			setAssetNames : _setAssetNames,
			getAsset : _getAsset,
			setAsset : _setAsset,
			getFacility : _getFacility,
			setFacility : _setFacility,
			getResults : _getResults,
			setResults : _setResults
		};	
	return _serviceObj;
}])

.factory('findOrganizationService', ['$http', 'sharedPropertyService', function($http, sharedProperties, dataService){
		
	var _serviceObj = {};
	var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
	var today = new Date();
	var firstOfMonth = new Date(today.getFullYear(), today.getMonth()-10, 1);
	
	var requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+firstOfMonth.toJSON()+"\" }, \"$lt\": { \"$date\": \""+today.toJSON()+"\" }}}";	
	
	var config = {
			method: 'POST',
			headers: {'Collection':'Event'},
			url: mongoUrl,
			data: requestString
	};
		
	var _promise = $http(config).success(function(data, status, headers, config){
				
	}).
	error(function(data, status, headers, config){
		
	});
		
	_serviceObj = {
			promise: _promise,
	};
	
	return _serviceObj;
}])

.controller('workOrderSummaryConfigCtrl', ['$modalInstance','$modal', '$http', '$scope', '$location', 'uiGridConstants', '$route','findOrganizationService', 'sharedPropertyService', 'workOrderSummaryService',  
  function($modalInstance, $modal, $http, $scope, $location, uiGridConstants, $route, dataService, sharedProperties, workOrderService){
	
	$scope.drawChartNow = false;
	$scope.drawChartNowFacility = false;
	
	dataService.promise.then(function(response){
		$scope.responseData = response.data.result;
		if($scope.responseData == null){
			alert("No event data was found for this month."); 
			$location.url('\workOrderSummaryModal'); 
			$route.reload();
		}
		
		var organizationNames = [];
		for(var i=0;i<$scope.responseData.length;i++) {
			if(organizationNames.indexOf($scope.responseData[i].organization) == -1) {
				organizationNames.push($scope.responseData[i].organization);
			}
		}
		$scope.organizationNames = organizationNames;
		$scope.organizationView(organizationNames[0]);
	});	
	
	$scope.closeWindow = function(){
		$modalInstance.dismiss('cancel');
	}
	
	$scope.organizationView = function(organizationName){
		sharedProperties.setOrganization(organizationName);
		$scope.drawChartNowFacility = false;
		
		/*$modalInstance.close();
		$location.url('/workOrderSummary');
		$route.reload();*/
		
		//TODO New logic starts here
		
		workOrderService.getFacilityData().then(function(response){
			$scope.workOrderData = response.data.result;
			var facilityNames = [];
			for(var i=0;i<$scope.workOrderData.length;i++) {
				if(facilityNames.indexOf($scope.workOrderData[i].facility) == -1) {
					facilityNames.push($scope.workOrderData[i].facility);
				}
			}
			$scope.facilityNames = facilityNames;
			$scope.getOpenTickets().then(function(ticketData){
				$scope.ticketData = ticketData.data.result;				
				var organizationObject = [];
				for(var i=0;i<$scope.facilityNames.length;i++){
					
					var numEvents = 0;
					var numClosedEvents = 0;
					var totalTimeToClose = 0;
					var numOpenEvents = 0;
					var potentialSavings = 0;
					var waste = 0;
					
					for(var j=0;j<$scope.workOrderData.length;j++){
						if($scope.workOrderData[j].facility === $scope.facilityNames[i]){
							numEvents +=1;
							if($scope.workOrderData[j].status === "Closed"){
								numClosedEvents += 1;
							}
							totalTimeToClose = totalTimeToClose + $scope.calculateDays($scope.workOrderData[j]);
							potentialSavings = potentialSavings + parseFloat($scope.workOrderData[j].potentialSaving);
							waste = waste + parseInt($scope.workOrderData[j].waste);
						}
					}
					for(var j=0;j<$scope.ticketData.length;j++){
						if($scope.ticketData[j].facility === $scope.facilityNames[i]){
							numOpenEvents += 1;
						}
					}
					var organizationViewObject = {facility: $scope.facilityNames[i], numberOfEvents: numEvents, numberOpenEvents: numOpenEvents, numberClosedEvents: numClosedEvents, averageTimeToClose: Math.round(totalTimeToClose/numEvents), waste: waste, value: Math.round(potentialSavings*100)/100};
					organizationObject.push(organizationViewObject);
				}
				$scope.chartData = organizationObject;
				$scope.drawChartNow = true;
				$scope.organizationName = organizationName;
			})	
		})
		
		
		$scope.test = {
				showFacility: function(row){
				$scope.facilityView(row);
				},
				showAsset: function(row){
				}
		};
		
		
		//put outside of then stuff here....
		
		$scope.facilityView = function(row){
			$scope.facilityName = row.facility;
			var assetNames = [];
			var facilityWorkOrders = [];
			var facilityViewObject = [];
			for(var i=0;i<$scope.workOrderData.length;i++){
				if($scope.workOrderData[i].facility === row.facility){
					facilityWorkOrders.push($scope.workOrderData[i]);
					if(assetNames.indexOf($scope.workOrderData[i].asset) == -1){
						assetNames.push($scope.workOrderData[i].asset)
					}
				}
			}
			for(var i=0;i<assetNames.length;i++){
				var numOpenEvents = 0;
				var totalTimeToClose = 0;
				var numEvents = 0;
				var numClosedEvents = 0;
				var waste = 0;
				var potentialSavings = 0;
				for(var j=0;j<facilityWorkOrders.length;j++){
					if(facilityWorkOrders[j].asset === assetNames[i]){
						numEvents += 1;
						if(facilityWorkOrders[j].status === "Closed"){
							numClosedEvents += 1;
						}
						totalTimeToClose = totalTimeToClose + $scope.calculateDays(facilityWorkOrders[j]);
						waste = waste + parseFloat(facilityWorkOrders[j].waste);
						potentialSavings = potentialSavings + parseFloat(facilityWorkOrders[j].potentialSaving);
					}
				}
				for(var j=0;j<$scope.ticketData.length;j++){
					if($scope.ticketData[j].facility === row.facility){
						if($scope.ticketData[j].asset === assetNames[i]){
							numOpenEvents += 1;
						}
					}
				}
					
				var chartRow = {asset: assetNames[i], numberOfEvents: numEvents, numberEventsClosed : numClosedEvents, numberEventsOpen : numOpenEvents, averageTimeToClose: Math.round(totalTimeToClose/numEvents), waste: waste, value: Math.round(potentialSavings*100)/100}; 
				facilityViewObject.push(chartRow);
			}
			$scope.facilityData = facilityViewObject;
			$scope.chartDataFacility = $scope.facilityData;
			$scope.drawChartNowFacility = true;
		}
		
		$scope.getOpenTickets = function(){
			
			var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
			var requestString = "{\"status\": \"Open\"}";
			var config = {
					method: 'POST',
					headers: {'Collection':'Event'},
					url: mongoUrl,
					data: requestString
			};
			
			var ticketPromise =  $http(config).success(function(data, status, headers, config){
							
				}).
				error(function(data, status, headers, config){
					
				});
			return ticketPromise;
		};
		
		$scope.calculateDays = function(event){
			var number;
			var createdDate = new Date(event.createdTime);
			var closedDate;		
				if(event.status === "Closed"){
					closedDate = new Date(event.closedTime);
				}
				else{
					closedDate = new Date();
				}
			
			number = (closedDate - createdDate)/(1000*60*60*24) //get the time difference between the two date objects in days.
		
			return number;
		};
	};
	$scope.gridOptions = {
			enableSorting: true,
			onRegisterApi: function(gridApi){
				$scope.gridApi = gridApi;
			},
			rowTemplate: '<div ng-click="getExternalScopes().showFacility(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			showFooter: true,
			data: 'chartData',
			columnDefs: [
			             {field: 'facility', displayName: 'Facility'},
			             {field: 'numberOfEvents', displayName: 'Number Of Events Created This Month', aggregationType: uiGridConstants.aggregationTypes.sum},			             
			             {field: 'numberClosedEvents', displayName: 'Number of Events Closed This Month', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'numberOpenEvents', displayName: 'Total Number of Open Events', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'averageTimeToClose', displayName: 'Average Days To Close Event(s)', aggregationType: uiGridConstants.aggregationTypes.avg},
			             {field: 'waste', displayName: 'Waste', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'value', displayName: 'Avoidable Cost', aggregationType: uiGridConstants.aggregationTypes.sum}
			             ]
		};
	$scope.gridOptionsFacility = {
			enableSorting: true,
			rowTemplate: '<div ng-click="getExternalScopes().showAsset(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			showFooter: true,
			data: 'chartDataFacility',
			columnDefs: [
			             {field: 'asset', displayName: 'Asset'},
			             {field: 'numberOfEvents', displayName: 'Number Of Events Created This Month', aggregationType: uiGridConstants.aggregationTypes.sum},			             
			             {field: 'numberEventsClosed', displayName: 'Number of Events Closed This Month', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'numberEventsOpen', displayName: 'Total Number of Open Events', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'averageTimeToClose', displayName: 'Average Days To Close Event(s)'},
			             {field: 'waste', displayName: 'Waste', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'value', displayName: 'Avoidable Cost', aggregationType: uiGridConstants.aggregationTypes.sum}
			             ]
		};
}])

.controller('workOrderSummaryModalCtrl', ['$scope', '$modal', 'sharedPropertyService', function($scope, $modal, sharedProperties){
	$scope.open = function (size){
		var modalInstance = $modal.open({
			templateUrl : 'views/workOrderSummaryConfig.html',
			controller : 'workOrderSummaryConfigCtrl',
			size : size,
		})
	}
}])

.controller('workOrderSummaryAssetCtrl', ['$scope', '$location', 'uiGridConstants', '$route', 'sharedPropertyService', 
  function($scope, $location, uiGridConstants, $route, sharedProperties){
	$scope.assetName = sharedProperties.getAsset();
	$scope.facilityName = sharedProperties.getFacility();
	$scope.responseData = sharedProperties.getResults();
	$scope.assetNames = sharedProperties.getAssetNames();
	$scope.facilityNames = sharedProperties.getFacilityNames();
	$scope.openTickets = sharedProperties.getAllOpenTickets();
	
	if($scope.responseData == null){
		$location.url('/workOrderSummaryModal');			
		$route.reload();
	}
	
	$scope.calculateDays = function(event){
		var number;
		var createdDate = new Date(event.createdTime);
		var closedDate;		
			if(event.status === "Closed"){
				closedDate = new Date(event.closedTime);
			}
			else{
				closedDate = new Date();
			}
		
		number = (closedDate - createdDate)/(1000*60*60*24) 
		
		return number;
	}
	
	var numEvents = 0;
	var numClosedEvents = 0;
	var totalTimeToClose = 0;
	var numOpenTickets = 0;
	var potentialSavings = 0;
	var waste = 0;
	
	for(var i=0;i<$scope.responseData.length;i++){
		if($scope.responseData[i].facility === $scope.facilityName){
			if($scope.responseData[i].asset === $scope.assetName){
				numEvents += 1;
				if($scope.responseData[i].status === "Closed"){
					numClosedEvents += 1;
				}
				totalTimeToClose = totalTimeToClose + $scope.calculateDays($scope.responseData[i]);
				potentialSavings = potentialSavings + parseFloat($scope.responseData[i].potentialSaving);
				waste = waste + parseInt($scope.responseData[i].waste);
			}
		}
	}
	for(var i=0;i<$scope.openTickets.length;i++){
		if($scope.openTickets[i].facility === $scope.facilityName){
			if($scope.openTickets[i].asset === $scope.assetName){
				numOpenTickets += 1;
			}
		}
	}
		
	$scope.changeAssetView = function(assetName){
		sharedProperties.setAsset(assetName);
		$location.url('/workOrderSummaryAsset');			
		$route.reload();
	}
	
	$scope.changeFacilityView = function(facilityName){	
		sharedProperties.setFacility(facilityName); 
		sharedProperties.setResults($scope.responseData);
		sharedProperties.setFacilityNames($scope.facilityNames);
		$location.url('/workOrderSummaryFacility');
		$route.reload();
	}
	
	$scope.backToOverview = function(){
		$location.url('/workOrderSummary');
		$route.reload();
	}
	
	$scope.backToOrganizationSelect = function(){
		$location.url('/workOrderSummaryModal');
		$route.reload();
	};
	
	var assetObject = [{asset: $scope.assetName, numberOfEvents: numEvents, numberOpenEvents: numOpenTickets, numberClosedEvents: numClosedEvents, averageTimeToClose: Math.round(totalTimeToClose/numEvents), waste: waste, value: Math.round(potentialSavings*100)/100}];
	$scope.assetView = assetObject;
	$scope.gridOptions = {
			enableSorting: true,
			data: 'assetView',
			columnDefs: [
			             {field: 'asset', displayName: 'Asset'},
			             {field: 'numberOfEvents', displayName: 'Number Of Events Created This Month'},
			             {field: 'numberClosedEvents', displayName: 'Number of Events Closed This Month'},
			             {field: 'numberOpenEvents', displayName: 'Total Number of Open Events'},
			             {field: 'averageTimeToClose', displayName: 'Average Days To Close Event(s)'},
			             {field: 'waste', displayName: 'Waste'},
			             {field: 'value', displayName: 'Avoidable Cost'}
			             ]
	};
}])

.controller('workOrderSummaryFacilityCtrl', ['$scope', '$location', 'uiGridConstants', '$route', 'sharedPropertyService', 
  function($scope, $location, uiGridConstants, $route, sharedProperties){
	
	$scope.test = {
			showMessage: function(row){
				$scope.assetView(row.asset);
			}
	};
	
	$scope.facilityName = sharedProperties.getFacility();
	$scope.responseData = sharedProperties.getResults();
	$scope.facilityNames = sharedProperties.getFacilityNames();
	$scope.openTickets = sharedProperties.getAllOpenTickets();
		
	if($scope.responseData == null){
		$location.url('/workOrderSummaryModal');			
		$route.reload();
	}
	
	$scope.calculateDays = function(event){
		var number;
		var createdDate = new Date(event.createdTime);
		var closedDate;		
			if(event.status === "Closed"){
				closedDate = new Date(event.closedTime);
			}
			else{
				closedDate = new Date();
			}
		
		number = (closedDate - createdDate)/(1000*60*60*24); 
		
		return number;
	}
	
	var assetNames = [];	
	var facilityArray = [];
		
		for(var i=0;i<$scope.responseData.length;i++){
			if($scope.responseData[i].facility === $scope.facilityName){
				if(assetNames.indexOf($scope.responseData[i].asset) == -1){
					assetNames.push($scope.responseData[i].asset);
				}
			}
		}
		for(var i=0;i<assetNames.length;i++){
			var numEvents = 0;
			var numClosedEvents = 0;
			var totalTimeToClose = 0;
			var numOpenTickets = 0;
			var potentialSavings = 0;
			var waste = 0;
			for(var j=0;j<$scope.responseData.length;j++){
				if($scope.responseData[j].asset === assetNames[i] && $scope.responseData[j].facility === $scope.facilityName){
					numEvents +=1;
					if($scope.responseData[j].status === "Closed"){
						numClosedEvents += 1;
					}
					totalTimeToClose = totalTimeToClose + $scope.calculateDays($scope.responseData[j]);
					potentialSavings = potentialSavings + parseFloat($scope.responseData[j].potentialSaving);
					waste = waste + parseInt($scope.responseData[j].waste);
				}
			}
			for(var j=0;j<$scope.openTickets.length;j++){
				if($scope.openTickets[j].facility === $scope.facilityName && $scope.openTickets[j].asset === assetNames[i]){
					numOpenTickets += 1;
				}
			}
			var facilityObject = {asset: assetNames[i], numberOfEvents: numEvents, numberOpenEvents: numOpenTickets, numberClosedEvents: numClosedEvents, averageTimeToClose: Math.round(totalTimeToClose/numEvents), waste: waste, value: Math.round(potentialSavings*100)/100};
			facilityArray.push(facilityObject)
		}
		$scope.facilityView = facilityArray;
			
	$scope.assetNames = assetNames;
		
	$scope.assetView = function(assetName){
		sharedProperties.setAsset(assetName);
		sharedProperties.setAssetNames($scope.assetNames);
		sharedProperties.setAllOpenTickets($scope.openTickets);
		$location.url('/workOrderSummaryAsset');			
		$route.reload();
	}
	
	$scope.changeFacilityView = function(facilityName){	
		sharedProperties.setFacility(facilityName);
		sharedProperties.setResults($scope.responseData);
		sharedProperties.setFacilityNames($scope.facilityNames);
		$location.url('/workOrderSummaryFacility');
		$route.reload();
	}
	
	$scope.backToOverview = function(){
		$location.url('/workOrderSummary');
		$route.reload();
	}
	
	$scope.backToOrganizationSelect = function(){
		$location.url('/workOrderSummaryModal');
		$route.reload();
	};
	
	$scope.gridOptions = {
			enableSorting: true,
			showFooter: true,
			rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			data: 'facilityView',
			columnDefs: [
			             {field: 'asset', displayName: 'Asset'},
			             {field: 'numberOfEvents', displayName: 'Number Of Events Created This Month', aggregationType: uiGridConstants.aggregationTypes.sum},			             
			             {field: 'numberClosedEvents', displayName: 'Number of Events Closed This Month', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'numberOpenEvents', displayName: 'Total Number of Open Events', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'averageTimeToClose', displayName: 'Average Days To Close Event(s)'},
			             {field: 'waste', displayName: 'Waste', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'value', displayName: 'Avoidable Cost', aggregationType: uiGridConstants.aggregationTypes.sum}
			             ]
	};
}])

.controller('workOrderSummaryCtrl', ['$http', '$scope', '$location', 'uiGridConstants', '$route','workOrderSummaryService', 'sharedPropertyService',   
  function($http, $scope, $location, uiGridConstants, $route, dataService, sharedProperties){
	$scope.test = {
			showMessage: function(row){
				$scope.facilityView(row.facility);
			}
	};
	
	$scope.organizationName = sharedProperties.getOrganization();
	dataService.getFacilityData().then(function(response){
		$scope.responseData = response.data.result;
		if($scope.responseData == null){
			alert("No event data was found for this month."); 
			$location.url('\workOrderSummaryModal'); 
			$route.reload();
		}
		var facilityNames = [];
		for(var i=0;i<$scope.responseData.length;i++) {
			if(facilityNames.indexOf($scope.responseData[i].facility) == -1) {
				facilityNames.push($scope.responseData[i].facility);
			}
		}
		$scope.facilityNames = facilityNames;
		
		$scope.getOpenTickets().then(function(responseTwo){
			$scope.openTickets = responseTwo.data.result;			
			var organizationObject = [];
			for(var i=0;i<$scope.facilityNames.length;i++){
				
				var numEvents = 0;
				var numClosedEvents = 0;
				var totalTimeToClose = 0;
				var numOpenEvents = 0;
				var potentialSavings = 0;
				var waste = 0;
				
				for(var j=0;j<$scope.responseData.length;j++) {
					if($scope.responseData[j].facility === $scope.facilityNames[i]) {
						numEvents += 1;
						if($scope.responseData[j].status === "Closed") {
							numClosedEvents += 1;
						}
						totalTimeToClose = totalTimeToClose + $scope.calculateDays($scope.responseData[j]);
						potentialSavings = potentialSavings + parseFloat($scope.responseData[j].potentialSaving);
						waste = waste + parseInt($scope.responseData[j].waste);
					}	
				}
				for(var j=0;j<$scope.openTickets.length;j++){
					if($scope.openTickets[j].facility === $scope.facilityNames[i]){
						numOpenEvents += 1;
					}
				}
				var organizationViewObject = {facility: $scope.facilityNames[i], numberOfEvents: numEvents, numberOpenEvents: numOpenEvents, numberClosedEvents: numClosedEvents, averageTimeToClose: Math.round(totalTimeToClose/numEvents), waste: waste, value: Math.round(potentialSavings*100)/100};
				organizationObject.push(organizationViewObject);
			}
			$scope.organizationView = organizationObject;
		});
	});
	
	$scope.getOpenTickets = function(){
		
		var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{\"status\": \"Open\"}";
		var config = {
				method: 'POST',
				headers: {'Collection':'Event'},
				url: mongoUrl,
				data: requestString
		};
		
		var ticketPromise =  $http(config).success(function(data, status, headers, config){
						
			}).
			error(function(data, status, headers, config){
				
			});
		return ticketPromise;
	};
	
	$scope.calculateDays = function(event){
		var number;
		var createdDate = new Date(event.createdTime);
		var closedDate;		
			if(event.status === "Closed"){
				closedDate = new Date(event.closedTime);
			}
			else{
				closedDate = new Date();
			}
		
		number = (closedDate - createdDate)/(1000*60*60*24) //get the time difference between the two date objects in days.
	
		return number;
	}
	
	$scope.facilityView = function(facilityName){
		sharedProperties.setFacility(facilityName);
		sharedProperties.setResults($scope.responseData);
		sharedProperties.setFacilityNames($scope.facilityNames);
		sharedProperties.setAllOpenTickets($scope.openTickets);
		$location.url('/workOrderSummaryFacility');
		$route.reload();
	}
	
	$scope.backToOrganizationSelect = function(){
		$location.url('/workOrderSummaryModal');
		$route.reload();
	};
	
	$scope.gridOptions = {
			enableSorting: true,
			rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			showFooter: true,
			data: 'organizationView',
			columnDefs: [
			             {field: 'facility', displayName: 'Facility'},
			             {field: 'numberOfEvents', displayName: 'Number Of Events Created This Month', aggregationType: uiGridConstants.aggregationTypes.sum},			             
			             {field: 'numberClosedEvents', displayName: 'Number of Events Closed This Month', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'numberOpenEvents', displayName: 'Total Number of Open Events', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'averageTimeToClose', displayName: 'Average Days To Close Event(s)', aggregationType: uiGridConstants.aggregationTypes.avg},
			             {field: 'waste', displayName: 'Waste', aggregationType: uiGridConstants.aggregationTypes.sum},
			             {field: 'value', displayName: 'Avoidable Cost', aggregationType: uiGridConstants.aggregationTypes.sum}
			             ]
	};
}])

.directive('workOrderSummaryConfig', [function() {
	return {
		restrict: 'E',
		controller: 'workOrderSummaryModalCtrl',
		templateUrl: 'views/workOrderSummaryModal.html'
	}
}])

.directive('workOrderSummary', [function() {
	return {
		restrict: 'E',
		scope: {},
		controller: 'workOrderSummaryModalCtrl',
		templateUrl: 'views/workOrderSummaryModal.html'
	}
}]);
	
