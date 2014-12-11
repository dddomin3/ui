// Angela's code

'use strict';

angular.module('myApp.equipmentTickets', ['ngRoute'])

.factory('assetService', ['$http', function($http) {
    return {
	
		getAsset: function(facility, assetId){
			var url  = "http://10.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/send";
			var query = '{"projectName": "' + facility + '"}';
			var config = {
				method:'POST',
				headers: {'Collection': 'Facility'},
				url:url,
				data:query
			};
			var promise = $http(config);
			return promise.then(function(response) {
				var results = response.data.result;
				// given a record with "asset": {"ahus":["AHU1", ...], "otherThings":["ABC1", ...], ...}
				// and given the assetId "AHU1",
				// find "ahus"
				var assets = results[0].asset; // assets is a dictionary; we need to find the matching kvp
				var assetPairs = _.pairs(assets); // assetPairs is an array of pairs of keys and values
				var assetPair = _.find(assetPairs, function(kvp) { return _.contains(kvp[1], assetId) }); // get the matching pair
				var assetTypePlural = assetPair[0]; // choose the key from the pair
				var assetType = assetTypePlural.substring(0, assetTypePlural.length-1); //remove the 's' from the end
				return {"id": assetId, "type": assetType, "location": "Building 4 Roof"}; //need a location in the database still!
			}, function() {
				alert('fail to query asset data from database');
			});
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
				alert('fail to query event data from database');
            });
        }
    };
}]);