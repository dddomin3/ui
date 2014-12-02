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
	vm.configDashboard = false;
	
	angular.extend(vm, directiveService);
	
	vm.config = function(){
		vm.configDashboard = !vm.configDashboard;
		
	}
	
	vm.classes = function(row, col){
		if(vm.configDashboard){
			return 'col-md-4';
		}
		else if(!vm.components[row][col].tag){
			return 'hidden';
		}
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
	vm.components.push([{},{},{}]);
	
	vm.getComponent = function(row, col){
		return vm.components[row][col];
	};
	
	$scope.$watch('dashboard.getComponent(0,0)', function(newValue, oldValue, scope){
		console.log('change to components');
	}, true);
	
	vm.refresh = function(){
		$scope.$apply();
	};
	
	console.log(directiveService.getComponentMap());
	console.log(vm.components);
}])

.directive('navbar', [ function(){
	return {
		restrict: 'E',
		templateUrl: 'views/navbar.html'
	}
}])

.directive('paletteDashboardComponent', [ '$compile', function($compile){
	return{
		restrict: 'E',
		template: '<img src={{component.paletteImage()}} title={{component.tag()}}>',
		link: function(scope, el, attr){
			//add listener functions to the element.
			
			//add drop listeners to component containers.
			el[0].ondragenter = function(){
				//only select panels in the main body (div page-content-wrapper)
				var panels = document.getElementById('page-content-wrapper').getElementsByTagName('panel-component');
				
				angular.forEach(panels, function(panel, index){					
					angular.element(panel)[0].ondragover= function(e){
						e.preventDefault();
						return false;
					};
										
					angular.element(panel)[0].ondrop= function(event){
						
						var jqElement = angular.element(panel);						
						var controller = jqElement.controller();
						
						var row = +jqElement.attr('row');
						var column = +jqElement.attr('column');
						
						controller.components[row][column] = scope.component;
						
						controller.refresh();
					};
				});
			};
			
			//sometimes dragenter event isnt fired when dragging???
			el[0].ondrag = function(){
				//only select panels in the main body (div page-content-wrapper)
				var panels = document.getElementById('page-content-wrapper').getElementsByTagName('panel-component');
				
				angular.forEach(panels, function(panel, index){					
					angular.element(panel)[0].ondragover= function(e){
						e.preventDefault();
						return false;
					};
										
					angular.element(panel)[0].ondrop= function(event){
						
						var jqElement = angular.element(panel);						
						var controller = jqElement.controller();
						
						var row = +jqElement.attr('row');
						var column = +jqElement.attr('column');
						
						controller.components[row][column] = scope.component;
						
						controller.refresh();
					};
				});
			};
		}
	}
}]);
