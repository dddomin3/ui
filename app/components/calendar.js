angular.module('myApp.calendar', ['ngRoute'])
.directive('myCalendar', function(){
	return{
		restrict: "E",
		scope:{
			name:"=" // allows the name of the chart to be assigned.  this name is the new scope variable created once a date is selected
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

			$scope.open = function($event) {
				$event.preventDefault();
				$event.stopPropagation();

				if($scope.opened === true){
					$scope.opened = false;
				}
				else {
					$scope.opened = true;
				};
			};

			$scope.log = function(){
				console.log($scope);
			}

			$scope.minDate = null;
			$scope.maxDate = Date.now();

			$scope.dateOptions = {
					formatYear: 'yyyy',
					startingDay: 0,
					showWeeks: false,
			};

			$scope.format = 'yyyy-MM-dd';
		}
	}
})
;