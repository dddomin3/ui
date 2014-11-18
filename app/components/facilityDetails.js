'use strict';
angular.module('myApp.facilityDetails', ['ngRoute'])

.factory('facilityDetailsService', ['$http', function($http){
	var print_filter = function (filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	} 
	var _servObj = {};
	var _activeOrganizations = {};
	var _activeClients
	var _organizationQuery = {};
	var _clientQuery = {};

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
		//return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(message))
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
			deleteActiveClient : _deleteActiveClient 
	};

	return _servObj;
}])




.factory('csvReaderService', ['$http', function($http){

//	parser copypasta'ed from internet
	function CSVToArray( strData, strDelimiter ){
		strDelimiter = (strDelimiter || ",");

		var objPattern = new RegExp(
				(
						"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
						"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
						"([^\"\\" + strDelimiter + "\\r\\n]*))"
				),
				"gi"
		);
		var arrData = [[]];
		var arrMatches = null;
		while (arrMatches = objPattern.exec( strData )){
			var strMatchedDelimiter = arrMatches[ 1 ];
			if (
					strMatchedDelimiter.length &&
					strMatchedDelimiter !== strDelimiter
			){
				arrData.push( [] );
			}
			var strMatchedValue;
			if (arrMatches[ 2 ]){
				strMatchedValue = arrMatches[ 2 ].replace(
						new RegExp( "\"\"", "g" ),
						"\""
				);

			} else {
				strMatchedValue = arrMatches[ 3 ];
			}
			arrData[ arrData.length - 1 ].push( strMatchedValue );
		}
		return( arrData );
	}
	//end parser copypasta'ed from internet
	var Url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
	var _csvArray = [];

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
		_csvArray = response;
	});
	//console.log(promise);



	var _servObj = {
			promise :  _promise,
			csvArray: function(){return _csvArray}
	};

	return _servObj;
}])

.controller('facilityDetailsCtrl', ['$scope', '$modal', '$location', '$route', 'facilityDetailsService', 'csvReaderService',
                                    function($scope, $modal, $location, $route, dataService,csvArray) {

	$scope.activeOrganizations = dataService.getActiveOrganizations();
	$scope.activeClient="";
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

	csvArray.promise.then( function (d) {
		$scope.thisCsvArray = csvArray.csvArray();





	});

	$scope.initMultiOrganization = function (organization) {
		var add = true;
		for(var thisOrg in $scope.activeOrganizations){

			if(thisOrg===organization){
				dataService.deleteActiveOrganization(organization);
				add=false;
			}
		}
		if(add===true){
			dataService.initActiveOrganization(organization);}
	};

	$scope.initSingleOrganization = function (organization) {

		for(var thisOrg in $scope.activeOrganizations){


			dataService.deleteActiveOrganization(thisOrg);


		}
		var scopeArray = [];
		var urlScopeArray = [];
		dataService.initActiveOrganization(organization);
		for(var a in $scope.thisCsvArray.result){
			//console.log($scope.thisCsvArray.result[a].clientName);
			for(var c in $scope.activeOrganizations){var activeOrgString = $scope.activeOrganizations[c].name;}

			//console.log($scope.thisCsvArray.result[a].clientName === activeOrgString);
			if($scope.thisCsvArray.result[a].stationName === organization){
				//for(var b in $scope.thisCsvArray.result[a]){

				//console.log($scope.thisCsvArray.result[a][b]);
				$scope._clientName = $scope.thisCsvArray.result[a].clientName;
				$scope._projectName = $scope.thisCsvArray.result[a].projectName;
				$scope._stationName = $scope.thisCsvArray.result[a].stationName;
				$scope._squareFootage = $scope.thisCsvArray.result[a].squareFootage;
				$scope._image = $scope.thisCsvArray.result[a].image;
				//urlScopeArray.push('<a href="' + $scope.thisCsvArray.result[a][b] + '">' + $scope.thisCsvArray.result[a][b] + '</a>');
				//$scope.displayThis = scopeArray;
				//$scope.urlDisplayThis = urlScopeArray;

				//}
				return;
			}
			else{
				$scope._clientName = "";
				$scope._projectName = "";
				$scope._stationName = "";
				$scope._squareFootage = "";
				$scope._image = "https://browshot.com/static/images/not-found.png";
			}
		}
	};

	$scope.setClientAll = function(){

		$scope.activeClient="";
	}

	$scope.initSingleClient = function (client) {

		$scope.activeClient = client;
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

		var modalInstance = $modal.open({
			templateUrl: 'views/heatmapConfig.html',
			controller: 'heatmapConfigInstance',
			size: size,
			scope: $scope.$parent
		});

	}

	$scope.queryOrganizations();
	$scope.queryClients();
	$scope.apply;
}])

.directive('heatmapConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/heatmapConfig.html'
	}
}]);