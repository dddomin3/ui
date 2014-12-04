'use strict';
 
angular.module('myApp.heatmap')
 
.controller('heatmapConfigController', ['$scope', '$modal', function($scope, $modal){	
		$scope.open = function(size) {
		
		var modalInstance = $modal.open({
			templateUrl: 'views/heatmapConfig.html',
			controller: 'heatmapConfigInstance',
			size: size,
			scope: $scope
			});
		};
}])

.directive('heatmapConfig', [ function() {
	return {
		restrict: 'E',
		heat: '=heat',
		controller: 'heatmapConfigController as config',
		templateUrl : 'views/configButton.html'
	}
}])

.controller('heatmapConfigInstance', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.ok = function() {
		$modalInstance.close();
	};
	
	$scope.domainOpts = [
		//{domain: 'hour'}, 
		{domain: 'day'}//, {domain: 'week'}, {domain: 'month'}, {domain: 'year'}
	];
	
	$scope.subDomainOpts = [
		//{domain: 'min'}, 
		{domain: 'hour'}//, {domain: 'day'}, {domain: 'week'}, {domain: 'month'}
	];
	
	$scope.cal = function($event){
		$event.preventDefault();
		$event.stopPropagation();
		
		$scope.opened = true;
	};
	
	//dummy data for events - should be a service function to get events of a certain type 
	$scope.events = [
		{ 'text':'eventSet1', 'source': 
			[{'type': 'OutOfOccupancy', 'time': 1401957900000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1401957900000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1404468000000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1404468000000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1407351600000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407351600000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1407513600000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407513600000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1407617100000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407617100000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1407718800000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407718800000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1407718800000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407718800000+60*24*60*60*1000)+'!'}
			]
		},
		{ 'text':'eventSet2', 'source': 
			[{'type': 'DatDeviation', 'time': 1401957900000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at '
				+new Date(1401957900000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1404468000000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at  '
				+new Date(1404468000000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407351600000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at  '
				+new Date(1407351600000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407513600000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at  '
				+new Date(1407513600000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407617100000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at  '
				+new Date(1407617100000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407718800000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at  '
				+new Date(1407718800000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407718800000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at  '
				+new Date(1407718800000+60*24*60*60*1000)+'!'}
			]
		},
		{ 'text':'eventSet3', 'source': 
			[{'type': 'OutOfOccupancy', 'time': 1402057900000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1402057900000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1404568000000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at '
				+new Date(1404568000000+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407351600000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at '
				+new Date(1480351600000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1408013600000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407513600000+60*24*60*60*1000)+'!'},
			{'type': 'OutOfOccupancy', 'time': 1407617100000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407617100000)+'!'},
			{'type': 'DatDeviation', 'time': 1407617100000+60*24*60*60*1000, 'description': 'The unit was greater than setpoint at '
				+new Date(1407718800+60*24*60*60*1000)+'!'},
			{'type': 'DatDeviation', 'time': 1407718800000+60*24*60*60*1000, 'description': 'The unit was running out of occupancy at '
				+new Date(1407718800000+60*24*60*60*1000)+'!'}
			]
		}
	];
	
	//dummy data for sources; should be a service function to get potential sources for the widget.
	$scope.sources = [
		{ 'text':'kWh1', 'source':'/app/data2.json' }
		,{'text':'kWh2', 'source':'/app/data3.json' }
		,{'text':'kWh3', 'source':'/app/data4.json' }
		,{'text':'kWh4', 'source':'/app/data5.json' }
		,{'text':'all', 'source':[
			'/app/data2.json',
			'/app/data3.json',
			'/app/data4.json',
			'/app/data5.json']}
	];
	
}]);
