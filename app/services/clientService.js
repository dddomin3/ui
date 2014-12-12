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
				alert('fail to query client list from database');
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
				alert('fail to query facility list from database');
            });
		},
		
		
		getAssetList: function(clientName, facilityName){
			var promise = mongoService.queryDb({"clientName": clientName, "projectName": facilityName}, "Facility");
            return promise.then(function(results) {
                var assetList = _.map(results, function(x) {
                	return x.oCNumber; //how on earth do i deal with the array?!
                });
                return assetList;
            }, function() {
				alert('fail to query asset list from database');
            });
		},
    };
}]);