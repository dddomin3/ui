'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html',
    controller: 'heatmapCtrl'
  });
}])

.factory('heatmapDataService', ['$http', function($http){
	var _servObj = {};	
	var _dataObj = {};

	
	var _setUrl = function(url){
		_url = url;

		return _servObj;
	}
	
	var _getUrl = function(){
		return _url;
	}
	
	//get data and format it as cal-heatmap expects 
	//TODO - data obj does not need to be refereshed every time we want to get??? can we re-serve from memory if we dont believe anthing has changed???
	var _getData = function(){ 
		return $http.get('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595').
		success(function(data){
				var i = 0;
				var historyArray = data.his;
				
				console.log('success????');
				
				for(i = 0; i < historyArray.length; i++){
					_dataObj[(historyArray[i].timestamp / 1000)+""] = +historyArray[i].value;
				}
				
			}).
		error(function(data){
			console.log('error???');
			throw('there was problem getting data');
		});
	}
	
	_servObj = {
		getUrl : _getUrl,
		setUrl: _setUrl,
		getData : _getData,
		dataObj : _dataObj
	}
	
	return _servObj;
	
}])

.factory('persistHeatmapService', ['persistViewService', function(persistViewService){
	var _servObj = {};
	
	//inherit functionality through composition
	angular.extend(_servObj, persistViewService);	
	
	_servObj.setViewType('heatmap');
	
	_servObj.printThis = function(){
		console.log(this);
			console.log(this.getTimestamp());
	}
	
	return _servObj;
}])
 
.controller('heatmapCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService', 'heatmapDataService', function($scope, $location, $route, zoomHeatmapService, persistHeatmapService, heatmapDataService) {
	var vm = this;
	
	//control whether the view needs to be reloaded.
	vm.rendered = false;

	//inject the zoomHeatmapService into the scope.
	angular.extend(vm, zoomHeatmapService);	
	angular.extend(vm, persistHeatmapService);
	
	//for testing multiple controllers inheriting the same service singleton
	vm.change = function(){
		var max = 30;
		var min = 10;
		vm.heatmapConfig.range = Math.floor(Math.random()*(max-min+1)+min);
		vm.rendered = false;

		console.log('before:');
		console.log(vm);
		console.log(vm.getTimestamp());
		
		vm.setTimestamp(new Date());
		
		console.log('after:');		
		console.log(vm.getTimestamp());
		
		$scope.myTimestamp = vm.getTimestamp();
		
		//In one second, reload the heatmap component with the changed configuration.
		window.setTimeout(function(){
			vm.rendered = true;
			$scope.$apply();
		}, 1000);
	}
	
	heatmapDataService.getData().then(function (dataddd){
		console.log(dataddd);
		
		vm.heatmapConfig = {
			onClick:function(date, value){
				zoomHeatmapService.setTimestamp(date.getTime());
				
				$location.url('/zoomHeatmap');			
				$route.reload();
			},
			domain: 'day',
			data: heatmapDataService.dataObj,
			subDomain: 'hour',
			range: 30,	//number of domains (days in current implementation)
			cellSize: 20, //px size of cells
			cellPadding: 1,	//px between cells
			cellRadius: 2,	//px of cell radius
			domainGutter: 0, //px padding between dates
			colLimit: 1, //number of colums per domain
			legend: [0,1,2,3,4,5,6,7,8,9,10,11,12],	//legend. Remember its like actually the count
													//TODO: make vm change dependant on dataset
			legendVerticalPosition: "center",
			legendHorizontalPosition: "right",
			legendOrientation: "vertical",
			legendMargin: [10, 10, 10, 10],
			legendColors: ['#00FF00', '#FF0000'],	//colors of legend gradient
			subDomainTextFormat: '%H', /*function(date, value) {
				if (date.getMinutes() === 0) {
					return date.getHours();
				}
				else return date.getMinutes();
			},*/
			start : new Date(1413864000000),
			domainLabelFormat: function(date) {//format of each domain label. "x axis" labels
				var month = 
					["Jan", "Feb", "Mar", "Apr",
					 "May", "Jun", "Jul", "Aug",
					 "Sep", "Oct", "Nov", "Dec"];
				if (date.getDate() % 2 === 0) {
					return date.getDate();
				}
				else {
					return month[date.getMonth()];
				}
			},	
			label: {
				width: 30,
				position: 'bottom'
				//rotate: 'left' doesn't work if position is bottom!
			}
		};
		
		//after setting heatmap config, unhide the component.
		vm.rendered = true;
	});
	
}]);