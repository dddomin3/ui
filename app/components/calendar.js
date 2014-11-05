angular.module('myApp.calendar',['ui.bootstrap']);
angular.module('myApp.calendar',['ngRoute'])
  .controller('DatepickerDemoCtrl', function  ($scope) {
	  $scope.today = function() {
	    $scope.dt = new Date();
	  };
	  $scope.today();
	
	  $scope.clear = function () {
	    $scope.dt = null;
	  };
	
	  
	

	
	  $scope.open = function($event) {
	    $event.preventDefault();
	    $event.stopPropagation();
	
	    $scope.opened = true;
	    
	    console.log($scope);
	  };
	
	  $scope.dateOptions = {
	    formatYear: 'yy',
	    startingDay: 1
	  };
	
	  $scope.format = 'yyyy-MM-dd';
	})
    .directive('myCalendar', function(){
	  return{
		  restrict: "E",
		  scope:{
		  },
		  templateUrl : "views/calendar.html",
			  
	  }
  })
;