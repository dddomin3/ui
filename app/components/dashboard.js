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
	var _sidebarMap = {};
	var _topbarMap = {};
	
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
	
	var _addSideBarComponent = function(componentObject){
			$templateCache.put(componentObject.tag(), "<"+componentObject.tag()+">"+"</"+componentObject.tag()+">");
			
			$templateCache.put(componentObject.configTag(), "<"+componentObject.configTag()+">"+"</"+componentObject.configTag()+">");
			
			_sidebarMap[componentObject.tag()] = componentObject;
	};
	
	var _addTopBarComponent = function(componentObject){
			$templateCache.put(componentObject.tag(), "<"+componentObject.tag()+">"+"</"+componentObject.tag()+">");
			
			$templateCache.put(componentObject.configTag(), "<"+componentObject.configTag()+">"+"</"+componentObject.configTag()+">");
			
			_topbarMap[componentObject.tag()] = componentObject;
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
	
	var _getSideBarMap = function(){
		return _sidebarMap;
	};
	
	var _getTopBarMap = function(){
		return _topbarMap;
	};
	
	var _getCache = function(){
		return $templateCache;
	}
	
	serviceObject = {
		addDirectiveByElementTag : _addDirectiveByElementTag,
		getDirectiveList : _getDirectiveList,
		addFullComponent : _addFullComponent,
		addSideBarComponent: _addSideBarComponent,
		addTopBarComponent: _addTopBarComponent,
		getComponentList : _getComponentList,
		getComponentMap: _getComponentMap,
		getSideBarMap: _getSideBarMap,
		getTopBarMap: _getTopBarMap,
		getCache : _getCache
	}
	
	return serviceObject;
}])

.controller('dashboardController', [ '$scope', 'directiveService', function($scope, directiveService){
	var vm = this;
	vm.editSidebar = false;
	vm.editTopbar = false;
	vm.editMainView = false;
	vm.configDashboard = false;

	angular.extend(vm, directiveService);
	
	vm.divWrapper = function(){
		if(vm.configDashboard){
			return 'wrapper';
		}
		else return 'wrapper-no-right-padding';
	}
	
	vm.editTopbarClass = function(){
		if(vm.editTopbar){
			return 'alert alert-success';
		}
		else return 'alert alert-danger';
	};
	
	vm.editSidebarClass = function(){
		if(vm.editSidebar){
			return 'alert alert-success';
		}
		else return 'alert alert-danger';
	};
	
	vm.editMainViewClass = function(){
		if(vm.editMainView){
			return 'alert alert-success';
		}
		else return 'alert alert-danger';
	};
	
	vm.rightBarClass = function(){
		if(vm.configDashboard){
			return 'nav nav-sidebar';
		}
		else return 'hidden';
	}
	
	vm.config = function(){
		vm.configDashboard = !vm.configDashboard;
	}
	
	vm.getComponent = function(row, col){
		return vm.components[row][col];
	};

	vm.refresh = function(){
		$scope.$apply();
	};
	
	vm.isEmptyPanel = function(row, col){
		return !vm.components[row][col].tag || (vm.components[row][col].tag() == 'empty-panel');
	}
	
	vm.classes = function(row, col){
		if(vm.configDashboard){
			return 'col-md-4';
		}
		else if(vm.isEmptyPanel(row, col)){
			return 'hidden';
		}
		else{
			switch(col) {
				case 0:
					if(vm.isEmptyPanel(row, 1) && vm.isEmptyPanel(row, 2)){
						return 'col-md-12';
					}
					else if(!vm.isEmptyPanel(row, 1)){
						return 'col-md-4';
					}
					else{
						return 'col-md-8';
					}
				case 1:
					if(vm.isEmptyPanel(row, 0) && vm.isEmptyPanel(row, 2)){
						return 'col-md-12';
					}
					else if(!vm.isEmptyPanel(row, 0) && !vm.isEmptyPanel(row, 2)){
						return 'col-md-4';
					}
					else{
						return 'col-md-8';
					}
				case 2:
					if(vm.isEmptyPanel(row, 0) && vm.isEmptyPanel(row, 1)){
						return 'col-md-12';
					}
					//TODO - make an option for 'right alignment' where the rightmost column is width 8 when middle is missing.
					else{
						return 'col-md-4';
					}
			}
		}
	};
	
	vm.getSidebar = function(){
		return vm.sidebar;
	};
	
	vm.getTopbar = function(){
		return vm.topbar;
	};
	
	vm.sidebar = [];
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	vm.sidebar.push(vm.getSideBarMap()['empty-row']);
	
	vm.topbar = [];
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['empty-col']);
	vm.topbar.push(vm.getTopBarMap()['a-very-specific-button']);

	vm.components = [];
	vm.components.push([directiveService.getComponentMap()['empty-panel'],directiveService.getComponentMap()['empty-panel'],directiveService.getComponentMap()['empty-panel']]);
	vm.components.push([directiveService.getComponentMap()['empty-panel'],directiveService.getComponentMap()['empty-panel'],directiveService.getComponentMap()['empty-panel']]);
	vm.components.push([directiveService.getComponentMap()['empty-panel'],directiveService.getComponentMap()['empty-panel'],directiveService.getComponentMap()['empty-panel']]);
	
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
			
			/* should be the same as below, but sometimes doesnt fire event....
			el[0].ondragenter = function(){

			};
			*/
			
			el[0].ondragend = function(){
				var panels = document.getElementById('page-content-wrapper').getElementsByTagName('panel-component');
				
				if(angular.element(panels).controller().editMainView){
					
					var controller = angular.element(panels).controller();
					controller.editMainView=false;
					controller.refresh();
					
					//remove listeners
					angular.forEach(panels, function(panel, index){
						angular.element(panel)[0].ondragover = null;
						angular.element(panel)[0].ondrop = null;					
			
					});
				};
			};
			
			el[0].ondrag = function(){
				//only select panels in the main body (div page-content-wrapper)
				var panels = document.getElementById('page-content-wrapper').getElementsByTagName('panel-component');
				
				if(!angular.element(panels).controller().editMainView){
					var controller = angular.element(panels).controller();

					controller.editMainView=true;
					controller.refresh();
					
					angular.forEach(panels, function(panel, index){
						var jqElement = angular.element(panel);						

						jqElement[0].ondragover= function(e){
							e.preventDefault();
							return false;
						};
											
						jqElement[0].ondrop= function(event){
														
							var row = +jqElement.attr('row');
							var column = +jqElement.attr('column');
							
							controller.components[row][column] = scope.component;
							
							controller.editMainView = false;
							controller.refresh();
						};
					});
				}
			};
		}
	}
}])

