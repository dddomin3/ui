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
	var _weatherQuery = {};
	var _clientQuery = {};

	var _getWeather = function(city,state){
	if(state==="null"){state="";}
		return $http.get("http://api.openweathermap.org/data/2.5/forecast/daily?q="+city+","+state+"&mode=json&type=accurate&units=imperial&cnt=7&e2b7c435e01ce8ce7833e41644057103")
		//return $http.get("http://api.openweathermap.org/data/2.5/weather?lat=35&lon=139cnt=7")
		.success(function(data) {

			_weatherQuery=data;
			
		})
	}

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


	var _getWeatherQuery =  function () {
		return _weatherQuery;
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
			getWeather: _getWeather,
			getWeatherQuery : _getWeatherQuery,

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

.controller('facilityDetailsCtrl', ['$scope', '$modal', '$location', '$route', 'facilityDetailsService', 'facilityQueryService','sharedPropertiesService',
                                    function($scope, $modal, $location, $route, dataService,queryData,sharedProperties) {

	$scope.activeOrganizations = dataService.getActiveOrganizations();
	$scope.activeClient="";
	$scope.queryOrganizations = function () {
		dataService.getOrganizations($scope.activeClient).then( function () {
			$scope.organizationQuery = dataService.getOrganizationQuery();
		});
	};

	//console.log(dataService.getWeather("Somerset"));
	$scope.initWeather = function () {
if($scope.$parent.$parent._city==="null"){return;}
		dataService.getWeather($scope.$parent.$parent._city,$scope.$parent.$parent._state).then( function () {
			console.log($scope.$parent.$parent);
			console.log(dataService.getWeatherQuery());
			if(dataService.getWeatherQuery().cod==="200" && dataService.getWeatherQuery().cnt>=5){
			$scope.$parent.$parent.weatherQuery = dataService.getWeatherQuery();
			$scope.testing = "testing";
			
			var date1 = new Date($scope.weatherQuery.list[0].dt*1000);
			var date2 = new Date($scope.weatherQuery.list[1].dt*1000);
			var date3 = new Date($scope.weatherQuery.list[2].dt*1000);
			var date4 = new Date($scope.weatherQuery.list[3].dt*1000);
			var date5 = new Date($scope.weatherQuery.list[4].dt*1000);

			var weatherQueryArray = $scope.$parent.$parent.weatherQuery.list
			var day1=weatherQueryArray[0];
			var day2=weatherQueryArray[1];
			var day3=weatherQueryArray[2];
			var day4=weatherQueryArray[3];
			var day5=weatherQueryArray[4];
			$scope.$parent.$parent.day1LowTemp=day1.temp.min;
			$scope.$parent.$parent.day1HighTemp=day1.temp.max;
			$scope.$parent.$parent.day1Rain=day1.rain;
			$scope.$parent.$parent.day1Desc=day1.weather[0].description;
			$scope.$parent.$parent.day1Clouds=day1.clouds;
			$scope.$parent.$parent.day1Snow=day1.snow;
			$scope.$parent.$parent.day1Name=getDayName(date1.getDay());
			$scope.$parent.$parent.day1Image="/app/pictures/"+day1.weather[0].icon+".png";
			
			$scope.$parent.$parent.day2LowTemp=$scope.$parent.$parent.weatherQuery.list[1].temp.min;
			$scope.$parent.$parent.day2HighTemp=$scope.$parent.$parent.weatherQuery.list[1].temp.max;
			$scope.$parent.$parent.day2Rain=$scope.$parent.$parent.weatherQuery.list[1].rain;
			$scope.$parent.$parent.day2Desc=$scope.$parent.$parent.weatherQuery.list[1].weather[0].description;
			$scope.$parent.$parent.day2Clouds=$scope.$parent.$parent.weatherQuery.list[1].clouds;
			$scope.$parent.$parent.day2Snow=$scope.$parent.$parent.weatherQuery.list[1].snow;
			$scope.$parent.$parent.day2Name=getDayName(date2.getDay());
			$scope.$parent.$parent.day2Image="/app/pictures/"+day2.weather[0].icon+".png";

			$scope.$parent.$parent.day3LowTemp=$scope.$parent.$parent.weatherQuery.list[2].temp.min;
			$scope.$parent.$parent.day3HighTemp=$scope.$parent.$parent.weatherQuery.list[2].temp.max;
			$scope.$parent.$parent.day3Rain=$scope.$parent.$parent.weatherQuery.list[2].rain;
			$scope.$parent.$parent.day3Desc=$scope.$parent.$parent.weatherQuery.list[2].weather[0].description;
			$scope.$parent.$parent.day3Clouds=$scope.$parent.$parent.weatherQuery.list[2].clouds;
			$scope.$parent.$parent.day3Snow=$scope.$parent.$parent.weatherQuery.list[2].snow;
			$scope.$parent.$parent.day3Name=getDayName(date3.getDay());
			$scope.$parent.$parent.day3Image="/app/pictures/"+day3.weather[0].icon+".png";

			$scope.$parent.$parent.day4LowTemp=$scope.$parent.$parent.weatherQuery.list[3].temp.min;
			$scope.$parent.$parent.day4HighTemp=$scope.$parent.$parent.weatherQuery.list[3].temp.max;
			$scope.$parent.$parent.day4Rain=$scope.$parent.$parent.weatherQuery.list[3].rain;
			$scope.$parent.$parent.day4Desc=$scope.$parent.$parent.weatherQuery.list[3].weather[0].description;
			$scope.$parent.$parent.day4Clouds=$scope.$parent.$parent.weatherQuery.list[3].clouds;
			$scope.$parent.$parent.day4Snow=$scope.$parent.$parent.weatherQuery.list[3].snow;
			$scope.$parent.$parent.day4Name=getDayName(date4.getDay());
			$scope.$parent.$parent.day4Image="/app/pictures/"+day4.weather[0].icon+".png";

			$scope.$parent.$parent.day5LowTemp=$scope.$parent.$parent.weatherQuery.list[4].temp.min;
			$scope.$parent.$parent.day5HighTemp=$scope.$parent.$parent.weatherQuery.list[4].temp.max;
			$scope.$parent.$parent.day5Rain=$scope.$parent.$parent.weatherQuery.list[4].rain;
			$scope.$parent.$parent.day5Desc=$scope.$parent.$parent.weatherQuery.list[4].weather[0].description;
			$scope.$parent.$parent.day5Clouds=$scope.$parent.$parent.weatherQuery.list[4].clouds;
			$scope.$parent.$parent.day5Snow=$scope.$parent.$parent.weatherQuery.list[4].snow;
			$scope.$parent.$parent.day5Name=getDayName(date5.getDay());
			$scope.$parent.$parent.day5Image="/app/pictures/"+day5.weather[0].icon+".png";

			}
			else{
			delete $scope.$parent.$parent.weatherQuery;
			delete $scope.$parent.$parent.day1LowTemp;
			delete $scope.$parent.$parent.day1HighTemp;
			delete $scope.$parent.$parent.day1Rain;
			delete $scope.$parent.$parent.day1Desc;
			delete $scope.$parent.$parent.day1Cloud;
			delete $scope.$parent.$parent.day1Snow;
			delete $scope.$parent.$parent.day1Name;
			delete $scope.$parent.$parent.day1Image;
			
			delete $scope.$parent.$parent.day2LowTemp;
			delete $scope.$parent.$parent.day2HighTemp;
			delete $scope.$parent.$parent.day2Rain;
			delete $scope.$parent.$parent.day2Desc;
			delete $scope.$parent.$parent.day2Cloud;
			delete $scope.$parent.$parent.day2Snow;
			delete $scope.$parent.$parent.day2Name;
			delete $scope.$parent.$parent.day2Image;

			delete $scope.$parent.$parent.day3LowTemp;
			delete $scope.$parent.$parent.day3HighTemp;
			delete $scope.$parent.$parent.day3Rain;
			delete $scope.$parent.$parent.day3Desc;
			delete $scope.$parent.$parent.day3Cloud;
			delete $scope.$parent.$parent.day3Snow;
			delete $scope.$parent.$parent.day3Name;
			delete $scope.$parent.$parent.day3Image;

			delete $scope.$parent.$parent.day4LowTemp;
			delete $scope.$parent.$parent.day4HighTemp;
			delete $scope.$parent.$parent.day4Rain;
			delete $scope.$parent.$parent.day4Desc;
			delete $scope.$parent.$parent.day4Cloud;
			delete $scope.$parent.$parent.day4Snow;
			delete $scope.$parent.$parent.day4Name;
			delete $scope.$parent.$parent.day4Image;

			delete $scope.$parent.$parent.day5LowTemp;
			delete $scope.$parent.$parent.day5HighTemp;
			delete $scope.$parent.$parent.day5Rain;
			delete $scope.$parent.$parent.day5Desc;
			delete $scope.$parent.$parent.day5Cloud;
			delete $scope.$parent.$parent.day5Snow;
			delete $scope.$parent.$parent.day5Name;
			delete $scope.$parent.$parent.day5Image;
			
			}
		});
	}

	

	var getDayName = function(dayNumber){
		if(dayNumber===1){return "Monday";}
		if(dayNumber===2){return "Tuesday";}
		if(dayNumber===3){return "Wednesday";}
		if(dayNumber===4){return "Thursday";}
		if(dayNumber===5){return "Friday";}
		if(dayNumber===6){return "Saturday";}
		if(dayNumber===0){return "Sunday";}
	}

	$scope.queryClients = function () {
		dataService.getClients().then( function () {
			$scope.clientQuery = dataService.getClientQuery();
		});
	};

	queryData.promise.then( function (d) {
		$scope.thisQueryData = queryData.queryData();
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
		$scope.$parent.$parent.siteCount=0;
		var scopeArray = [];
		var urlScopeArray = [];
		dataService.initActiveOrganization(organization);
		setDetails(organization);

	}

var setDetails = function(organization){
for(var a in $scope.thisQueryData.result){
			//console.log($scope.thisCsvArray.result[a].clientName);
			for(var c in $scope.activeOrganizations){var activeOrgString = $scope.activeOrganizations[c].name;$scope.activeOrg = activeOrgString;}

			//console.log($scope.thisCsvArray.result[a].clientName === activeOrgString);
			if($scope.thisQueryData.result[a].stationName === organization){
				//for(var b in $scope.thisCsvArray.result[a]){

				
if($scope.$parent.$parent.$parent.$parent!==null){$scope.$parent.$parent.$parent.$parent.organization = organization;}
				$scope.$parent.$parent._clientName = $scope.thisQueryData.result[a].clientName;
				$scope.$parent.$parent._projectName = $scope.thisQueryData.result[a].projectName;
				$scope.$parent.$parent._liveDate = $scope.thisQueryData.result[a].liveDate;
				$scope.$parent.$parent._facilityAddress = $scope.thisQueryData.result[a].facilityAddress;
				$scope.$parent.$parent._image = $scope.thisQueryData.result[a].image;
				$scope.$parent.$parent._squareFootage = $scope.thisQueryData.result[a].squareFootage;
				$scope.$parent.$parent._city =$scope.thisQueryData.result[a].city;
				$scope.$parent.$parent._state =$scope.thisQueryData.result[a].state;
				$scope.$parent.$parent._buildingType = $scope.thisQueryData.result[a].buildingType;
				
				
				
 
				$scope.$parent.$parent._assetCount = 0;
				
				for(var thisAssetType in $scope.thisQueryData.result[a].asset){
					$scope.$parent.$parent._assetCount = $scope.$parent.$parent._assetCount+$scope.thisQueryData.result[a].asset[thisAssetType].length;
				}

				//urlScopeArray.push('<a href="' + $scope.thisCsvArray.result[a][b] + '">' + $scope.thisCsvArray.result[a][b] + '</a>');
				//$scope.displayThis = scopeArray;
				//$scope.urlDisplayThis = urlScopeArray;

				//}
				return;
			}
			else{
				$scope.$parent.$parent._clientName = "";
				$scope.$parent.$parent._projectName ="";
				$scope.$parent.$parent._liveDate = "";
				$scope.$parent.$parent._facilityAddress = "";
				$scope.$parent.$parent._image = "";
				$scope.$parent.$parent._squareFootage = "";
				$scope.$parent.$parent._buildingType = "";
				$scope.$parent.$parent._city = "";
				$scope.$parent.$parent._state = "";
			}
		}
}

$scope.refresh = function(){

if($scope._assetCount===undefined){$scope._assetCount=0};
if($scope.siteCount===undefined){$scope.siteCount=0};
if($scope._clientName===undefined){$scope._clientName=""};
if($scope._projectName===undefined){$scope._projectName=""};
if($scope._liveDate===undefined){$scope._liveDate=""};
if($scope._facilityAddress===undefined){$scope._facilityAddress=""};
if($scope._image===undefined){$scope._image=""};
if($scope._squareFootage===undefined){$scope._squareFootage=""};
if($scope._city===undefined){$scope._city=""};
if($scope._state===undefined){$scope._state=""};
if($scope._buildingType===undefined){$scope._buildingType=""};
				$scope.$parent.$parent._assetCount = $scope._assetCount;
				$scope.$parent.$parent.siteCount=$scope.siteCount;
				$scope.$parent.$parent._clientName = $scope._clientName;
				$scope.$parent.$parent._projectName = $scope._projectName;
				$scope.$parent.$parent._liveDate = $scope._liveDate;
				$scope.$parent.$parent._facilityAddress = $scope._facilityAddress;
				$scope.$parent.$parent._image = $scope._image;
				$scope.$parent.$parent._squareFootage = $scope._squareFootage;
				$scope.$parent.$parent._city =$scope._city;
				$scope.$parent.$parent._state =$scope._state;
				$scope.$parent.$parent._buildingType = $scope._buildingType;
				$scope.$parent.$parent._weatherQuery = $scope._weatherQuery;
}

	$scope.setClientAll = function(){
		$scope.activeClient="";
	}

	$scope.initSingleClient = function (client) {
		$scope.activeClient = client;
		$scope.activeOrg = "";
		$scope.$parent.$parent.activeOrg="";
		$scope.$parent.$parent._buildingType = "";
		$scope.$parent.$parent._liveDate = "";
				$scope.$parent.$parent._facilityAddress = "";
		delete $scope.$parent.$parent.weatherQuery;
		$scope.totalizeStats();
	};

	$scope.totalizeStats = function(){
		$scope.totalSquareFootage = 0;
		$scope.totalAssetCount = 0;
		$scope.$parent.$parent.siteCount = 0;
		$scope.$parent.$parent._assetCount = 0;
		for(var a in $scope.thisQueryData.result){

			if($scope.thisQueryData.result[a].clientName===$scope.activeClient){
				var oldTotal = $scope.totalSquareFootage;
				var newTotal = Number($scope.thisQueryData.result[a].squareFootage);
				if(newTotal!==NaN){
					$scope.totalSquareFootage = oldTotal+newTotal;
				}


				for(var thisAssetType in $scope.thisQueryData.result[a].asset){
					$scope.totalAssetCount = $scope.totalAssetCount+$scope.thisQueryData.result[a].asset[thisAssetType].length;

					//console.log($scope.totalAssetCount);
				}
				$scope.$parent.$parent.siteCount=$scope.$parent.$parent.siteCount+1;
				
			}

		}
		
		$scope.$parent.$parent._assetCount = $scope.totalAssetCount;
		$scope.$parent.$parent._squareFootage = $scope.totalSquareFootage;
		$scope.$parent.$parent._clientName = $scope.activeClient;
		$scope.$parent.$parent._projectName = "";
		$scope.$parent.$parent._stationName = "";
		$scope.$parent.$parent._image = "";
	}

	$scope.debug = function () {
		console.log($scope);

	};
	
	$scope.expanded=false;
	$scope.expand = function () {
		if($scope.expanded===false){
		$scope.expanded=true;}
		else if($scope.expanded===true){
		$scope.expanded=false;}

	};





	$scope.openConfig = function(size) {
		$scope.activeOrg = "";
		
		var modalInstance = $modal.open({
			templateUrl: 'views/facilityDetailsConfig.html',
			controller: 'facilityDetailsConfigInstance',
			size: size,
			scope: $scope
		});

	}
	
	$scope.openDetailed = function(size) {
		$scope.activeOrg = "";
		
		var modalInstance = $modal.open({
			templateUrl: 'views/detailedfacilityDetails.html',
			controller: 'facilityDetailsConfigInstance',
			size: size,
			scope: $scope
		});

	}
	
	$scope.facilitySelected=function(){
	//console.log($scope.weatherQuery===undefined)
	if($scope.weatherQuery===undefined){return false;}
	else{return true;}
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

	$scope.isZero = function(thisNumber){
		if(thisNumber===0 || thisNumber===undefined){return true;}
		else{return false;}
	}

	$scope.queryOrganizations();
	$scope.queryClients();
	$scope.apply;
}])

.service('sharedPropertiesService', function () {
	var clientName = "";
	var projectName = "";
	var stationName = "";
	var squareFootage = "";
	var image = "";

	return {
		getClientName: function () {
			return clientName;
		},
		getProjectName: function () {
			return projectName;
		},
		getStationName: function () {
			return stationName;
		},
		getSquareFootage: function () {
			return squareFootage;
		},
		getImage: function () {
			return image;
		},
		setClientName: function(value) {
			clientName = value;
		},
		setProjectName: function(value) {
			projectName = value;
		},
		setStationName: function(value) {
			stationName = value;
		},
		setSquareFootage: function(value) {
			squareFootage = value;
		},
		setImage: function(value) {
			image = value;
		}
	};
})

.directive('facilityDetailsConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/facilityDetailsConfig.html'
	}
}]);