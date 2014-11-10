'use strict';
 
angular.module('myApp.heatmap')
 
.controller('heatmapConfigController', ['$scope', '$modal', function($scope, $modal){
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
				
		$scope.open = function(size) {
		
		var modalInstance = $modal.open({
			templateUrl: 'views/heatmapConfig.html',
			controller: 'heatmapConfigInstance',
			size: size,
			scope: $scope.$parent,
				resolve: {
					eventSource : $scope.eventSource,
					dataSource : $scope.dataSource,
					scheduleSelect : $scope.scheduleSelect
				}
			});
		
		}
}])

.controller('heatmapConfigInstance', ['$scope', '$modalInstance', 'eventSource', 'dataSource', 'scheduleSelect', function($scope, $modalInstance, eventSource, dataSource, scheduleSelect) {
	$scope.eventSource = eventSource;
	$scope.dataSource = dataSource;
	
	$scope.ok = function() {
		$modalInstance.close();
	}
	
}]);
