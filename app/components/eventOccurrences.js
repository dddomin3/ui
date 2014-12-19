'use strict';
angular.module('myApp.eventOccurrences', ['ngRoute'])
.run(['directiveService', function(directiveService){
	directiveService.addSideBarComponent({
		tag: function(){return 'event-occurrences';},
		configTag: function(){return '';},
		tagHtml: function(){return "<event-occurrences></event-occurrences>";},
		directiveName: function(){return 'eventOccurrences';},
		namespace: function(){return 'eventOccurrances'},
		paletteImage: function(){return 'report.png';}
		});
}])



.factory('eventOccurrencesService', ['$http', function($http){
		var _getWorkOrders = function(bodyString){
			var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
			var requestString = bodyString;
			var config = {
					method:'POST',
					headers: {'Collection': 'Event'},
					url:Url,
					data:requestString
			}
			return $http(config)
			.success(
				function (data) {
				}
			)
		};
		
		//for getting the user default timeFrame
		var _getDefaults = function(bodyString){
			var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
			var requestString = bodyString;
			var config = {
					method:'POST',
					headers: {'Collection': 'User'},
					url:Url,
					data:requestString
			}
			return $http(config)
			.success(
				function (data) {
				}
			)
		};
		
		//for setting the user default timeFrame
		var _setDefaults = function(bodyString){
			var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/save";
			var requestString = bodyString;
			var config = {
					method:'POST',
					headers: {'Collection': 'User'},
					url:Url,
					data:requestString
			}
			return $http(config)
			.success(
				function (data) {
				console.log("success using "+requestString);
				}
			)
		};
			
			
		var servObj = {
		getWorkOrders: _getWorkOrders,
		getDefaults: _getDefaults,
		setDefaults: _setDefaults,
		};
		return servObj;
}])


