'use strict';
 
angular.module('myApp.dashboard', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'views/dashboard.html'
  });
}])

.factory('directiveService', ['$templateCache', function($templateCache){
	var serviceObject = {};
	var _directiveList = [];
	var _componentList = [];
	var _componentMap = {};
	
	var _addDirectiveByElementTag = function(tag){
		if(!$templateCache.get(tag)){
			$templateCache.put(tag, "<"+tag+">"+"</"+tag+">");
			_directiveList.push(tag);
		}
	};
	
	var _addFullComponent = function(componentObject){
		if(!$templateCache.get(componentObject.tag())){
			$templateCache.put(componentObject.tag(), "<"+componentObject.tag()+">"+"</"+componentObject.tag()+">");
			
			$templateCache.put(componentObject.configTag(), "<"+componentObject.configTag()+">"+"</"+componentObject.configTag()+">");
			
			_componentList.push(componentObject);
			_componentMap[componentObject.tag()] = componentObject;
		}
	};
	
	var _getDirectiveList = function(){
		return _directiveList;
	};
	
	var _getComponentList = function(){
		return _componentList;
	};
	
	var _getComponentMap = function(){
		return _componentMap;
	};
	
	var _getCache = function(){
		return $templateCache;
	}
	
	serviceObject = {
		addDirectiveByElementTag : _addDirectiveByElementTag,
		getDirectiveList : _getDirectiveList,
		addFullComponent : _addFullComponent,
		getComponentList : _getComponentList,
		getComponentMap: _getComponentMap,
		getCache : _getCache
	}
	
	return serviceObject;
}])

.controller('dashboardController', [ '$scope', 'directiveService', function($scope, directiveService){
	var vm = this;
	
	vm.classes = function(row, col){
		if(!vm.components[row][col].tag){return 'hidden';}
		else{
			switch(col) {
				case 0:
					if(!vm.components[row][1].tag && !vm.components[row][2].tag){
						return 'col-md-12';
					}
					else if(vm.components[row][1].tag){
						return 'col-md-4';
					}
					else{
						return 'col-md-8';
					}
				case 1:
					if(!vm.components[row][0].tag && !vm.components[row][1].tag){
						return 'col-md-12';
					}
					else if(vm.components[row][0].tag && vm.components[row][2].tag){
						return 'col-md-4';
					}
					else{
						return 'col-md-8';
					}
				case 2:
					if(!vm.components[row][0].tag && !vm.components[row][1].tag){
						return 'col-md-12';
					}
					//TODO - make an option for 'right alignment' where the rightmost column is width 8 when middle is missing.
					else{
						return 'col-md-4';
					}
			}
		}
	};
	
	vm.components = [];
	vm.components.push([{},{},directiveService.getComponentMap()['energy-spectrum']]);
	vm.components.push([{},{},{}]);
	vm.components.push([{},directiveService.getComponentMap()['energy-spectrum'],directiveService.getComponentMap()['energy-spectrum']]);
	
	$scope.$watch('dashboard.components', function(newValue, oldValue, scope){
	
	});
	
	console.log(directiveService.getComponentMap());
	console.log(vm.components);
}])

.directive('navbar', [ function(){
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'views/navbar.html'
	}
}]);
