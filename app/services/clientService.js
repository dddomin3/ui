'use strict';

angular.module('myApp.equipmentTickets')

.factory('clientService', ['mongoService', function(mongoService) {
    return {
		getClientList: function(){
			var promise = mongoService.queryDb({}, "Facility");
            return promise.then(function(results) {
                var clientList = _.map(results, function(x) {
                	return x.clientName;
                });
                return _.uniq(clientList);
            }, function() {
				console.log('fail to query client list from database');
            });
		},
		
		getFacilityList: function(clientName){
			var promise = mongoService.queryDb({"clientName": clientName}, "Facility");
            return promise.then(function(results) {
                var facilityList = _.map(results, function(x) {
                	return x.projectName;
                });
                return facilityList;
            }, function() {
				console.log('fail to query facility list from database');
            });
		},
		
		
		getAssetList: function(clientName, facilityName){
			var promise = mongoService.queryDb({"clientName": clientName, "projectName": facilityName}, "Facility");
            return promise.then(function(results) {
            	var result = results[0];
                var assetLists = _.map(result.asset, function(k, v) {return k});
                var assetList = _.flatten(assetLists);
                return assetList;
                
                
                /* this is the same thing:
                return _(result) // notice no .
                	.map(function(k, v) { return v; })
                	.flatten()
                	.value();
					*/
            }, function() {
				console.log('fail to query asset list from database');
            });
		},
    };
}]);