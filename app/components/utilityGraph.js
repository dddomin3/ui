'use strict';
 
angular.module('myApp.utilityGraph', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/utilityGraph', {
    template: '<utility-graph></utility-graph>'
  });
}])

.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'utility-graph';},
		configTag: function(){return 'utility-graph-config';},
		tagHtml: function(){return "<utility-graph></utility-graph>";},
		directiveName: function(){return 'utilityGraph';},
		namespace: function(){return 'utility';},
		paletteImage: function(){return 'hotcool.png';}
		}
	);
}])

.factory('utilityGraphDataService', ['$http', function($http){
	var serviceObject = {};
	
	var _query = {
		name: "kWh2"
	};
	
	var _getData = function(){
		
		return $http.post('http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send', JSON.stringify(_query));
	};
	
	serviceObject = {
		getData : _getData
	}
	
	return serviceObject;
}])

.controller('utilityGraphController', ['utilityGraphDataService', function(utilityGraphDataService){
	var vm = this;
	
	vm.rendered = true;
	vm.data = [];

	utilityGraphDataService.getData().success(function(data){
		//Iterate through the result[] array
		angular.forEach(data.result, function(value, key){
			//In each result.his, iterate through all objects
			angular.forEach(data.result[key].his, function(val, kee){
				//Need to make the string a number....
				val.value=+val.value;
				
				vm.data.push(val);
			});
			
		});
	})

	//after data is loaded, this callback assigns the dimension and group.
	.finally(function(){
		
		vm.utilityDimension = crossfilter(vm.data).dimension(function(d){
			return d3.time.month(new Date(d.timestamp));
		});
		vm.utilityGroup = vm.utilityDimension.group().reduceSum(function(d){
			return d.value;
		})
	});
	
	vm.doSomething = function(){
		var divs = angular.element(vm.html).find('div');
		var removed = false;
		var removedBody;
		
		angular.forEach(divs, function(value, key){
			if(angular.element(value).hasClass('dc-chart')){
				
				if(removed){
					var g= angular.element(value.getElementsByTagName('svg')[0])[0].children[0];
					var gJquery = angular.element(g);
					gJquery.append(removedBody);
					
					return;	
				}
				
				var dcChart = angular.element(value);
				
				var chartBody = angular.element(dcChart[0].getElementsByClassName('chart-body')[0]);
				removedBody = chartBody.clone();
				chartBody.remove();
				
				console.log('I removed a y chart body!');
				console.log(dcChart[0]);
				
				removed=true;
			}
		});
	}
	
}])

.controller('utilityConfigController', [ function(){
}])

.directive('utilityGraph', [function() {
	return {
		restrict: 'E',
		controller: 'utilityGraphController as utility',
		templateUrl: 'views/utilityGraph.html',
		link: function(scope, el, attr){
			scope.$parent.utility = scope.utility;
			scope.utility.html = el[0];
		}
	}
}])

.directive('utilityGraphConfig', [function() {
	return {
		restrict: 'E',
		utility: '=utility',
		controller: 'utilityConfigController as config',
		templateUrl: 'views/configButton.html'
	}
}])
