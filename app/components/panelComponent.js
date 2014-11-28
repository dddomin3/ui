'use strict';
 
angular.module('myApp.panelComponent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/panel', {
    templateUrl: 'views/panel.html'
  });
}])

.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'utility-graph';},
		tagHtml: function(){return "<utility-graph></utility-graph>";},
		directiveName: function(){return 'utilityGraph';},
		namespace: function(){return 'utility';},
		}
	);
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
		if(!$templateCache.get(componentObject.tag())){
			$templateCache.put(componentObject.tag(), "<"+componentObject.tag()+">"+"</"+componentObject.tag()+">");
			_componentList.push(componentObject);
		}
	};
	
	var _getDirectiveList = function(){
		return _directiveList;
	};
	
	var _getComponentList = function(){
		return _componentList;
	};
	
	var _getCache = function(){
		return $templateCache;
	}
	
	serviceObject = {
		addDirectiveByElementTag : _addDirectiveByElementTag,
		getDirectiveList : _getDirectiveList,
		addFullComponent : _addFullComponent,
		getComponentList : _getComponentList,
		getCache : _getCache
	}
	
	return serviceObject;
}])

.controller('panelController', [ 'directiveService', '$scope', function(directiveService, $scope){
	var vm = this;
	
	vm.bodyDirective = {
		tag: function(){return 'utility-graph';},
		tagHtml: function(){return "<utility-graph></utility-graph>";},
		directiveName: function(){return 'utilityGraph';},
		namespace: function(){return 'utility';},
	};
	angular.extend(vm, directiveService);
	
	//currently watching the namespace? Creates a dependency on the controller for the panel contents being namespaced....
	$scope.$watch('component.bodyDirective.namespace', function(newValue, oldValue, scope){
		
		//new value is not yet compiled into HTML....
		window.setTimeout(function(){
			var componentDirectives = document.getElementsByTagName(vm.bodyDirective.tag());
			
			for(var i = 0; i < componentDirectives.length; i++){
				console.log(angular.element(componentDirectives[i]).controller(vm.bodyDirective.directiveName()));
					//check if the component being examined has the same controller as THIS panelComponent controller (i.e. that the current component is the contents of this panel)
				if(angular.element(componentDirectives[i].parentNode).controller() === vm){
					
					//delete the reference to the "old" controller (indexed by namespace) and add a reference to the "new" controller
					if(!scope[newValue()]){
						scope[newValue()] = angular.element(componentDirectives[i]).controller(vm.bodyDirective.directiveName());
					}
				
					if(newValue != oldValue){
						delete scope[oldValue()];
					}
					
					//should only be one "content" of the panel... after we have found it, return.
					return;
				}
			}		
		}, 100);
	});
}]);