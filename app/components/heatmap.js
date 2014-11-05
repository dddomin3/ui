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
	
	var schedDict = {
		kWh1 : '/app/sched2.json',
		kWh2 : '/app/sched3.json',
		kWh3 : '/app/sched4.json',
		kWh4 : '/app/sched5.json'
	}

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
		
		//return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send',"{\"name\":\"G02NSHVHV7S45Q1_kWh\"}")
		return $http.get(caller.dataSource)
			.success(function(data){
				console.log('getting data');
				var j = 0;
				var last = 0;
				var dateSortedResult = {};
				var startDate = new Date(Date.now());
				var endDate = new Date();
				
				caller.clearData();
				
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

				//when there is no day at all, the interpolate operation does not occur for times within that day.
				//also, loading a new data source will stuff readings into the old data object which will then persist after we switch back, causing it took look like data has been processed for those times.
				
				while(loopDate.getTime() < endDate.getTime()){
					var historyArray = dateSortedResult[loopDate];
					var i = 0;
					
					try{
						for(i = 0; i < historyArray.length; i++){
					
						/*
						if(loopDate.toString().indexOf('Oct 22') >= 0){
							console.log(loopDate);
							console.log(interpolate);
							console.log(+historyArray[i].value);
						}
						*/
						
						if( +historyArray[i].value == 0){
							continue;
						}
						else if(last != 0){
							var delta = +historyArray[i].value - last;
							delta = Math.round(delta);
							
							//delta is 0, add to an array of timestamps to be interpolated.
							if(delta == 0){
								interpolate[interpolate.length] = (new Date(historyArray[i].timestamp).getTime() / 1000)+"";
							}
							//delat is not 0, but there is an array of timestamps to be interpolated.
							else if(interpolate.length > 0){
								var iz = 0;
								
								interpolate[interpolate.length] = (new Date(historyArray[i].timestamp).getTime() / 1000)+"";
								
								for(iz = 0; iz < interpolate.length; iz++){
									var date = new Date(interpolate[iz]*1000)

									caller.dataObj[interpolate[iz]] = +((delta / interpolate.length).toFixed(2));
								}
								
								interpolate = [];
							}
							//delta is not 0, and no interpolation required.
							else{

								caller.dataObj[(new Date(historyArray[i].timestamp).getTime() / 1000)+""] = delta;
							}
						}
						
						last = +(+historyArray[i].value).toFixed(2);
					};
					
					loopDate = new Date(loopDate.getTime()+1000*60*60*24);
					}
					catch(err){
						
						//populate the non-existent date with null values, and allow the loop to repeat and interpolate.
						dateSortedResult[loopDate] = [];
						var arrayIndex = 0;
						var makeDate = new Date(loopDate.getTime());
						var endDayDate = new Date(loopDate.getTime()+1000*60*60*24);
						
						while(makeDate.getTime() < endDayDate){
							dateSortedResult[loopDate][arrayIndex] = {
								timestamp : makeDate.getTime(),
								value : last
							};
							
							makeDate = new Date(makeDate.getTime()+1000*60*15)
							arrayIndex++;
						}
						
					}

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
	
	var _clearData = function(){
		var caller = this;
		
		delete caller.dataObj;
		caller.dataObj = {};
	}
	
	_servObj = {
		getUrl : _getUrl,
		setUrl: _setUrl,
		getMax : _getMax,
		getMin : _getMin,
		getData : _getData,
		fillData : _fillData,
		clearData : _clearData,
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
		
		domain: 'day',
		domainMargin : 2,
		subDomain: 'hour',
		range: 40,	//number of domains (days in current implementation)
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
		subDomainTextFormat: function(date, value) {
			/*if (date.getHours() == 8) {
				return 'X';
			}
			else */
			return '';
		},
		start : new Date(1412136000000-7*24*60*60*1000),
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
	};
	
	var _calEnd = function(){
		var caller = this;
		
		return caller.heatmapConfig.start.getTime() / 1000 + caller.calRange();
	};
	
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
	};
	
	//take a javascript date, and return the HTML5 cell in the heatmap associated with it
	var _getTimeCell = function(date){
		var caller = this;
		
		//heatmaps week starts on a mondays (it is the +1).This function is added to ALL date objects
		Date.prototype.getWeekNumber = function(){
			var d = new Date(+this);
			d.setHours(0,0,0);
			d.setDate(d.getDate()+1-(d.getDay()||7));
			return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
		};
		
		var query = "graph-domain d_"+date.getDate()
			+" dy_"+date.getDay()
			+" w_"+(date.getWeekNumber())
			+" m_"+(date.getMonth()+1)
			+" y_"+date.getFullYear();
		
		var list = document.getElementsByClassName(query);
		
		for(var p = 0; p < list.length; p++){
			//If the current HTML5 element being examined does not reference back to THIS controller, continue iterating through elements
			if(!(angular.element(list[p]).controller() === caller)){
				continue;
			}
			
			var cells = list[p].getElementsByTagName('g');
			var length = cells.length;

			var inputHour = date.getHours();
			return new timeCell(cells[inputHour], date);
		}
	};
	
var timeCell = function(svg, date){
		var tc = this;
		tc.svg = svg;
		tc.date = date;
		
		tc.getX = function(){
			return angular.element(svg.getElementsByTagName('rect')).attr("x");
		}
		
		tc.getY = function(){
			return angular.element(svg.getElementsByTagName('rect')).attr("y");
		}
		
		tc.getWidth = function(){
			return angular.element(svg.getElementsByTagName('rect')).attr("width");
		}
		
		tc.getHeight = function(){
			return angular.element(svg.getElementsByTagName('rect')).attr("height");
		}
		
		tc.getTitle = function(){
			return svg.getElementsByTagName('title')[0].innerHTML;
		}
		
		tc.setTitle = function(title){
			svg.getElementsByTagName('title')[0].innerHTML = title;
			
			return tc;
		}
		
		tc.getText = function(){
			return svg.getElementsByTagName('text')[0].innerHtml;
		}
		
		tc.setText = function(text){
			svg.getElementsByTagName('text')[0].innerHtml = text;
			
			return tc;
		}
		
		tc.setEvent = function(){
			var g = d3.select(svg);
			
			//remove the image if it is already there
			g.select("image").remove();
			
			g.append("svg:image")
			.attr("xlink:href", "http://localhost:8000/app/usa.png")
			.attr("width", tc.getWidth())
			.attr("height", tc.getHeight())
			.attr("x",tc.getX())
			.attr("y", tc.getY());
		}
	}
	
	_servObj = {
		init : _init,
		calEnd : _calEnd,
		calRange : _calRange,
		getDefaultConfig : _getDefaultConfig,
		getTimeCell : _getTimeCell
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
	vm.dataSource = '/app/data2.json';
	vm.sources = [
		{ 'text':'kWh1', 'source':'/app/data2.json' }
		,{'text':'kWh2', 'source':'/app/data3.json' }
		,{'text':'kWh3', 'source':'/app/data4.json' }
		,{'text':'kWh4', 'source':'/app/data5.json' }
		,{'text':'all', 'source':[
			'/app/data2.json',
			'/app/data3.json',
			'/app/data4.json',
			'/app/data5.json']}
	];
	
	vm.dataObj = {};
	vm.assets = "";
	
	vm.heatmapConfig = vm.getDefaultConfig();
	vm.heatmapConfig.onClick =  function(date, value){	
		console.log('clicking');
		vm.setTimestamp(date.getTime());
		
		$location.url('/zoomHeatmap');			
		$route.reload();
	}
	
	//for testing retrieving an individual time cell in the heatmap.
	vm.grab = function(){
		var max = 30;
		var min = 10;
		
		var selectDate = new Date(vm.heatmapConfig.start.getTime() 
			+ 1000*60*60*24*(Math.random()*(max-min+1)+min) 
			+ 1000*60*60*14);
		
		console.log(vm.getTimeCell(selectDate));
		
		var timeCell = vm.getTimeCell(selectDate);
		
		timeCell.setTitle('An event is here!!!');
		timeCell.setText('!!');
		
		timeCell.setEvent();
		
	}
	
	//for testing multiple controllers inheriting the same service singleton
	vm.change = function(){
		//var max = 30;
		//var min = 10;
		//vm.heatmapConfig.range = Math.floor(Math.random()*(max-min+1)+min);

		var mean = jStat.mean(vm.dataAsArray())*4;
		var std = jStat.stdev(vm.dataAsArray())*4;
		
		vm.heatmapConfig.legend = [
			Math.round(mean - .5 * std), Math.round(mean - .4*std), Math.round(mean - .3*std), Math.round(mean - .2*std), Math.round(mean - .1*std),  Math.round(mean),
			Math.round(mean + .1*std), Math.round(mean + .2*std), Math.round(mean + .3*std), Math.round(mean + .4*std), Math.round(mean + .5*std)
		];
		
		vm.rendered = false;
		
		//In one second, reload the heatmap component with the changed configuration.
		window.setTimeout(function(){
			vm.rendered = true;
			$scope.$apply();
		}, 1000);
	}
	
	//this happens when the heatmaps load... not only when the select is chosen.
	$scope.$watch('heat.dataSource', function(){
		vm.getData().then(function (dataddd){
			vm.heatmapConfig.data = vm.dataObj;
			vm.change();
		});
	});
	
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