.directive('paletteSidebarComponent', [ '$compile', function($compile){
	return{
		restrict: 'E',
		template: '<img src={{component.paletteImage()}} title={{component.tag()}}>',
		link: function(scope, el, attr){
			//add listener functions to the element.
			
			//add drop listeners to component containers.
			
			/* should be the same as below, but sometimes doesnt fire event....
			el[0].ondragenter = function(){

			};
			*/
			
			el[0].ondragend = function(){
				var panels = document.getElementById('sidebar-wrapper').getElementsByTagName('sidebar-component');
				
				if(angular.element(panels).controller().editSidebar){
					
					var controller = angular.element(panels).controller();
					controller.editSidebar=false;
					controller.refresh();
					
					//remove listeners
					angular.forEach(panels, function(panel, index){
						angular.element(panel)[0].ondragover = null;
						angular.element(panel)[0].ondrop = null;					
			
					});
				};
			};
			
			//sometimes dragenter event isnt fired when dragging???
			el[0].ondrag = function(){
				//only select panels in the main body (div page-content-wrapper)
				var panels = document.getElementById('sidebar-wrapper').getElementsByTagName('sidebar-component');
								
				if(!angular.element(panels).controller().editSidebar){
					var controller = angular.element(panels).controller();

					controller.editSidebar=true;
					controller.refresh();
				
					angular.forEach(panels, function(panel, index){
						var jqElement = angular.element(panel);						
							
						jqElement[0].ondragover= function(e){
							e.preventDefault();
							return false;
						};
											
						jqElement[0].ondrop= function(event){
							
							var index= +jqElement.attr('index');
							
							controller.sidebar[index] = scope.component;
							
							controller.editSidebar=false;
							controller.refresh();
							//remove listeners
							angular.forEach(panels, function(panel, index){
								angular.element(panel)[0].ondragover = null;
								angular.element(panel)[0].ondrop = null;					
					
							});
						};
					});
				}
			};
		}
	}
}])

.directive('paletteTopbarComponent', [ '$compile', function($compile){
	return{
		restrict: 'E',
		template: '<img src={{component.paletteImage()}} title={{component.tag()}}>',
		link: function(scope, el, attr){
			//add listener functions to the element.
			
						//add drop listeners to component containers.
			
			/* should be the same as below, but sometimes doesnt fire event....
			el[0].ondragenter = function(){

			};
			*/
			
			el[0].ondragend = function(){
				var panels = document.getElementsByTagName('navbar')[0].getElementsByTagName('topbar-component');
				
				if(angular.element(panels).controller().editTopbar){
					
					var controller = angular.element(panels).controller();
					controller.editTopbar=false;
					controller.refresh();
					
					//remove listeners
					angular.forEach(panels, function(panel, index){
						angular.element(panel)[0].ondragover = null;
						angular.element(panel)[0].ondrop = null;					
			
					});
				};
			};
			
			
			el[0].ondrag = function(){
				//only select panels in the main body (div page-content-wrapper)
				var panels = document.getElementsByTagName('navbar')[0].getElementsByTagName('topbar-component');
				
				if(!angular.element(panels).controller().editTopbar){
					var controller = angular.element(panels).controller();

					controller.editTopbar=true;
					controller.refresh();
				
					angular.forEach(panels, function(panel, index){
						var jqElement = angular.element(panel);						
							
						jqElement[0].ondragover= function(e){
							e.preventDefault();
							return false;
						};
											
						jqElement[0].ondrop= function(event){
							
							var index= +jqElement.attr('index');
							
							controller.topbar[index] = scope.component;
							
							controller.editTopbar = false;
							controller.refresh();
							
							//remove listeners
							angular.forEach(panels, function(panel, index){
								angular.element(panel)[0].ondragover = null;
								angular.element(panel)[0].ondrop = null;					
					
							});
						};
					});
				}
			};
		}
	}
}]);
