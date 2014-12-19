// mongoService.js

'use strict';

angular.module('myApp.equipmentTickets')

.factory('mongoService', ['$http', function($http) {
    return {
		queryDb: function(query, collection){
			var config = {
				method:'POST',
				headers: {'Collection': collection},
				url:"http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send",
				data: angular.toJson(query, false) // false means don't "prettify" the json
			};
			var promise = $http(config);
			return promise.then(function(response) {
				return response.data.result;
			}, function() {
				console.log('fail to query from database');
			});
		}
    };
}]);
