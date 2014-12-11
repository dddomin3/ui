// Angela's code

'use strict';

angular.module('myApp.equipmentTickets', ['ngRoute'])

.factory('assetService', ['$http', function($http) {
    return {
        getAsset: function(){
			// return image: "/app/pictures/assetTypes/" + assetType + ".png";
		},
        
        getEvents: function(facility, assetId){
            var url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
            var query = '{"facility": "' + facility + '", "asset": "'+ assetId + '"}';
            var config = {
                method:'POST',
                headers: {'Collection': 'Event'},
                url:url,
                data:query
            };
            var promise = $http(config);
            return promise.then(function(response) {
                var results = response.data.result;
                var newResults = _.map(results, function(x) { 
                   return { 
                       id: x.eventID,
                       anomaly: x.anomaly,
                       firstAt: x.createdTime,
                       waste: x.waste,
                       potential: x.potentialSaving,
					   lastAt: x.closedTime, //should be updated time, use closed for now
					   quantity: x.waste //should be number of occurrences, needs to be added to DB
		            };
                });
                return newResults;
            }, function() {
				alert('fail to query data');
            });
        }
    };
}]);