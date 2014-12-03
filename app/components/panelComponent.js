'use strict';
 
angular.module('myApp.panelComponent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/panel', {
    template: '<panel-component></panel-component>'
  });
}])

.run(['directiveService', function(directiveService){
	directiveService.addSideBarComponent({
		tag: function(){return 'empty-row';},
		configTag: function(){return '';},
		tagHtml: function(){return "<empty-row><empty-row>";},
		directiveName: function(){return 'emptyRow';},
		namespace: function(){return 'empty'},
		paletteImage: function(){return 'redx.png';}
		});
	
	directiveService.addTopBarComponent({
		tag: function(){return 'empty-col';},
		configTag: function(){return '';},
		tagHtml: function(){return "<empty-col><empty-col>";},
		directiveName: function(){return 'emptycol';},
		namespace: function(){return 'empty'},
		paletteImage: function(){return 'redx.png';}
		});
		
	directiveService.addFullComponent({
		tag: function(){return 'empty-panel';},
		configTag: function(){return '';},
		tagHtml: function(){return "<empty-panel><empty-panel>";},
		directiveName: function(){return 'emptyPanel';},
		namespace: function(){return 'empty'},
		paletteImage: function(){return 'redx.png';}
		});
		
	//this needs to go away and a more generic button (or reuse of angular js button directive used)
	directiveService.addTopBarComponent({
		tag: function(){return 'a-very-specific-button';},
		configTag: function(){return '';},
		tagHtml: function(){return "<a-very-specific-button><a-very-specific-button>";},
		directiveName: function(){return 'aVerySpecificButton';},
		namespace: function(){return 'button'},
		paletteImage: function(){return 'devconfig.png';}
		});
	}
])

.controller('panelController', [ 'directiveService', '$scope', '$sce', function(directiveService, $scope, $sce){
	var vm = this;
	
	vm.bodyDirective = {

	};
	angular.extend(vm, directiveService);
	console.log(vm.getTopBarMap());
	
	/*
	//currently watching the namespace? Creates a dependency on the controller for the panel contents being namespaced....
	$scope.$watch('component.bodyDirective.namespace', function(newValue, oldValue, scope){
		if(!vm.bodyDirective.tag){
			console.log('.....');
			return;
		}

		//new value is not yet compiled into HTML....
		window.setTimeout(function(){
			var componentDirectives = document.getElementsByTagName(vm.bodyDirective.tag());
			console.log(componentDirectives);
			
			for(var i = 0; i < componentDirectives.length; i++){
					//check if the component being examined has the same controller as THIS panelComponent controller (i.e. that the current component is the contents of this panel)
				if(angular.element(componentDirectives[i].parentNode).controller('panelComponent') === vm){
					
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
	*/
	
		//for testing popout using angular-ui modal
	vm.getWidgetHtml = function(){
		var panelBodies = document.getElementsByClassName('panel-body');
		for(var i = 0; i < panelBodies.length; i++){
			
			//once we found the panel body whose controller matches THIS panel controller, return the HTML contents.
			if(angular.element(panelBodies[i]).controller('panelComponent') === vm){
				
				/* scaling contents up for full screen....
				var scaledCopy = angular.element(panelBodies[i]).clone().find('svg');
				scaledCopy.attr('width','1500').attr('height','2000');
				
				angular.element(scaledCopy[0].firstChild).attr('transform','scale(1.6,1.9)');
				
				//only return the panel-body, not the panel header (which contains config and + buttons
				return $sce.trustAsHtml(scaledCopy[0].outerHTML);
				*/
				
				return $sce.trustAsHtml(angular.element(panelBodies[i])[0].outerHTML);
			}
		}		
	};
}])

.directive('panelComponent', [ function(){
	return {
		restrict: 'E',
		scope: {
			bodyDirective: '=directive',
			dashboard: '=dashboard'
		},
		controller: 'panelController as component',
		templateUrl: 'views/panel.html',
		link: function(scope, el, attr){
			scope.component.bodyDirective = scope.bodyDirective;
		}
	}
}])

.directive('emptyPanel', [ function() {
	return {
		restrict: 'E',
		template : '<div ng-if="dashboard.editMainView" ng-class="dashboard.editMainViewClass()" style="margin:10px; height:50px; border-style:dotted;">Drop a Dashboard Component!</div></div>'
	}
}])

.directive('emptyRow', [ function() {
	return {
		restrict: 'E',
		template : '<div class="row"><div ng-if="dashboard.editSidebar" ng-class="dashboard.editSidebarClass()" style="margin:10px; height:50px; border-style:dotted;">Drop a Sidebar Component!</div></div>'
	}
}])

.directive('emptyCol', [ function() {
	return {
		restrict: 'E',
		template : '<div ng-if="dashboard.editTopbar" ng-class="dashboard.editTopbarClass()" style="margin:10px; height:50px;"></div>'
	}
}])

.directive('topbarComponent', [ function(){
	return {
		restrict: 'E',
		scope: {
			bodyDirective: '=directive',
			dashboard: '=dashboard'
		},
		template: '<div class="col-md-1"><div ng-include="bodyDirective.tag()"></div></div>',
	}
}])

.directive('sidebarComponent', [ function(){
	return {
		restrict: 'E',
		scope: {
			bodyDirective: '=directive',
			dashboard: '=dashboard'
		},
		template: '<div ng-include="bodyDirective.tag()"></div>',
	}
}])

.directive('aVerySpecificButton', [ function(){
	return {
		restrict: 'E',
		template: '<button class="btn btn-default" ng-click="dashboard.config()"><img src="config.png"/></button>'
	}
}]);