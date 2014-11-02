'use strict';
 
angular.module('myApp.heatmap', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'views/heatmap.html'
  });
}])

.factory('heatmapDataService', ['$http', function($http){
	var _servObj = {};	
	var dataDict = {
		kWh1 : '/app/data2.json',
		kWh2 : '/app/data3.json',
		kWh3 : '/app/data4.json',
		kWh4 : '/app/data5.json'
	};

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
		console.log('my URL: ' + dataDict[caller.dataSource]);
		
		//return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send',"{\"name\":\"G02NSHVHV7S45Q1_kWh\"}")
		return $http.get(dataDict[caller.dataSource])
			.success(function(data){
				var j = 0;
				var last = 0;
				var dateSortedResult = {};
				var startDate = new Date(Date.now());
				var endDate = new Date();
				
				for(j = 0; j < data.result.length; j++){
					dateSortedResult[new Date(data.result[j].date)] = data.result[j].his;
					
					if(new Date(data.result[j].date).getTime() < startDate.getTime()){
						startDate = new Date(data.result[j].date);
					}
					if(new Date(data.result[j].date).getTime() > endDate.getTime()){
						endDate = new Date(data.result[j].date);
					}
				}
				
				var loopDate = startDate;
				var interpolate= [];

				console.log(startDate);
				while(loopDate.getTime() < endDate.getTime()){
					var historyArray = dateSortedResult[loopDate];
					var i = 0;
					
					try{
						for(i = 0; i < historyArray.length; i++){
					
						if( +historyArray[i].value == 0){
							continue;
						}
						else if(last != 0){
							var delta = +historyArray[i].value - last;
							//delta is 0, add to an array of timestamps to be interpolated.
							if(delta == 0){
								interpolate[interpolate.length] = (new Date(historyArray[i].timestamp).getTime() / 1000)+"";
							}
							//delat is not 0, but there is an array of timestamps to be interpolated.
							else if(interpolate.length > 0){
								var iz = 0;
								
								interpolate[interpolate.length] = (new Date(historyArray[i].timestamp).getTime() / 1000)+"";
								
								for(iz = 0; iz < interpolate.length; iz++){
									caller.dataObj[interpolate[iz]] = delta / interpolate.length;
								}
								
								interpolate = [];
							}
							//delta is not 0, and no interpolation required.
							else{

								caller.dataObj[(new Date(historyArray[i].timestamp).getTime() / 1000)+""] = delta;
							}
						}
						
						last = +historyArray[i].value
					};
					
					}
					catch(err){
						//Date missing... don't bother for now...
					}
					
					loopDate = new Date(loopDate.getTime()+1000*60*60*24);

				}
				
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
				if(this.dataObj[timestamp] < min && this.dataObj[timestamp] > 0 & this.dataObj[timestamp] != null){
					min = this.dataObj[timestamp];
				}
			}
		}
		
		//4 fifteen minute timestamps in the hour... just get a decent number....
		return min*4;
	}
	
	var _dataAsArray = function(){
		var i = 0;
		var array = [];
		
		for(var timestamp in this.dataObj){
			if(this.dataObj.hasOwnProperty(timestamp)){
				if(this.dataObj[timestamp] != 0 && this.dataObj[timestamp] != null){
					array[i] = this.dataObj[timestamp];
					i++;
				}
			}
		}
		
		return array;
	}
	
	_servObj = {
		getUrl : _getUrl,
		setUrl: _setUrl,
		getMax : _getMax,
		getMin : _getMin,
		getData : _getData,
		fillData : _fillData,
		dataAsArray : _dataAsArray
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

.factory('heatmapConfigService', [ function(){
	var _servObj = {};
	
	var _defaultConfig = {
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
		itemName: ["kWh", "kWh"],
		subDomainDateFormat: '%c',
		subDomainTextFormat: '%H', /*function(date, value) {
			if (date.getMinutes() === 0) {
				return date.getHours();
			}
			else return date.getMinutes();
		},*/
		start : new Date(1412136000000),
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

	
	var _getDefaultConfig = function(){
		return _defaultConfig;
	}
	var _init = function(){
		//caller is the controller which is currently invoking this function
		var caller = this;
		caller.setUrl('http://10.239.3.132:8080/dailyhistory/544876bf2e905908b6e5f595');
		
		caller.getData().then(function (dataddd){
		
		caller.heatmapConfig.data = caller.dataObj;

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
		getDefaultConfig : _getDefaultConfig
	};
	
	return _servObj;
}])
 
.controller('heatmapCtrl', ['$scope', '$location', '$route', 'zoomHeatmapService', 'persistHeatmapService', 'heatmapDataService', 'heatmapConfigService', function($scope, $location, $route, zoomHeatmapService, persistHeatmapService, heatmapDataService, heatmapConfigService) {
	var vm = this;

	//inject the zoomHeatmapService into the scope.
	angular.extend(vm, zoomHeatmapService);	
	angular.extend(vm, persistHeatmapService);
	angular.extend(vm, heatmapDataService);
	angular.extend(vm, heatmapConfigService);
	
	//control whether the view needs to be reloaded.
	vm.rendered = false;

	vm.url = "";

	//default data source
	vm.dataSource = 'kWh2';
	vm.dataObj = {};
	
	vm.heatmapConfig = vm.getDefaultConfig();
	
	//for testing multiple controllers inheriting the same service singleton
	vm.change = function(){
		//var max = 30;
		//var min = 10;
		//vm.heatmapConfig.range = Math.floor(Math.random()*(max-min+1)+min);

		var mean = jStat.mean(vm.dataAsArray())*4;
		var std = jStat.stdev(vm.dataAsArray())*4;
		
		console.log(mean);
		console.log(std);
		
		vm.heatmapConfig.legend = [
			mean - .5 * std, mean - .4*std, mean - .3*std, mean - .2*std, mean - .1*std,  mean,
			mean + .1*std, mean + .2*std, mean + .3*std, mean + .4*std, mean + .5*std
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

//.directive('galHeatmap', [ function() {
.directive('heatmapConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		templateUrl : 'views/heatmapConfig.html'
	}
}])
