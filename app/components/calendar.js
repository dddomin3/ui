angular.module('myApp.calendar',['ui.bootstrap']);
angular.module('myApp.calendar',['ngRoute'])
  
    .directive('myCalendar', function(){
	  return{
		  restrict: "E",
		  scope:{
			  name:"="
		  },
		  templateUrl : "views/calendar.html",
		  controller: function  ($scope) {
			  $scope.today = function() {
				    $scope.dt = new Date();
				  };
				  $scope.today();
				
				  $scope.clear = function () {
				    $scope.dt = null;
				  };
				
				  $scope.log = function() {
					  console.log($scope);
				  };
				  $scope.log();
				  
				  $scope.open = function($event) {
						  
				    $event.preventDefault();
				    $event.stopPropagation();
				
				    $scope.opened = true;
				  };
				
				  $scope.dateOptions = {
				    formatYear: 'yyyy',
				    startingDay: 0
				  };
				
				  $scope.format = 'yyyy-MM-dd';
				}
	  }
  })
;