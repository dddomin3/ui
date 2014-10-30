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
	
	//To show up as empty, the timestamp NEEDS to be in the data object as "timestamp":null - UGHHHHHHH ; Phil
	var _getData = function(){ 
		return $http.get('http://192.168.1.5:8080/dailyhistory/544f0fae44aec41e184c70d6').
		success(function(data){
				var i = 0;
				var historyArray = data.his;
				
				console.log('success????');
				
				for(i = 0; i < historyArray.length; i++){
					_dataObj[(historyArray[i].timestamp / 1000)+""] = +historyArray[i].value;
				}
				
				_dataObj[((1413949500000+900000) / 1000)+""] = null;
				_dataObj[((1413949500000+1800000) / 1000)+""] = null;
				_dataObj[((1413949500000+2700000) / 1000)+""] = null;
				_dataObj[((1413949500000+3600000) / 1000)+""] = null;
				
			}).
		error(function(data){
			console.log('error???');
			throw('there was problem getting data');
		});
	}
	
	
	var _getMax = function(){
		var max = 0;
		
		for(var timestamp in _dataObj){
			if(_dataObj.hasOwnProperty(timestamp)){
				if(_dataObj[timestamp] > max){
					console.log(_dataObj[timestamp]+' greater than previous '+max);
					max = _dataObj[timestamp];
				}
			}
		}
		
		//4 fifteen minute timestamps in the hour... just get a decent number....
		return max*4;
	}
	
	var _getMin = function(){
		var min = 999999999999999;
		
		for(var timestamp in _dataObj){
			if(_dataObj.hasOwnProperty(timestamp)){
				if(_dataObj[timestamp] < min && _dataObj[timestamp] != 0 & _dataObj[timestamp] != null){
					console.log(_dataObj[timestamp]+' less than previous '+min);
					min = _dataObj[timestamp];
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
		//var max = 30;
		//var min = 10;
		//vm.heatmapConfig.range = Math.floor(Math.random()*(max-min+1)+min);
		
		var max = heatmapDataService.getMax();
		var min = heatmapDataService.getMin();
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
		vm.rendered = true;
	});
	
}]);