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
		var message = {
				"date": {
					"$gt": {
						"$date": "2014-10-22T22:02:48.488Z"
					}
				},
				
				"clientName": client,
				
				"stationName":org
				
				
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
					
						angular.forEach(data.result[i].asset,function(value,key){
							angular.forEach(value,function(value,key){
								_assetQuery[value]='';
							});
					
						});
					

						

						
					}
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
			deleteActiveAsset : _deleteActiveAsset 
			
			
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



	$scope.isLink = function(string){
		//var regex = /^[a-z](?:[-a-z0-9\+\.])*:(?:\/\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:])*@)?(?:\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\._~!\$&'\(\)\*\+,;=:]+)\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=@])*)(?::[0-9]*)?(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*|\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))+)(?:\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])))(?:\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])|[\x{E000}-\x{F8FF}\x{F0000}-\x{FFFFD}|\x{100000}-\x{10FFFD}\/\?])*)?(?:\#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\._~\x{A0}-\x{D7FF}\x{F900}-\x{FDCF}\x{FDF0}-\x{FFEF}\x{10000}-\x{1FFFD}\x{20000}-\x{2FFFD}\x{30000}-\x{3FFFD}\x{40000}-\x{4FFFD}\x{50000}-\x{5FFFD}\x{60000}-\x{6FFFD}\x{70000}-\x{7FFFD}\x{80000}-\x{8FFFD}\x{90000}-\x{9FFFD}\x{A0000}-\x{AFFFD}\x{B0000}-\x{BFFFD}\x{C0000}-\x{CFFFD}\x{D0000}-\x{DFFFD}\x{E1000}-\x{EFFFD}!\$&'\(\)\*\+,;=:@])|[\/\?])*)?$/i
		var regex = /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/
			return regex.test(string);
	};

	$scope.urlify = function(string){
		//var regex = /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/
		return "'+string+'";
	}

	$scope.debug = function () {
		console.log($scope);

	};





	$scope.open = function(size) {
		$scope.activeOrg = "";
		
		var modalInstance = $modal.open({
			templateUrl: 'views/equipmentInFaultsConfig.html',
			controller: 'equipmentInFaultsConfigInstance',
			size: size,
			scope: $scope
		});

	};
	
	// function to display  selected asset to a list 
	$scope.add = function( ) {
		$scope.active [ $scope.activeClient + "_"+$scope.activeOrganization + "_"+$scope.activeAsset ] ="";
		
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

	$scope.queryOrganizations();
	$scope.queryClients();
	$scope.apply;
}])


.directive('equipmentInFaultsConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/equipmentInFaultsConfig.html'
	}
}]);