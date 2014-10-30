'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html',
    controller: 'heatmapCtrl'
  });
}])

.factory('heatmapDataFactory', ['$http', function($http){
	var _servObj = {};	
	
	var _setUrl = function(Url){
		this.url = Url;
		console.log('I set url');
		console.log(this);
		
		return _servObj;
	}
	
	var _getUrl = function(){
		console.log(this);
		
		return this.url;
	}
	
	//get data and format it as cal-heatmap expects 
	//TODO - data obj does not need to be refereshed every time we want to get??? can we re-serve from memory if we dont believe anthing has changed???
	
	//To show up as empty, the timestamp NEEDS to be in the data object as "timestamp":null - UGHHHHHHH ; Phil
	var _getData = function(){
		var caller = this;
		
		return $http.get(caller.getUrl())
			.success(function(data){
					
					var i = 0;
					var historyArray = data.his;
					
					console.log('success????');
					
					for(i = 0; i < historyArray.length; i++){
						caller.dataObj[(historyArray[i].timestamp / 1000)+""] = +historyArray[i].value;
					};
				})
			.error(function(data){
				console.log('error???');
				throw('there was problem getting data');
			});
	}
	
	
	var _getMax = function(){
		var max = 0;
		
		for(var timestamp in this.dataObj){
			if(this.dataObj.hasOwnProperty(timestamp)){
				if(this.dataObj[timestamp] > max){
					max = this.dataObj[timestamp];
				}
			}
		}
		
		//4 fifteen minute timestamps in the hour... just get a decent number....
		return max*4;
	}
	
	var _getMin = function(){
		var min = 999999999999999;
		
		for(var timestamp in this.dataObj){
			if(this.dataObj.hasOwnProperty(timestamp)){
				if(this.dataObj[timestamp] < min && this.dataObj[timestamp] != 0 & this.dataObj[timestamp] != null){
					min = this.dataObj[timestamp];
				}
			}
		}
		
		//4 fifteen minute timestamps in the hour... just get a decent number....
		return min*4;
	}
	
	_servObj = {
		getUrl : _getUrl,
		setUrl: _setUrl,
		getMax : _getMax,
		getMin : _getMin,
		getData : _getData,
	}
	
	return _servObj;
	
}])

.service('heatmapDataService', ['heatmapDataFactory', function(heatmapDataFactory){
	//inherit common functionality from the factory...
	angular.extend(this, heatmapDataFactory);
	
	this.dataObj = {};
	this.url = "";
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

.factory('heatmapConfigFactory', [ function(){
	var _servObj = {};
	
	var _init = function(){
		//caller is the controller which is currently invoking this function
		var caller = this;
		caller.setUrl('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595');
		
		console.log(caller);
		caller.getData().then(function (dataddd){
				
		caller.heatmapConfig = {
			onClick:function(date, value){
				caller.setTimestamp(date.getTime());
				
				$location.url('/zoomHeatmap');			
				$route.reload();
			},
			domain: 'day',
			data: caller.dataObj,
			subDomain: 'hour',
			range: 30,	//number of domains (days in current implementation)
			cellSize: 20, //px size of cells
			cellPadding: 1,	//px between cells
			cellRadius: 2,	//px of cell radius
			considerMissingDataAsZero: true,
			domainGutter: 0, //px padding between dates
			colLimit: 1, //number of colums per domain
			legend: [1,2,3,4,5,6,7,8,9,10,11,12,13],	//legend. Remember its like actually the count
													//TODO: make vm change dependant on dataset
			legendVerticalPosition: "center",
			legendHorizontalPosition: "right",
			legendOrientation: "vertical",
			legendMargin: [10, 10, 10, 10],
			legendColors: {empty:'#C2C2A3', base: '#C2C2A3', min:'#00FF00', max:'#FF0000'},	//colors of legend gradient
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
		caller.rendered = true;
	});
	}
	
	_servObj = {
		init : _init
	};
	
	return _servObj;
}])

.service('heatmapConfigService', [ 'heatmapConfigFactory', function(heatmapConfigFactory){
	this.heatmapConfig = {};
	this.rendered = false;
	
	//inherit common functions / global variables from factory
	angular.extend(this, heatmapConfigFactory);
}])
 
.controller('heatmapCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService', 'heatmapDataService', 'heatmapConfigService', function($scope, $location, $route, zoomHeatmapService, persistHeatmapService, heatmapDataService, heatmapConfigService) {
	var vm = this;
	
	//control whether the view needs to be reloaded.
	vm.rendered = false;

	//inject the zoomHeatmapService into the scope.
	angular.extend(vm, zoomHeatmapService);	
	angular.extend(vm, persistHeatmapService);
	angular.extend(vm, heatmapDataService);
	angular.extend(vm, heatmapConfigService);
	
	//for testing multiple controllers inheriting the same service singleton
	vm.change = function(){
		//var max = 30;
		//var min = 10;
		//vm.heatmapConfig.range = Math.floor(Math.random()*(max-min+1)+min);
		
		var max = vm.getMax();
		var min = vm.getMin();
		var delta = max-min;
		
		vm.heatmapConfig.legend = [
			min, min + delta/10, min + delta/5, min+3*delta/10, min+2*delta/5, min+delta/2, min+3*delta/5, min+7*delta/10,
			min+4*delta/5, min+9*delta/10, max, max+delta/10
		];
		
		console.log(vm.heatmapConfig.legend);
		
		vm.rendered = false;
		
		//In one second, reload the heatmap component with the changed configuration.
		window.setTimeout(function(){
			vm.rendered = true;
			$scope.$apply();
		}, 1000);
	}
	
	vm.init();
	
}]);