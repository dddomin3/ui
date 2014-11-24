'use strict';
 
angular.module('myApp.panelComponent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/panel', {
    templateUrl: 'views/panel.html'
  });
}])

.factory('directiveService', ['$templateCache', function($templateCache){
	var serviceObject = {};
	var _directiveList = [];
	
	var _addDirectiveByElementTag = function(tag){
		$templateCache.put(tag, "<"+tag+">"+"</"+tag+">");
		_directiveList.push(tag);
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
	directiveService.addDirectiveByElementTag('utility-graph');
		console.log(vm.getDirectiveList());

}]);