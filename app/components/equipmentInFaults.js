'use strict';
angular.module('myApp.equipmentInFaults', ['ngRoute'])

.factory('equipmentInFaultsService', ['$http', function($http){
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
			
			getAddress : _getAddress
			
	};

	return _servObj;
}])




.factory('facilityQueryService', ['$http', function($http){


	var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
	var _queryData = [];

	// $httpProvider.defaults.headers.get = { 'Collections' : 'Facility' }

	var requestString = "{}";
	var config = {
			method:'POST',
			headers: {'Collection': 'Facility'},
			url:Url,
			data:requestString
	}




	var _promise = $http(config).success(function(response,status,headers,config){

		//_csvArray = CSVToArray(response,",");
		_queryData = response;
	});
	//console.log(promise);



	var _servObj = {
			promise :  _promise,
			queryData: function(){return _queryData}
	};

	return _servObj;
}])

.controller('equipmentInFaultsCtrl', ['$scope', '$modal', '$location', '$route', 'equipmentInFaultsService', 'facilityQueryService','sharedPropertiesService',
                                    function($scope, $modal, $location, $route, dataService,queryData,sharedProperties) {

	$scope.activeOrganization = "";
	$scope.activeClient="";
	$scope.activeAsset="";
	$scope.active={};
	$scope.activeInfo={};
	

	
	
	
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
	

	
	
	

	queryData.promise.then( function (d) {
		$scope.thisQueryData = queryData.queryData();
	});









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
	
	

	$scope.isZero = function(thisNumber){
		if(thisNumber===0 || thisNumber===undefined){return true;}
		else{return false;}
	}
	
	
	
	$scope.ok = function() {
		sharedProperties.setActives($scope.active);
		sharedProperties.set
		
		$scope.modalInstance.close();
		
	};

	$scope.queryOrganizations();
	$scope.queryClients();
	
	
	
	// put the select asset info into active map
	$scope.apply=function(){
		$scope.active=sharedProperties.getActives();
		
		
		angular.forEach($scope.active,function(value,key){
			var del='_';
			var tempArray = dataService.stringParts(key,del);
			
			var info=[];
			info.push(tempArray[0]);
			info.push(tempArray[1]);
			info.push(tempArray[2]);
			
			dataService.getLocation(tempArray[1],tempArray[0]).then(function(){
				info.push( dataService.getAddress() );
				
			});
			
			info.push(tempArray[3]);
			// be careful , the sequence of the array doesnot follow the the sequence of pushing action, in this case, info[4] is address and info[3] is tempArray[3]			
			console.log(tempArray[3]);
			$scope.activeInfo[key]=info;
			
			
		});
		
		
		
		

		
	};
	
	$scope.j=0;
	
	//function to select / unselect all assets under one asset type
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
		console.log($scope);
		
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