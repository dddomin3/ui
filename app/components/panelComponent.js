'use strict';
 
angular.module('myApp.panelComponent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/panel', {
    templateUrl: 'views/panel.html'
  });
}])

.run(['directiveService', function(directiveService){
	//directiveService.addFullComponent({
		//tag: 'utility-graph',
		//controller: 'utilityGraphController',
		//configController: 'utilityConfigController'}
	//);
}])

.factory('directiveService', ['$templateCache', function($templateCache){
	var serviceObject = {};
	var _directiveList = [];
	var _componentList = [];
	
	var _addDirectiveByElementTag = function(tag){
		if(!$templateCache.get(tag)){
			$templateCache.put(tag, "<"+tag+">"+"</"+tag+">");
			_directiveList.push(tag);
		}
	};
	
	/*Format for component object:
	{
		tag : "my-component-directives-element-tag"
		controller : "myComponentsController"
		configController : "myComponentsConfigController"
	}
	*/
	var _addFullComponent = function(componentObject){
		if(!$templateCache.get(componentObject.tag)){
			$templateCache.put(componentObject.tag, "<"+componentObject.tag+">"+"</"+componentObject.tag+">");
			_componentList.push(componentObject);
		}
	};
	
	var _getDirectiveList = function(){
		return _directiveList;
	};
	
	var _getCache = function(){
		return $templateCache;
	}
	
	serviceObject = {
		addDirectiveByElementTag : _addDirectiveByElementTag,
		getDirectiveList : _getDirectiveList,
		getCache : _getCache
	}
	
	return serviceObject;
}])

.controller('panelController', [ 'directiveService', function(directiveService){
	var vm = this;
	angular.extend(vm, directiveService);
	console.log(vm);
	console.log(vm.getDirectiveList());

}]);