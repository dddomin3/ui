'use strict';


angular.module('myApp.eventPage', ['ngRoute'])
  
  .directive('eventPage', ['chartIdService',function(chartIdService){
	  return{
		  restrict:'E',
		  templateUrl : 'views/eventPage.html',
		  scope:{
			  dcName:"@",
			  workOrderNumber:"@"
		  },
		  compile : function(element, attrs){
			  if(!attrs.hasOwnProperty('dom') ){
				  attrs.dcName = chartIdService.getNewId();
			  }
		  },
		  controller: function($scope, $http, $location, $route, $window,$element,eventPageService) {

				 //*******************************debugging/troubleshooting variables/functions *****************************
				  	
				 var getTicketID = function(){
					 eventPageService.getWorkOrderNumber();
					 eventPageService.setWorkOrderNumber();
					 if($scope.dcName.indexOf(1) >= 0){
						 $scope.pointsUsed = ["Site_kWh1","SITE_kW"];
						 return "PLP-0126879";
						 //organization ANDO
					 }else {
						 $scope.pointsUsed = ["B100_KWH","B200_KWH","B400_KWH","B500_KWH"];
						 return "DEU-0165521";
						 //organization JACK
					 }
				 }
				 
				 $scope.changeWorkOrder = function(current){
					 if(current === "PLP-0126879"){
						 $scope.workOrderNumber = "DEU-0165521";
						 $scope.pointsUsed = ["B100_KWH","B200_KWH","B400_KWH","B500_KWH"];
					 }else{
						 $scope.pointsUsed = ["Site_kWh1","SITE_kW"];
						 $scope.workOrderNumber = "PLP-0126879"; 
					 }	
				 }
								 
				 //**********************************  end debugging/troubleshotting variables/functions ***********************
				 
				 // receive the proper work order number ($scope variable change, watch scope variable for change)
				 
				 if($scope.workOrderNumber === undefined){
					 $scope.workOrderNumber = getTicketID();
				 }
				 
				 if($scope.myTicketType === undefined){
					 $scope.myTicketType = "null";
				 }
				 
				 if($scope.myAsset === undefined){
					 $scope.myAsset = "null"; 
				 }
				 
				 if($scope.organization === undefined){
					 $scope.organization = "null"; 
				 }
				 
				 $scope.doMyGraphing = false;
				 
				 var getAsset = function(){
					 return $scope.myTicket == null ? "null" : $scope.myTicket.asset;
				 }
				 
				 var formatRequest = function(first, second){
					 return "\""+first+"\":\""+second+"\"";
				 }
				 
				 var eventHeader = {'Collection':'Event'};
				 var contentHeader = {'Content-Type':'application/json'};
				 
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
				 
				 var requestFromWorkOrder = function(){
				   requestObject(eventHeader, "{"+formatRequest("eventID",$scope.workOrderNumber)+"}")
				     .then(function(response){
					   if(response.data.result == null){
						 return;
					   }
							
					   $scope.myTicket = response.data.result;
					   $scope.myTicketType = response.data.result[0].anomaly;
					   $scope.myAsset = response.data.result[0].asset;
					   $scope.stationName = response.data.result[0].stationName;
					 }).then(function(){
					    getAllMyTickets();
					 })
				   ;
				 }
				 				 
				 // query database for the relevant work orders
				 
				 var getAllMyTickets = function(){
					 requestObject(eventHeader, "{"+formatRequest("anomaly",$scope.myTicketType)+","+formatRequest("asset",$scope.myAsset)+","+formatRequest("stationName",$scope.stationName)+"}")
					 .then(function(response){	
						 if(response.data.result == null){
							return;
						}
						
						$scope.allMyTickets = response.data.result;
									
						var first = new Date(),
							last = new Date(0),
							anomaly = null,
							saved = 0,
							wasted = 0
						;
						
						for(var i = 0; i < $scope.allMyTickets.length; i++){
							var _item = $scope.allMyTickets[i];
							saved += +_item.potentialSaving;
							wasted += +_item.waste;
							
							if(anomaly == null){
								anomaly = _item.anomaly;
							}
							
							if(new Date(first) > new Date(_item.createdTime)){
								first = _item.createdTime;
							}
							
							if(new Date(last) < new Date(_item.createdTime)){
								last = _item.createdTime;
							}
						}
						
						saved = Math.round(saved*100)/100;
						wasted = Math.round(wasted*100)/100;
						
						var dateFormat = d3.time.format("%b %e %Y - %I:%M:%S%p (%Z) ");
						
						$scope.mySum = [];
						$scope.mySum[0] = {
										   'anomaly':anomaly,
										   'firstDate':first,
										   'lastDate':last,
										   'total':$scope.allMyTickets.length,
										   'totalSaved':saved,
										   'totalWaste':wasted
										  };
						
						// receive point list from the database object
						//$scope.pointsUsed = response.data.result[0].pointUsed;   ******************* uncomment for live
					 }).then(function(){
						 // create full history tables of the database object ** will probably need to break down into time windows to make faster querying **
						 getAllMyPoints($scope.pointsUsed);
					 })
				   ;	 
				 };	 
				
				 // query database for the relevant points
				 $scope.drawGraph = function(term){
					 if(term == 'composite'){
						 $scope.composite.render();
						 $scope.myPoints = $scope.allPoints;
					 }else{
						 $scope.myPoints = [];
						 eraseAllGraphs();
						 for(var item in $scope.allPoints){
							 if($scope.allPoints[item].name == term){
								 $scope.myPoints.push($scope.allPoints[item]);
							 };
						 };
						 $scope.pointCharts[term].render();
					 }
				 }
				 
				 var eraseAllGraphs = function(){
					 $scope.composite.resetSvg();
					 
					 for(var point in $scope.pointCharts){
						 $scope.pointCharts[point].resetSvg();
					 }
				 }
				 
				 var allMyPoints = [];
				 
				 var getAllMyPoints = function(_pointArray){
					 //var organizationMessage = "\"organization\": \""+"ANDO"/*$scope.organization.toString()*/+"\"";
					 var nameStart = "\"name\":\"";
					 allMyPoints = [];
					 
					 var max = $scope.pointsUsed.length;
					 var counter = 0;
					 
					 for(var i = 0; i < max; i++){
					   var nameMessage = nameStart+$scope.pointsUsed[i];
					   var myArray = function(name, header, message){
					     requestObject(header, message).then(function(response){
						   allMyPoints[name] = response.data.result;
						   counter++;
						 }); 
					   };
						 
					 // treat the data to fit within the needed format of everything..	
					 myArray($scope.pointsUsed[i], contentHeader, "{"+formatRequest("organization",$scope.stationName)+","+nameMessage+"\"}");;
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
				 
				 var totalSize;
				 var treatData = function(){
					 var _array = [];
					 
					 for(var i = 0; i < $scope.pointsUsed.length; i++){
						 var getHistoryEntries = function(_object, origName){
							 var _hisArray = [];
							 
							 for(var j = 0; j < _object.length; j++){
								 var _hisObj = _object[j].his;
								 
								 for(var k = 0; k < _hisObj.length; k++){
									 var _temp = {
										"name":origName,
										"timestamp":_hisObj[k].timestamp,
										"value":_hisObj[k].value
									 };
									 
									 _hisArray.push(_temp);
								 }
							 }
							 
							 return _hisArray;
						 }
						 
						 var _tempArray = getHistoryEntries(allMyPoints[$scope.pointsUsed[i]],$scope.pointsUsed[i]);
						 
						 for(var j = 0; j < _tempArray.length; j++){
							 _array.push(_tempArray[j]);
						 }
					 }
					 return _array;
				 }
				 
				 var getDaysBetween = function(start, end){
				    	var _daysBetween = (new Date(end) - new Date(start))/(1000*60*60*24);
				    	
				    	return Math.round(_daysBetween);
			     }
				 
				 var displayDate= d3.time.format("%m-%d-%y");
				 $scope.pointCharts = [];
				 
				 var getMyDim = function(_daysBetween_,_origDim){
					 var _array = [];
					 _array[0] = _origDim;
					 return _array;
				 }
				 
				 // graph the points
				 var compositeChart = function(_array){
					 var _ndx = crossfilter(_array);
					 var _indDim = _ndx.dimension(function(d){return d;});
					 var _dateDim = _ndx.dimension(function(d){return d3.time.day(new Date(d.timestamp));});
					 
					 var _start = _dateDim.bottom(1)[0].timestamp;
					 var _end = _dateDim.top(1)[0].timestamp;
					 
					 var myDomain = d3.scale.linear().domain([new Date(_start), new Date(_end)]);
					 
					 var _daysBetween = getDaysBetween(_start, _end);

					 var _mySettings = getMyDim(_daysBetween,_dateDim);
					 
					 var _myDim = _mySettings[0];
					 var _myXUnits = _mySettings[1];
					 
					 var maxVal = +_myDim.group().reduceSum(function(d){return +Math.round(d.value);}).top(1)[0].value;
					 	
					 var createCharts = function(myFilter){
						var _group = _myDim.group().reduceSum(function(d){if(d.name == myFilter){return +Math.round(+d.value);}else{return 0;}});
						var useRight = false;
						if(maxVal/25 >= +_group.top(1)[0].value){
							useRight = true;
						}
						
						var lineChart = dc.lineChart($scope.composite)
						     .dimension(_myDim)
						     .group(_group,myFilter)
						     .useRightYAxis(useRight)
						     .defined(function(d){return isNaN(d.data.value)==false;})
						 ;
						 return lineChart;
					 };
					 
					 var compositeCharts = [];

					 $scope.composite = dc.compositeChart("#chart_"+$scope.dcName)
					 	.width(+$scope.panelWidth)
					 	.height(300)
					 	.x(myDomain)
					 	.shareColors(true)
					 	.yAxisLabel("value")
					 	.renderHorizontalGridLines(true)
					 	.legend(dc.legend().x(+$scope.panelWidth - 100).y(25).itemHeight(13).gap(5))
					 	.compose(compositeCharts)
					 	.brushOn(false)
					    .mouseZoomable(true)
					 ;
					 
					 $scope.composite.margins().left = 100;
					 $scope.composite.margins().right = 125;
					 
					 $scope.composite.xAxis().tickFormat(function(v){return displayDate(new Date(v));})
					 
					 var makeFullCharts = function(myFilter){
						 var _group = _myDim.group().reduceSum(function(d){if(d.name == myFilter){return Math.round(+d.value);}else{return 0;}});
						
						 var thisChart = dc.lineChart("#chart_"+$scope.dcName)
						     .width(+$scope.panelWidth)
						     .height(400)
						     .x(myDomain)
						     .dimension(_myDim)
						     .group(_group,myFilter)
						     .yAxisLabel("value")
							 .legend(dc.legend().x(+$scope.panelWidth - 100).y(25).itemHeight(13).gap(5))
							 .brushOn(false)
							 .renderHorizontalGridLines(true)
							 .defined(function(d){return isNaN(d.data.value)==false;})
						 ;
						 
						 thisChart.margins().left = 100;
						 thisChart.margins().right = 125;
						 thisChart.xAxis().tickFormat(function(v){return displayDate(new Date(v));});
						 
						 return thisChart;
					 }
					 
					 for(var i = 0; i < $scope.pointsUsed.length; i++){
						 $scope.pointCharts[$scope.pointsUsed[i]] = makeFullCharts($scope.pointsUsed[i]);
						 compositeCharts[i] = createCharts($scope.pointsUsed[i]);
					 }
					 
					 renderDefault();
				 }
				 
				 var renderDefault = function(){
					 $scope.myPoints = $scope.allPoints;
					 $scope.composite.render();
				 }
				 
				 // display the anomaly detail information
				 
				 $scope.anomalyDetails = {
					 enableSorting:false,
					 enableFiltering: false,
					 multiSelect: false,
					 data: 'myTicket',
					 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',				 
					 columnDefs : [
					               {field:'anomaly', displayName: "Anomaly"},
					               {field:'eventID', displayName:'Work Order Number'},
					               {field:'asset', displayName: "Asset"},
					               {field:'facility',displayName:"Facility"},
					               {field:'createdTime',displayName:"Created"},
					               {field:'closedTime',displayName:"Closed"},
					               {field:'eventID',displayName:"Event ID"},
					               {field:'status',displayName:"Status"},
					               {field:'potentialSaving',displayName:"Potential Savings"},
					               {field:'waste',displayName:"Waste"}
					              ]
				   }
				 ;

				 $scope.anomalySummary = {
					 enableSorting:false,
					 enableFiltering:false,
					 multiSelect:false,
					 data:"mySum",
					 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
					 columnDefs : [
					                {field:'anomaly', displayName: "Anomaly Type"},
					                {field:'firstDate', displayName:"First Instance"},
				 	                {field:'lastDate', displayName: "Most Recent Instance"},
				 	                {field:'total', displayName:"# of Occurences"},
					                {field:'totalSaved', displayName: "Total Potential Savings"},
					                {field:'totalWaste', displayName: "Total Waste"}
					              ]
				   }
				 ;
			 
				 $scope.pointData = {
					 enableSorting:true,
					 enableFiltering:true,
					 multiSelect: false,
					 data:"myPoints",
					 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
					 columnDefs : [
					                {field:'name', displayName:'Point Name',
					                 filter : {
					                	 	    noTerm: false,
					                            condition:function(searchTerm, cellValue){
					                        	  return cellValue==searchTerm;
					                            },
					                		  }
					                },
					                {field:'timestamp', displayName:"Date"},
					                {field:'value',displayName:'Value'}
					              ]
				 };
				 
				 $scope.$watch(
				   'doMyGraphing', 
					function(val){
					  if(val == true){
						  $scope.allPoints = treatData()
						compositeChart($scope.allPoints);
					  }
					}
				 );
					 					 
				 $scope.$watch(
				   'panelWidth',
				   function(val){
					 if($scope.allPoints !== undefined){
					   compositeChart($scope.allPoints);
					 }
				   }
				 );
					 
				 $scope.$watch(
				   'workOrderNumber',
				   function(val){
					   if(val !== undefined){
					   $scope.doMyGraphing = false;
					   eraseAllGraphs();
					   requestFromWorkOrder();
					 }
				   }
				 );
				 
				 requestFromWorkOrder();
				 
				 //TODO highlight based on active alarms
				 //TODO cleanup!!
				 //TODO wrap to fit onto dashboard
				 //TODO perform null checks on start (query down to ticket type and asset, get full list of tickets matching those requirements)
				 //TODO package into a directive which may have variables set	 
	      }
	  }
  }])
  .run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'event-page';},
		configTag: function(){return '';},
		tagHtml: function(){return "<event-page></event-page>";},
		directiveName: function(){return 'eventPage';},
		namespace: function(){return 'eventPg'},
		paletteImage: function(){return 'report.png';}
		});
  }])
  .factory('eventPageService', [ function(){
	  
	  var _getWorkOrderNumber = function(){
		  console.log("gooot ittt");
	  };
	  
	  var _setWorkOrderNumber = function(){
		  console.log("seeettt ittt");
	  };
	  
	  var serviceObject = {
	    getWorkOrderNumber: _getWorkOrderNumber,
	    setWorkOrderNumber: _setWorkOrderNumber
	  };
	  
	  return serviceObject;
	  	  
  }])

;