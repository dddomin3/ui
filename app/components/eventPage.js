'use strict';
 
angular.module('myApp.eventPage', ['ngRoute'])
  
  .controller('eventPageCtrl', ['$scope','$http', '$location', '$route', '$window', 
    function($scope, $http, $location, $route, $window) {

	 //*******************************debugging/troubleshooting variables/functions *****************************
	  
	 $scope.timeseries = "not time series";
	 var ticketID = "PLP-0126879";
	 var pointsUsed;

	 //**********************************  end debugging/troubleshotting variables/functions ***********************
	 
	 //TODO receive the proper work order number ($scope variable change, watch scope variable for change)
	 
	 $scope.workOrderNumber = ticketID;
	 $scope.myTicketType = "null";
	 $scope.myAsset = "null";
	 $scope.organization = "null";
	 $scope.doMyGraphing = false;
	 
	 var getAsset = function(){
		 return $scope.myTicket == null ? "null" : $scope.myTicket.asset;
	 }
	 
	 var workOrderRequest = "eventID : \"" + $scope.workOrderNumber.toString() +"\"";
	 var eventHeader = {'Collection':'Event'};
	 var contentHeader = {'Content-Type':'application/json'};
	 
	 var getAssetRequest = function(output){
		 return "\"asset\" : \"" + output.toString() +"\"";
	 };
	 
	 var getTicketTypeRequest = function(output){
		 
		 return "\"anomaly\" : \"" + output.toString() + "\"";
	 }
	 
	 var assetHeader = {'Collection': 'Event'};
	 
	 var pointRequest = "{\"eventID\" : \"" + ticketID +"\"}";
	 var pointHeader;

	 var requestObject = function(header, requestString){
	   var mongoUrl = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
	   
	   var config = {
	     method: 'POST',
	     headers: header,
		 url: mongoUrl,
		 data: requestString
	   };
			
	   var ticketPromise =  $http(config)
		     .success(function(data, status, headers, config){ })
		     .error(function(data, status, headers, config){ })
	   ;
	   
	   return ticketPromise;
	 };
	 
	 
	 //  ***********  throw-away function for programming/debugging only  ********************
	 requestObject(eventHeader, "{"+workOrderRequest+"}")
	     .then(function(response){
			if(response.data.result == null){
				console.log("no results for that work order!!");
				return;
			}
			
			$scope.myTicketType = response.data.result[0].anomaly;
			$scope.myAsset = response.data.result[0].asset;
	   }).then(function(){
		   getAllMyTickets();
	   })
	 ;
	 
	 var drawMyGraphs = function(){
		 console.log("graphs!!");
	 }
	 
	 
	//  ***********  End throw-away function for programming/debugging only  ********************
	 
	 //TODO query database for the relevant work orders
	 
	 var getAllMyTickets = function(){
		 requestObject(eventHeader, "{"+getTicketTypeRequest($scope.myTicketType)+","+getAssetRequest($scope.myAsset)+"}")
		 .then(function(response){	
			 if(response.data.result == null){
				console.log("no results for those filter criteria!!");
				return;
			}
			
			$scope.allMyTickets = response.data.result;
			$scope.organization = response.data.result[0].stationName;
			
			//TODO receive point list from the database object
			pointsUsed = response.data.result[0].pointsUsed === undefined ? ["kWh2","kWh_Temp","SITE_kW"] :  response.data.result[0].pointsUsed;
		 }).then(function(){
			 //TODO create full history tables of the database object ** will probably need to break down into time windows to make faster querying **
			 getAllMyPoints(pointsUsed);
		 })
	   ;
		 
	 };
	 
	 $scope.logMe = function(){
		 console.log($scope);
		 console.log(allMyPoints);
	 };
	 
	 
	 //TODO query database for the relevant points
	 
	 var allMyPoints = [];
	 
	 var getAllMyPoints = function(_pointArray){
		 var organizationMessage = "\"organization\": \""+$scope.organization.toString()+"\"";
		 var nameStart = "\"name\":\"";
		 allMyPoints = [];
		 
		 var max = pointsUsed.length;
		 var counter = 0;
		 
		 for(var i = 0; i < max; i++){
			 var nameMessage = nameStart+pointsUsed[i];
			 var myArray = function(name, header, message){
				 requestObject(header, message).then(function(response){
				     allMyPoints[name] = response.data.result;
				     counter++;
				 }); 
			 };
			 
			 //TODO treat the data to fit within the needed format of everything..			 
			 myArray(pointsUsed[i], contentHeader, "{"+organizationMessage+","+nameMessage+"\"}");;
		 };
		 
		 var retry = function(flag){
			 if(!flag){
				 setTimeout(function(){
					 retry(counter == max);
				 },10);
			 }
			 else{
				 $scope.doMyGraphing = true; 
				 $scope.$apply();
			 }
			 
			 return counter == max;
		 };
		 
		 retry(counter == max);
	 }
	 
	 $scope.$watch(
		 'doMyGraphing', 
		 function(val){
			 if(val == true){
				 drawMyGraphs();	 
			 }
		 }
	);
	 
	 //TODO display the anomaly detail information

	 //TODO graph the points
	 //TODO create tables for the points
	 
	 //TODO cleanup!!
	 //TODO perform null checks on start (query down to ticket type and asset, get full list of tickets matching those requirements)
	 //TODO package into a directive which may have variables set
	 //TODO 
	 
    }
  ])
;