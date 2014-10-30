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

		return _servObj;
	}
	
	var _getUrl = function(){
		
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

					for(i = 0; i < historyArray.length; i++){
						caller.dataObj[(historyArray[i].timestamp / 1000)+""] = +historyArray[i].value;
					};
					
					caller.fillData();
				})
			.error(function(data){
				console.log('error???');
				throw('there was problem getting data');
			});
	}
	
	//fill the dataset with timestamp:null values up to the last date in calendar config.
	var _fillData = function(){
		var caller = this;
		
		var currentTime = caller.heatmapConfig.start.getTime() / 1000;
		var subDomainDelta = 9999999999999;
		
		if(caller.heatmapConfig.subDomain.indexOf('min') >= 0){
			subDomainDelta = 60;
		}
		else if(caller.heatmapConfig.subDomain.indexOf('hour') >= 0){
			subDomainDelta = 60*60;
		}
		else if(caller.heatmapConfig.subDomain.indexOf('day') >= 0){
			subDomainDelta = 60*60*24;
		}
		else if(caller.heatmapConfig.subDomain.indexOf('month') >= 0){
			//TODO make this dynamic based on month the calendar is in
			subDomainDelta = 60*60*24*30;
		}
		
		while(currentTime <= caller.calEnd()){
			if(!caller.dataObj.hasOwnProperty(currentTime+"")){
				caller.dataObj[currentTime+""] = null;
			}
			
			//move to next minute (should do this based on sub domain instead???)
			currentTime = currentTime + subDomainDelta;
		}
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
		fillData : _fillData
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
	
	var DefaultConfig = {
			onClick:function(date, value){
				caller.setTimestamp(date.getTime());
				
				$location.url('/zoomHeatmap');			
				$route.reload();
			},
			domain: 'day',
			domainMargin : 2,
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
	
	var _defaultConfig = function(){
		return {
			onClick:function(date, value){
				caller.setTimestamp(date.getTime());
				
				$location.url('/zoomHeatmap');			
				$route.reload();
			},
			domain: 'day',
			domainMargin : 2,
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
	}
	
	var _init = function(){
		//caller is the controller which is currently invoking this function
		var caller = this;
		caller.setUrl('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595');
		
		console.log(caller);
		caller.getData().then(function (dataddd){
		
		caller.heatmapConfig.data = caller.dataObj;
		caller.getUrl = 1000;

		//after setting heatmap config, unhide the component.
		caller.rendered = true;
	});
	}
	
	var _calEnd = function(){
		var caller = this;
		
		return caller.heatmapConfig.start.getTime() / 1000 + caller.calRange();
	}
	
	var _calRange = function(){
		var caller = this;
		var multiplier = 0;
		
		if(caller.heatmapConfig.domain.indexOf('hour')>=0){
			multiplier = 60 * 60;
		}
		else if(caller.heatmapConfig.domain.indexOf('day')>=0){
				multiplier = 60 * 60 * 24;
		}
		else if(caller.heatmapConfig.domain.indexOf('week')>=0){
				multiplier = 60 * 60 * 24 * 7;
		}
		else if(caller.heatmapConfig.domain.indexOf('month')>=0){
			//fix this to be dynamic based on month the calendar starts in
			multiplier = 60 * 60 * 24 * 30;
		}
		else if(caller.heatmapConfig.domain.indexOf('year')>=0){
			multiplier = 60 * 60 * 24 * 365;
		}

		return caller.heatmapConfig.range * multiplier;
	}
	
	_servObj = {
		init : _init,
		calEnd : _calEnd,
		calRange : _calRange,
		defaultConfig : _defaultConfig
	};
	
	return _servObj;
}])

.service('heatmapConfigService', [ 'heatmapConfigFactory', function(heatmapConfigFactory){
	//inherit common functions / global variables from factory
	angular.extend(this, heatmapConfigFactory);
	
	this.heatmapConfig = this.defaultConfig();
	this.rendered = false;
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
	
	vm.rand = Math.floor(Math.random()*(100+1)+7);
	//for testing multiple controllers inheriting the same service singleton
	vm.change = function(){
		//var max = 30;
		//var min = 10;
		//vm.heatmapConfig.range = Math.floor(Math.random()*(max-min+1)+min);
			vm.rand = Math.floor(Math.random()*(100+1)+7);

		var max = vm.getMax();
		var min = vm.getMin();
		var delta = max-min;
		
		vm.heatmapConfig.legend = [
			min, min + delta/10, min + delta/5, min+3*delta/10, min+2*delta/5, min+delta/2, min+3*delta/5, min+7*delta/10,
			min+4*delta/5, min+9*delta/10, max, max+delta/10
		];
		
		vm.rendered = false;
		
		//In one second, reload the heatmap component with the changed configuration.
		window.setTimeout(function(){
			vm.rendered = true;
			$scope.$apply();
		}, 1000);
	}
	
	vm.init();
	
}])

.directive('heatmapConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/heatmapConfig.html'
	}
}])