.controller('eventOccurrencesCtrl', ['$scope', '$location', '$route', 'eventOccurrencesService','$modal',  
  function($scope, $location, $route,eventOccurrenceData,$modal) {
	

	$scope.modPer=false;
	var user = {
	name: "pcieg054",
	permissions: ["Modify","DerpAround"],
	}
	
	for(var permission in user.permissions){
	
			if(user.permissions[permission]==="Modify"){
			
			$scope.modPer=true;
			}
		}
	
	
	
	
	$scope.modifyDefault = function(defaultString){
		if($scope.modPer===true){
			var bodyString='{"username":"pcieg054","preference":{"timeFrame" :"'+defaultString+'"}}';
			eventOccurrenceData.setDefaults(bodyString);
			
		}
	}
	
	
	var bodyString = '{"username":"pcieg054"}';//TODO: create request body string here
	eventOccurrenceData.getDefaults(bodyString).then(function(response){
	console.log(response);
	var parsedResponse = response.data.result[0].preference.timeFrame;//TODO: parse result here
	$scope.setDateRange(parsedResponse);//should be parsed Response
	$scope.activeTimeframe = parsedResponse;
	$scope.runQuery();
	})
	
   $scope.openConfig = function(size) {
	
		
		var modalInstance = $modal.open({
			templateUrl: 'views/dateSelector.html',
			controller: 'dateSelectorCtrl',
			size: size,
			scope: $scope
		});

	}
	
   $scope.runQuery = function () {
   if($scope.startDate!==undefined){
   	var realStartYear = $scope.startDate.getFullYear();
var realStartDate = $scope.startDate.getDate();
var realStartMonth = $scope.startDate.getMonth()+1;
var realEndYear = $scope.endDate.getFullYear();
var realEndDate = $scope.endDate.getDate();
var realEndMonth = $scope.endDate.getMonth()+1;
var bodyString = '{"createdTime": {"$gt" : { "$date": "'+realStartYear+'-'+realStartMonth+'-'+realStartDate+'T04:00:00.000Z" }, "$lt": { "$date": "'+realEndYear+'-'+realEndMonth+'-'+realEndDate+'T04:00:00.000Z" }}}'

	eventOccurrenceData.getWorkOrders(bodyString).then(function(response){
	$scope.responseData = response.data.result;
	if(response.data.result===null){$scope.numberOfTickets = 0;}
	else{$scope.numberOfTickets = response.data.result.length;}
	});
	
	}
	};
	
	
	
	$scope.setDateRange = function(selection){

		if(selection==="All"){
		var sDate = new Date();
		sDate.setTime(0);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		if(selection==="Last 24 Hours"){
		var sDate = new Date();
		sDate.setDate(sDate.getDate()-1);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="Last 7 Days"){
		var sDate = new Date();
		sDate.setDate(sDate.getDate()-7);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="Last 12 Months"){
		var sDate = new Date();
		sDate.setFullYear(sDate.getFullYear()-1);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="Today"){
		var sDate = new Date();
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="This Week"){
		var sDate = new Date();
		sDate.setDate(sDate.getDate()-sDate.getDay());
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="This Month"){
		var sDate = new Date();
		sDate.setDate(1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="This Year"){
		var sDate = new Date();
		sDate.setMonth(0);
		sDate.setDate(1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="This Quarter"){
		var sDate = new Date();
		sDate.setMonth(Math.floor(sDate.getMonth()/3)*3);
		sDate.setDate(1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		$scope.endDate = new Date();
		}
		else if(selection==="Last Full Day"){
		var sDate = new Date();
		
		sDate.setDate(sDate.getDate()-1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		
		var eDate = new Date();
		eDate.setMinutes(0);
		eDate.setHours(0);
		eDate.setSeconds(0);
		eDate.setMilliseconds(0);
		$scope.endDate = eDate;
		}
		else if(selection==="Last Full Week"){
		var sDate = new Date();
		
		sDate.setDate(sDate.getDate()-sDate.getDay()-7);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
	
		var eDate = new Date();
		eDate.setDate(eDate.getDate()-eDate.getDay());
		eDate.setMinutes(0);
		eDate.setHours(0);
		eDate.setSeconds(0);
		eDate.setMilliseconds(0);
		$scope.endDate = eDate;
	
		}
		else if(selection==="Last Full Month"){
		var sDate = new Date();
		sDate.setMonth(sDate.getMonth()-1);
		sDate.setDate(1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		
		var eDate = new Date();
		
		eDate.setDate(1);
		eDate.setMinutes(0);
		eDate.setHours(0);
		eDate.setSeconds(0);
		eDate.setMilliseconds(0);
		$scope.endDate = eDate;
		}
		else if(selection==="Last Full Year"){
		var sDate = new Date();
		sDate.setFullYear(sDate.getFullYear()-1);
		sDate.setMonth(0);
		sDate.setDate(1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		
		var eDate = new Date();
		eDate.setMonth(0);
		eDate.setDate(1);
		eDate.setMinutes(0);
		eDate.setHours(0);
		eDate.setSeconds(0);
		eDate.setMilliseconds(0);
		$scope.endDate = eDate;
		}
		else if(selection==="Last Full Quarter"){
		var sDate = new Date();
		sDate.setFullYear(sDate.getFullYear()-1);
		sDate.setMonth((Math.floor(sDate.getMonth()/3)-1)*3);
		sDate.setDate(1);
		sDate.setMinutes(0);
		sDate.setHours(0);
		sDate.setSeconds(0);
		sDate.setMilliseconds(0);
		$scope.startDate = sDate;
		
		var eDate = new Date();
		eDate.setMonth(Math.floor(eDate.getMonth()/3)*3);
		eDate.setDate(1);
		eDate.setMinutes(0);
		eDate.setHours(0);
		eDate.setSeconds(0);
		eDate.setMilliseconds(0);
		$scope.endDate = eDate;
		}
		
	}
	
}])



.controller('dateSelectorCtrl', ['$scope', '$modalInstance',  
  function($scope, $modalInstance) {
	
	var thisScope = $scope.$parent;
	$scope.ok = function() {
	http://localhost:8000/app/report.png		
	$modalInstance.close();
		thisScope.startDate = $scope.startDate;
	thisScope.endDate = $scope.endDate;
	$scope.activeTimeframe = thisScope.activeTImeframe;
	thisScope.runQuery();
	};
	
	var timeFrameList = ["All","Today","This Week","This Month","This Quarter","This Year","Last 24 Hours","Last 7 Days","Last 12 Months","Last Full Day","Last Full Week","Last Full Month","Last Full Quarter","Last Full Year"];
	$scope.timeFrameList = timeFrameList;
	
	
$scope.setDateRange = function(selection){
return $scope.$parent.setDateRange(selection);
}

	$scope.isBlank = function(thisString){
		//if($scope._clientName===undefined){$scope._clientName="";}
		//if($scope._projectName===undefined){$scope._projectName="";}
		//if($scope._stationName===undefined){$scope._stationName="";}
		//if($scope._squareFootage===undefined){$scope._squareFootage="";}
		//if($scope._image===undefined){$scope._image="";}
		//console.log($scope.activeOrg+"_"+$scope.activeClient);
		if(thisString==="" || thisString===undefined || thisString==="null"){
			return true;
		}
		else{
			return false;
		}
	}
	
	
	
   
   
}])

.directive('eventOccurrences', [ function() {
	return {
		restrict: 'E',
		templateUrl : 'views/eventOccurrences.html'
	}
}])

.directive('dateSelector', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/dateSelector.html'
	}
}]);
