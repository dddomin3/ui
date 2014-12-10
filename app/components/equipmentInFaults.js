'use strict';
angular.module('myApp.equipmentInFaults', ['ngRoute'])

.factory('equipmentInFaultsService', ['$http', '$q',function($http,$q){
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	} 
	var _servObj = {};
	var _activeOrganizations = {};
	var _activeClients;
	var _activeAssets;
	var _organizationQuery = {};
	var _clientQuery = {};
	var _assetQuery = {};
	
	var _location={};
	


	

	
	
	

	var _getOrganizations = function (client) {	
		//this function queries the server for all existing organizations
		var message = {
				"date": {
					"$gt": {
						"$date": "2014-10-22T22:02:48.488Z"
					}
				}
		};

		var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{}";
		var config = {
				method:'POST',
				headers: {'Collection': 'Facility'},
				url:Url,
				data:requestString
		}
		//return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
		return $http(config)
		.success(
				function (data) {

					for(var i = 0, ilen = data.result.length; i < ilen; i++) {


						if(client===""){
							_organizationQuery[data.result[i].stationName] = '';	//keeps track of all meters in query
						}
						else{
							_organizationQuery[data.result[i].stationName] = '';
							if(client!==data.result[i].clientName){
								delete _organizationQuery[data.result[i].stationName];
							}
						}
					}
				}
		)
		.error( function () { alert('fail to query data'); } );
	};

	var _getClients = function () {	
		//this function queries the server for all existing clients
		var message = {
				"date": {
					"$gt": {
						"$date": "2014-10-22T22:02:48.488Z"
					}
				}
		};

		var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{}";
		var config = {
				method:'POST',
				headers: {'Collection': 'Facility'},
				url:Url,
				data:requestString
		}
		return $http(config)
		.success(
				function (data) {
					for(var i = 0, ilen = data.result.length; i < ilen; i++) {

						_clientQuery[data.result[i].clientName] = '';	//keeps track of all meters in query
					}
				}
		)
		.error( function () { alert('fail to query data'); } );
	};
	
	
		var _getAssets = function (org,client) {	
		//this function queries the server for all existing Assets


		var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{\"clientName\":\"" +client +"\","+"\"stationName\":\""+org+"\"}";
		var config = {
				method:'POST',
				headers: {'Collection': 'Facility'},
				url:Url,
				data:requestString
		}
		return $http(config)
		.success(
				function (data) {
					for(var i = 0, ilen = data.result.length; i < ilen; i++) {
					
						angular.forEach(data.result[i].asset,function(value,key){
							
								_assetQuery[key]=value;
								
								
					
						});
						
							

						
					}
				}
		)
		.error( function () { alert('fail to query data'); } );
	};
	
	
	// query location 
	
	
	var _getLocation = function (org,client) {	
		//this function queries the server for all existing Assets


		var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{\"clientName\":\"" +client +"\","+"\"stationName\":\""+org+"\"}";
		var config = {
				method:'POST',
				headers: {'Collection': 'Facility'},
				url:Url,
				data:requestString
		}
		return $http(config)
		.success(
				function (data) {
					for(var i = 0, ilen = data.result.length; i < ilen; i++) {
						
						_location=data.result[i].facilityAddress+","+data.result[i].city+","+data.result[i].state+","+data.result[i].country+","+data.result[i].zipCode;
					
						};				
							
				
					
						}
				
		)
		.error( function () { alert('fail to query data'); } );
		
	};
	
	

	

	// organization query
	var _getOrganizationQuery =  function () {
		return _organizationQuery;
	};
	var _getActiveOrganizations = function () {
		return _activeOrganizations;
	};
	var _deleteActiveOrganization = function (organization) {
		delete _activeOrganizations[organization];
	};
	var _initActiveOrganization = function (organization) {
		_activeOrganizations[organization] = {
				"name" : organization,
				"actual" : "",
				"expected" : "",
				"meterQuery" : {}
		};

	};
	
	
	// client Query 
	var _getClientQuery =  function () {
		return _clientQuery;
	};
	var _getActiveClients = function () {
		return _activeClients;
	};
	var _deleteActiveClient = function (client) {
		delete _activeClients[client];
	};
	var _initActiveClient = function (client) {
		_activeClients[client] = {
				"name" : client,
				"actual" : "",
				"expected" : "",
				"meterQuery" : {}
		};

	};
	
	
	// asset query
	var _getAssetQuery =  function () {
		return _assetQuery;
	};
	var _getActiveAssets = function () {
		return _activeAssets;
	};
	var _deleteActiveAsset = function (asset) {
		delete _activeAssets[asset];
	};
	var _initActiveAsset = function (asset) {
		_activeAssets[asset] = {
				"name" : asset,
				"actual" : "",
				"expected" : "",
				"meterQuery" : {}
		};

	};
	
	
	//location query
	
	var _getAddress = function(){
		return _location;
	};
	
	//split string
	
	
	var _stringParts= function(tar,del){
		var m=0;
		while(tar.charAt(m)==del){
			tar=tar.slice(1,tar.length);
			
		};
		
		var  start=0;
		var  end;
		var result=[];
		for(var i=0 ; i<tar.length;i++){
			if(tar.charAt(i)==del){
				end=i;
				
				result.push(tar.slice(start,end));
				start=i+1;
			}
			

			
		}
		
		if(start<tar.length){
			result.push(tar.slice(start,tar.length));
		}
		return result;
	}
	
	
	
	//query Event Data
	
	
	var _queryEvents = function (org,asset) {	
		//this function queries the server for all existing Assets
		var _event=[];
		var caller =this;
		var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
		var requestString = "{\"asset\":\"" +asset +"\","+"\"stationName\":\""+org+"\"}";
		var config = {
				method:'POST',
				headers: {'Collection': 'Event'},
				url:Url,
				data:requestString
		}
		
		return $http(config)
		.success(
				function (data) {

					if(data.result!=null){
						for(var i = 0, ilen = data.result.length; i < ilen; i++) { 
							
							var _subEvent=[];
				
							_subEvent.push(data.result[i].source);
							_subEvent.push(data.result[i].asset);
							_subEvent.push(data.result[i].createdTime);
							_subEvent.push(data.result[i].waste);
							_subEvent.push(data.result[i].potentialSaving)
							
							_event.push(_subEvent);
							
							caller.data._event=_event;	
							
							
							};	
					}
					else{
						_event.push("empty");
						caller.data._event=_event;
					}
					
					
				})
		.error( function () { alert('fail to query data');
		
		} );
	
		
	};
	

	

// clientQuery is hashmap and getClients is method
	_servObj = {

			getOrganizations: _getOrganizations,
			getActiveOrganizations : _getActiveOrganizations,
			initActiveOrganization : _initActiveOrganization,
			getOrganizationQuery : _getOrganizationQuery,
			deleteActiveOrganization : _deleteActiveOrganization,


			getClients: _getClients,
			getActiveClients : _getActiveClients,
			initActiveClient : _initActiveClient,
			getClientQuery : _getClientQuery,
			deleteActiveClient : _deleteActiveClient, 
			
			
			getAssets: _getAssets,
			getActiveAssets : _getActiveAssets,
			initActiveAsset : _initActiveAsset,
			getAssetQuery : _getAssetQuery,
			deleteActiveAsset : _deleteActiveAsset,
			
			
			stringParts : _stringParts,
			
			getLocation : _getLocation,
			
			getAddress : _getAddress,
			
			
			queryEvents: _queryEvents
			
	};

	return _servObj;
}])



.controller('equipmentInFaultsCtrl', ['$scope', '$modal', '$location', '$route', 'equipmentInFaultsService','sharedPropertiesService','$q','$http',
                                    function($scope, $modal, $location, $route, dataService,sharedProperties,$q,$http) {

	$scope.activeOrganization = "";
	$scope.activeClient="";
	$scope.activeAsset="";
	$scope.active={};
	$scope.activeInfo={};
	$scope.events=[];
	
	
	var _events=[];
	
	var vm=this;
	
	vm.data={};
	
	angular.extend(vm,dataService);

	
	
	$scope.queryOrganizations = function () {
		dataService.getOrganizations($scope.activeClient).then( function () {
			$scope.organizationQuery = dataService.getOrganizationQuery();
		});
	};



	$scope.queryClients = function () {
		dataService.getClients().then( function () {
			$scope.clientQuery = dataService.getClientQuery();
		});
	};
	
	$scope.queryAssets = function (activeOrganization,activeClient) {
		dataService.getAssets(activeOrganization,activeClient).then( function () {
			$scope.assetQuery = dataService.getAssetQuery();
		});
	};
	




	$scope.setClientAll = function(){

		$scope.activeClient="";
	}
	
	$scope.setClientAll = function(){

		$scope.activeOrganization="";
	}
	
	$scope.setClientAll = function(){

		$scope.activeAsset="";
	}
	
	
	
	
	$scope.initSingleOrganization = function (organization) {

		$scope.activeOrganization = organization;
	};

	$scope.initSingleClient = function (client) {

		$scope.activeClient = client;
	};
	
	$scope.initSingleAsset = function (asset) {

		$scope.activeAsset = asset;
	};




	$scope.debug = function () {
		$scope.modalInstance.close();
		console.log($scope);

	};


	


	$scope.open = function(size) {
		
		$scope.modalInstance = $modal.open({
			templateUrl: 'views/equipmentInFaultsConfig.html',
			controller: 'equipmentInFaultsCtrl',
			size: size,
			scope: $scope
		});

	};
	
	// function to display  selected asset to a list 
	$scope.add = function( ) {
		
		var x=document.getElementsByName("activeList");
		
		for(var i =0 ; i<x.length;i++){
			if(x[i].checked==true){
				$scope.active [ $scope.activeClient + "_"+$scope.activeOrganization + "_"+x[i].value +"_"+ x[i].placeholder] ="";
			}
		}

		
		
	};
	
	// function to delete selected asset from the list

	$scope.remove = function(){
		var x = document.getElementsByName("activeList");
		for(var i =0 ; i<x.length;i++){
			if(x[i].checked ===true){
				console.log(x[i].value);
				delete $scope.active[x[i].value];
			}
		}
	};
	

	$scope.isBlank = function(thisString){
	
		if(thisString==="" || thisString===undefined){
			return true;
		}
		else{
			return false;
		}
	}
	

	
	$scope.ok = function() {
		sharedProperties.setActives($scope.active);
		sharedProperties.set
		
		$scope.modalInstance.close();
		
	};

	$scope.queryOrganizations();
	$scope.queryClients();
	
	
	
	// put the select asset info into active map, query data happens in this step and store the queried data for all assets in specific place
	$scope.apply=function(){
		$scope.active=sharedProperties.getActives();
		
		
		angular.forEach($scope.active,function(value,key){
			var del='_';
			var tempArray = dataService.stringParts(key,del);
			
			
		// query the events based on station name and asset name
			vm.queryEvents(tempArray[1],tempArray[2]).then().finally(function(){
			var eventsInfo=[];
			var info=[];
			console.log(vm.data._event);
			if(vm.data._event[0]=="empty"){
					eventsInfo.push(0);
					eventsInfo.push("Nan");
					eventsInfo.push("Nan");
					eventsInfo.push(0);
					eventsInfo.push(0);
					eventsInfo.push(0);
			}
			else{
				console.log(vm.data._event);
				
				var anomaly=0;
				var anomalyMap={};
				var firstOcc="";
				var lastOcc="";
				var createdTime=[];
				var occ=0;
				var waste=0;
				var potentialSaving=0;
				
				
				
				angular.forEach(vm.data._event,function(value,key){
					//write the source into the map
					anomalyMap[value[0]]="";
					
					// write the created time into an array
					
					createdTime.push(new Date ( value[2] ) );
					
		
					
					
					
				
				// calculate the total number of ticket occurrences
				occ++;
				
				//calculate the total waste and saving
				
				waste= waste + parseFloat(value[3]);
				potentialSaving=potentialSaving + parseFloat(value[4]);
			});
			
			// get the lenght of the anomalyMap to get the total number of anomaly types 
			angular.forEach(anomalyMap,function(value,key){
				anomaly++;
			});
			
			
			//get the first and last occ ticket time
			
		
			var minArray=function(tar){
				var min=tar[0];
				for(var i =1;i<tar.length;i++){
					if(min>tar[i]){
						min=tar[i];
					}
				}
				return min;
			}
			
			var maxArray=function(tar){
				var max=tar[0];
				for(var i =1;i<tar.length;i++){
					if(max<tar[i]){
						max=tar[i];
					}
				}
				return max;
			}
			
			
			
			firstOcc=minArray(createdTime);
			lastOcc=maxArray(createdTime);
			
			console.log(anomaly);
			console.log(createdTime);
			console.log(occ);
			console.log(waste);
			console.log(potentialSaving);
			
			eventsInfo.push(anomaly);
			eventsInfo.push(firstOcc.toString());
			eventsInfo.push(lastOcc.toString());
			eventsInfo.push(occ);
			eventsInfo.push(waste.toFixed(2));
			eventsInfo.push(potentialSaving.toFixed(2));
			
			}
			
			
			info.push(tempArray[0]);
			info.push(tempArray[1]);
			info.push(tempArray[2]);
			
			
			dataService.getLocation(tempArray[1],tempArray[0]).then(function(){
				info.push( dataService.getAddress() );
				
			});
			
			info.push(tempArray[3]);
			// be careful , the sequence of the array doesnot follow the the sequence of pushing action, in this case, info[4] is address and info[3] is tempArray[3]			
			
			info.push(eventsInfo);
			
			
			
			
			$scope.activeInfo[key]=info;
			
			console.log(info);
			

				
			});
			
			
			
			
		});
		
		

		
	};
	
	$scope.j=0;
	
	//function to select/unselect all assets under one asset type
	$scope.selectChildren=function(placeholder){
		var y=document.getElementsByName("activeList");
		
		
		if($scope.j%2==0){
			
			for(var i =0 ; i<y.length;i++){
				
				if(y[i].placeholder==placeholder){
					y[i].checked=true;
				}
			}

		}
		
		else{
			for(var i =0 ; i<y.length;i++){
				
				if(y[i].placeholder==placeholder){
					y[i].checked=false;
				}
			}
			
			
		}
		$scope.j=$scope.j+1;
		
	}
	
	

	
	// Reduce function that takes evnets data from database and output total data for each AHU and put it into activeinfo map
	

	
	$scope.imBoolean=true;
	$scope.faultyEquipment=function(){
		if($scope.imBoolean==false){
			$scope.imBoolean=true;
		}
		else{
			$scope.imBoolean=false;
		}
		console.log($scope.imBoolean);
				
	}
	
	
}])

.service('sharedPropertiesService', function () {
	var actives = "";


	return {
		getActives: function () {
			return actives;
		},
		
		setActives: function(value) {
			actives = value;
		}
	};
})


.directive('equipmentInFaultsConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/equipmentInFaultsConfig.html'
	}
}]);