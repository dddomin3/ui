'use strict';


angular.module('myApp.eventPage', ['ngRoute'])
  
  .directive('eventPage', ['chartIdService',function(chartIdService){
	  return{
		  restrict:'E',
		  templateUrl : 'views/eventPage.html'
	  }}])
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
  .factory('eventPageService', [ '$rootScope', function($rootScope){
	  
	  var workOrderNumber = undefined;
	  var assetName = undefined;
	  var organization = undefined;
	  var anomalyName = undefined;
	  
	  var _getWorkOrderNumber = function(){
		  return workOrderNumber;
	  };
	  
	  var _setWorkOrderNumber = function(value){
		  workOrderNumber = value;
		  $rootScope.$broadcast('workOrderNumberSet');
	  };
	  
	  var _getAssetName = function(){
		  return assetName;
	  }
	  
	  var _setAssetName = function(value){
		  assetName = value;
		  $rootScope.$broadcast('assetNameSet');
	  }
	  
	  var _getOrganization = function(){
		  return organization;
	  }
	  
	  var _setOrganization = function(value){
		  organization = value;
		  $rootScope.$broadcast('organizationSet');
	  }
	  
	  var _getAnomalyName = function(){
		  return anomalyName;
	  }
	  
	  var _setAnomalyName = function(value){
		  anomalyName = value;
		  $rootScope.$broadcast('anomalyNameSet');
	  }
	  
	  var serviceObject = {
	    getWorkOrderNumber: _getWorkOrderNumber,
	    setWorkOrderNumber: _setWorkOrderNumber,
	    getAssetName: _getAssetName,
	    setAssetName: _setAssetName,
	    getOrganization: _getOrganization,
	    setOrganization: _setOrganization,
	    getAnomalyName: _getAnomalyName,
	    setAnomalyName: _setAnomalyName
	  };
	  
	  return serviceObject;
	  	  
  }])
  .controller('eventPageCtrl',['$scope','$http',"$location",'$route','$window','eventPageService','chartIdService',
     function($scope, $http, $location, $route, $window,serv,chartIdService) {

		 //*******************************debugging/troubleshooting variables/functions *****************************

	  	 
	  
		 var getTicketID = function(){
			 if($scope.dcName.indexOf(1) >= 0){
				 serv.setWorkOrderNumber("PLP-0126890");
				 //organization ANDO
			 }else {
				 
				 serv.setWorkOrderNumber("DEU-0165521");
				 //organization JACK
			 }
		 }
		 
		 $scope.changeWorkOrderService = function(current){
			 if(serv.getWorkOrderNumber() === "PLP-0126879"){
				 serv.setWorkOrderNumber("DEU-0165521");
			 }else{
				 serv.setWorkOrderNumber("PLP-0126879"); 
			 }	
		 }
		 
		 $scope.changeWorkOrderLocal = function(current){
			 if(current === "PLP-0126879"){
				 $scope.workOrderNumber = "DEU-0165521";
			 }else{
				 $scope.workOrderNumber = "PLP-0126879"; 
			 }
		 }
		 
		 $scope.logScope = function(){
			 console.log($scope);
		 }
						 
		 //**********************************  end debugging/troubleshotting variables/functions ***********************
		 
		 // receive the proper work order number ($scope variable change, watch scope variable for change)
		 
		 if($scope.dcName === undefined){
			 $scope.dcName = chartIdService.getNewId();
		 }
		 
		 if(serv.getWorkOrderNumber() !== undefined){
			 $scope.workOrderNumber = serv.getWorkOrderNumber();
		 }else{
			 getTicketID();
			 $scope.workOrderNumber = serv.getWorkOrderNumber();
		 }
		 
		 if(serv.getAnomalyName() !== undefined){
			 $scope.myTicketType = getAnomalyName();
		 }
		 
		 if(serv.getAssetName() !== undefined){
			 $scope.myAsset = serv.getAssetName();
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
			     .error(function(data, status, headers, config){$scope.errorCode = "Database Error"; $scope.doMyGraphing = null;})
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
		 	
		 var launchError = function(errorText){
			 console.log($scope);
			 $scope.errorCode = errorText;
			 $scope.doMyGraphing = null;
			 
		 }
		 
		 // query database for the relevant work orders
		 
		 var getAllMyTickets = function(){
			 requestObject(eventHeader, "{"+formatRequest("anomaly",$scope.myTicketType)+","+formatRequest("asset",$scope.myAsset)+","+formatRequest("stationName",$scope.stationName)+"}")
			 .then(function(response){	
				 if(response.data.result == null){
					return;
				}
				
				$scope.allMyTickets = response.data.result;
				
				var activeLine = function(tickets){
					var _array = [];
					
					var getBar = function(entry){
						var start = new Date(entry.createdTime),
						    end   = new Date(entry.closedTime)
						;
						
						var time = new Date(((+start)+(+end))/2);
						var days = getDaysBetween(start,end);
												
						return {
								 "time":start,
								 "duration":days,
								 "state":1
							   }
					}

					for(var i = 0; i < tickets.length; i++){
						_array.push(getBar(tickets[i]));
					}
					
					return _array;
				}
				
				$scope.activeTix = activeLine($scope.allMyTickets);
				
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
				
				if($scope.workOrderNumber === "PLP-0126879"){
					   $scope.pointsUsed = ["Site_kWh1","SITE_kW"];
				}else{
					   $scope.pointsUsed = ["B100_KWH","B200_KWH","B400_KWH","B500_KWH"];
				}
			 }).then(function(){
				 if(badPointCheck($scope.workOrderNumber)){ // check for error on $scope.workOrderNumber
					 launchError("No Work Order!!");
				 }else if(badPointCheck($scope.pointsUsed)){//		""		""	  $scope.pointsUsed
					 launchError("Cannot determine points used!!");
				 }else if(badPointCheck($scope.myAsset)){//			""		""	  $scope.myAsset
					 launchError("Cannot determine asset!!")
				 }else if(badPointCheck($scope.stationName)){//		""		""	  $scope.stationName
					 launchError("Cannot determine organization!!")
				 }else{
					 getAllMyPoints($scope.pointsUsed);
				 }
			 })
		   ;	 
		 };	 
		 
		 var badPointCheck = function(point){
			 if(point === undefined || point === null){
				 return true;
			 }else{
				 return false;
			 }
		 };
				 
		 var allMyPoints = [];
		 
		 var getAllMyPoints = function(_pointArray){
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
					 if($scope.doMyGraphing !== true){
						 $scope.doMyGraphing = true;
					 }
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
		    	return (new Date(end) - new Date(start))/(1000*60*60*24);
		 }
		 		 
		 var customTimeFormat = d3.time.format.multi([
		                                              [".%L", function(d) { return d.getMilliseconds(); }],
		                                              [":%S", function(d) { return d.getSeconds(); }],
		                                              ["%I:%M", function(d) { return d.getMinutes(); }],
		                                              ["%I:%M %p", function(d) { return d.getHours(); }],
		                                              ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
		                                              ["%b %d", function(d) { return d.getDate() != 1; }],
		                                              ["%b '%y", function(d) { return d.getMonth(); }],
		                                              ["%Y", function() { return true; }]
		                                            ]);
		 
		 $scope.pointCharts = [];
		 
		 var monthDim,
		 	 dayDim,
		 	 hourDim,
		 	 minuteDim
		 ;
		 
		 var getMySettings = function(_daysBetween_){
			 var _array = [];
			 var _dim;
			 var _units;
			 
			 
			 
			 if(_daysBetween_ >= 180){
				 _dim = monthDim
				 _units = d3.time.months;
			 }else if(_daysBetween_ >= 30){
				 _dim = dayDim; 
				 _units = d3.time.days;
			 }
			 else if(_daysBetween_ >= 7){
				 _dim = hourDim;
				 _units = d3.time.hours;
			 }else{
				 _dim = minuteDim
				 _units = d3.time.minutes;
			 }
			 
			 _array[0] = _dim;
			 _array[1] = _units;
			 
			 return _array;
		 }
		 
		 var lastDaysBetween;
		 var lastOKDate = [];
		 
		 // graph the points
		 var compositeChart = function(_array){
			 var _ndx = crossfilter(_array);
			 var _ndxTix = crossfilter($scope.activeTix);
			 
			 monthDim = _ndx.dimension(function(d){return d3.time.month(new Date(d.timestamp));});
			 dayDim = _ndx.dimension(function(d){return d3.time.day(new Date(d.timestamp));});
			 hourDim = _ndx.dimension(function(d){return d3.time.hour(new Date(d.timestamp));});
			 minuteDim = _ndx.dimension(function(d){return d3.time.minute(new Date(d.timestamp));});
			 
			 var ticketDim = _ndxTix.dimension(function(d){return new Date(d.time);});
			 
			 var _start = dayDim.bottom(1)[0].timestamp;
			 var _end = dayDim.top(1)[0].timestamp;
			 
			 var myDomain = d3.time.scale().domain([new Date(_start), new Date(_end)]);
			 
			 var _daysBetween = getDaysBetween(_start, _end);
			 lastDaysBetween = _daysBetween;
			 
			 var _mySettings = getMySettings(_daysBetween); 
			 
			 var _myDim = _mySettings[0];
			 var _myXUnits = _mySettings[1];
			 
			 var _origDim = _myDim;
			 var zoomLimit = true;

			 var maxVal = +_myDim.group().reduceSum(function(d){return +Math.round(d.value);}).top(1)[0].value;
			 var barHeight = 0; 
			 var rightAxisInUse = false;
			 
			 var createTicketChart = function(){
				 var _group = ticketDim.group().reduce(
						 function(p,v){return v.state*barHeight;},
						 function(p,v){	return -v.state*barHeight; },
						 function(){return 0;}
				 )
				 var varChart = dc.barChart($scope.composite)
					 .dimension(ticketDim)
					 .group(_group,"Tickets")
					 .hidableStacks(true)
					 .centerBar(true)
					 //.xUnits(d3.time.months)
				 ;
				 
				 varChart.margins().left = 100;
				 varChart.margins().right = 125;
						 
				 return varChart;
			 }
			 
			 var createCharts = function(myFilter){
				var _group = _myDim.group().reduceSum(function(d){if(d.name == myFilter){return +Math.round(+d.value);}else{return 0;}});
				
				if(barHeight < _group.top(1)[0].value){
					barHeight = _group.top(1)[0].value;
				}
				
				var useRight = false;
				if(maxVal/25 >= +_group.top(1)[0].value){
					useRight = true;
					rightAxisInUse = true;
				}
				
				var lineChart = dc.lineChart($scope.composite)
				     .dimension(_myDim)
				     .group(_group,myFilter)
				     .useRightYAxis(useRight)
				     .defined(function(d){return isNaN(d.data.value)==false;})
				     .hidableStacks(true)
				 ;
				
				 lineChart.margins().left = 100;
				 lineChart.margins().right = 125;
				 
				 return lineChart;
			 };
			 
			 var compositeCharts = [];

			 compositeCharts[0] = createTicketChart();
			 for(var i = 0; i < $scope.pointsUsed.length; i++){
				 compositeCharts[i+1] = createCharts($scope.pointsUsed[i]);
			 }
			 
			 $scope.composite = dc.compositeChart("#chart_"+$scope.dcName)
			 	.width(+$scope.panelWidth)
			 	.height(300)
			 	.x(myDomain)
			 	.elasticY(true)
			 	.elasticX(true)
			 	.zoomOutRestrict(zoomLimit)
			 	.transitionDuration(100)
			 	.shareColors(true)
			 	.yAxisLabel("value")
			 	.renderHorizontalGridLines(true)
			 	.compose(compositeCharts)
			 	.brushOn(false)
			    .mouseZoomable(true)
			 ;		 
			 			 
			 
			 
			 var legendX = function(){return $scope.composite.width()-100;}
			 $scope.composite.legend(dc.legend()
					 					.x(legendX())
					 					.y(25)
					 					.itemHeight(13)
					 					.gap(5)
					 				 );

			 $scope.composite.margins().left = 100;
			 
			 if(rightAxisInUse == true){
				 $scope.composite.margins().right = 225; 
			 }else{
				 $scope.composite.margins().right = 125;
			 }

			 $scope.composite.xAxis().tickFormat(function(v){return customTimeFormat(v);})
			 
			 $scope.composite.on('zoomed', function(chart, filter){
				 var tempDays;
				 var newMax = 0;
				 var tempUnits;

				 var newChildProps = function(child){
					 var min = child.xAxisMin();
					 var max = child.xAxisMax();
					 
					 var days = getDaysBetween(min,max);
					 
					 var newDim;
					 if(days > lastDaysBetween){ // special lower bounds for zooming back out...
						 if(days >= 170){
							 newDim = monthDim;
						 }else if(days >= 25){
							 newDim = dayDim;
						 }else if(days > 5){
							 newDim = hourDim;
						 }else{
							 newDim = minuteDim;
						 }
					 }else{
						 var _settings = getMySettings(days); 
						 newDim = _settings[0];
						 tempUnits = _settings[1];
					 }
					 				
					 if(newDim === _origDim){
						 zoomLimit = true;
					 }else{
						 zoomLimit = false;
					 }
					 
					 var nameFilter = child._groupName;
					 var newGroup = newDim.group().reduceSum(function(d){if(d.name == nameFilter){return +Math.round(+d.value);}else{return 0;}});
					 
					 if(child.dimension() !== newDim){						 
						 var innerMax = newGroup.top(1)[0].value;
						 						 
						 if(newMax < innerMax){
							 newMax = innerMax;
						 }
						 child.dimension(newDim);
						 child.group(newGroup,nameFilter);
						 
					 }
					 
					 tempDays = days;
				 }
				 
				 for(var i = 1; i < chart.children().length; i++){
					newChildProps(chart.children()[i])
				 }
				 
				 lastDaysBetween = tempDays;
				 				 
				 if(zoomLimit != $scope.composite.zoomOutRestrict()){
					 $scope.composite.zoomOutRestrict(zoomLimit); 
				 }
				 
				 if(newMax !== 0){
					 barHeight = newMax; 
					 
					 var newBarChart = function(bar,height){
						 var _barGroup = ticketDim.group().reduce(
								 function(p,v){return v.state*height;},
								 function(p,v){	return -v.state*height; },
								 function(){return 0;}
						 )
						 bar.group(_barGroup,"Tickets");
					 }
					 
					 newBarChart(chart.children()[0],barHeight);
				 }
				 
				 if($scope.composite.xUnits() !== tempUnits){
					 $scope.composite.xUnits(tempUnits);
				 }
				 
			 });
			 
			 renderDefault();			 
		 }
		 
		 var renderDefault = function(){
			 $scope.myPoints = $scope.allPoints;
			 $scope.composite.render();
		 }
		 
		 // display the anomaly detail information

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
			function(newVal,oldVal){
			  if(newVal === true){
				$scope.allPoints = treatData();
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
		   function(newVal,oldVal){
			   if(newVal !== undefined && newVal !== oldVal){
			     if($scope.doMyGraphing === true){
				   $scope.doMyGraphing = false;
				   //eraseAllGraphs();
			     }
			     
			     //to be removed for more real environment.
				 /**/
			     
			     
			   requestFromWorkOrder();
			 }
		   }
		 );
		 
		 $scope.$on('workOrderNumberSet', function(){
			 
			 var tempWorkOrder = serv.getWorkOrderNumber();
			 if($scope.workOrderNumber !== tempWorkOrder){
				 console.log($scope.workOrderNumber,tempWorkOrder);
				 $scope.workOrderNumber = serv.getWorkOrderNumber();
			 }
		 })
		 
		 var checkForAllThree = function(){
			 var org = getOrganization(),
			     asset = getAssetName(),
			     anomaly = getAnomalyName()
			 ;
			 if(org === undefined || $scope.stationName === org){
				 return false;
			 }
			 if(asset === undefined || $scope.myAsset === asset){
				 return false;
			 }
			 if(anomaly === undefined || $scope.myTicketType === anomaly){
				 return false;
			 }
			 
			 $scope.stationName = org;
			 $scope.myAsset = asset;
			 $scope.myTicketType = anomaly;
			 
			 return true;
		 }
		 
		 $scope.$on('assetNameSet',function(){
			 if(checkForAllThree() === true){
				 getAllMyTickets();
			 }
		 });
		 
		 $scope.$on('organizationSet', function(){
			 if(checkForAllThree() === true){
				 getAllMyTickets();
			 }
		 });
		 
		 $scope.$on('anomalyNameSet', function(){
			 if(checkForAllThree() === true){
				 getAllMyTickets();
			 }
		 })
		 
		 if($scope.stationName !== undefined && $scope.myAsset !== undefined && $scope.myTicketType !== undefined){
			 getAllMyTickets();
		 }else if($scope.workOrderNumber !== undefined){
			 requestFromWorkOrder();
		 }
		 
		 //TODO highlight based on active alarms
		 //TODO cleanup!!
  }])
;