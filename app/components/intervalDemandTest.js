angular.module('myApp.intervalDemandTest', ['ngRoute'])
.controller('intervalDemandTestCtrl', ['$scope', 'intervalDemandDataService',
						function($scope, dataService) {
	$scope.custQuery= "{\"assets\":[{\"asset\":\"AHU2\",\"organization\":\"DEU\"}],\"highDate\":\"Wed Dec 10 2014 11:38:39 GMT-0500 (Eastern Standard Time)\",\"lowDate\":\"Wed Jun 25 2014 11:38:39 GMT-0500 (Eastern Standard Time)\"}";
	$scope.custQuery = JSON.parse($scope.custQuery);
	$scope.custParams = {"height": 300};
	$scope.logScope = function () {
		console.log($scope);
	};
	$scope.custRawData = [
		{
			"eventID": "DEU-0145973",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "Chiller Efficiency Below Expected",
			"status": "Closed",
			"cause": "null",
			"effect": "null",
			"source": "Analytic",
			"returnStatus": "No Feedback Provided",
			"comments": "referred to CARRIER Request has been closed. by Engineers 60w at",
			"createdTime": "Mon Jul 07 19:35:45 EDT 2014",
			"closedTime": "Tue Aug 12 10:16:11 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "55",
			"potentialSaving": "124"
		},
		{
			"eventID": "DEU-0152015",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "Chiller Efficiency Below Expected",
			"status": "Closed",
			"cause": "null",
			"effect": "null",
			"source": "Analytic",
			"returnStatus": "No Feedback Provided",
			"comments": "refer to CARRIER Request has been closed. by Engineers 60w at",
			"createdTime": "Fri Jul 25 14:56:57 EDT 2014",
			"closedTime": "Tue Aug 12 10:17:13 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "32",
			"potentialSaving": "115"
		},
		{
			"eventID": "DEU-0147261",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "Status Not Equal to Command",
			"status": "Closed",
			"cause": "null",
			"effect": "null",
			"source": "Analytic",
			"returnStatus": "Good Feedback",
			"comments": "The fan was found off at the disconnect that day. Engineer and IBC tech was able to put unit in auto to allow the fan to start. Request has been closed. by IBC Albert Yulo at",
			"createdTime": "Sat Jul 12 07:13:42 EDT 2014",
			"closedTime": "Wed Jul 30 14:37:44 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "72.5",
			"potentialSaving": "954.3333333"
		},
		{
			"eventID": "DEU-0158423",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "DAT Below Set Point - Heating Control Logic Failure",
			"status": "Open",
			"cause": "null",
			"effect": "null",
			"source": "Analytic",
			"returnStatus": "null",
			"comments": "null",
			"createdTime": "Thu Aug 14 21:32:57 EDT 2014",
			"closedTime": "null",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "55",
			"potentialSaving": "830.5619048"
		},
		{
			"eventID": "DEU-0159345",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "DAT Above Set Point - Cooling Control Logic Failure",
			"status": "Closed",
			"cause": "null",
			"effect": "null",
			"source": "Analytic",
			"returnStatus": "Good Feedback",
			"comments": "Made changes to the damper program to assist in reaching setpoint faster. Request has been closed. by  IBC Albert Yulo at",
			"createdTime": "Mon Aug 18 05:01:09 EDT 2014",
			"closedTime": "Mon Aug 18 14:23:22 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "21.5",
			"potentialSaving": "169"
		},
		{
			"eventID": "DEU-0179547",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "DAT Below Set Point - Heating Control Logic Failure",
			"status": "Closed",
			"cause": "null",
			"effect": "NoBackground",
			"source": "Analytic",
			"returnStatus": "Good Feedback",
			"comments": "tighten deadband in CO to allow tighter control. Request has been closed. by IBC Albert Yulo at",
			"createdTime": "Sat Oct 11 09:05:24 EDT 2014",
			"closedTime": "Mon Oct 13 13:13:26 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "11",
			"potentialSaving": "885.9333333"
		},
		{
			"eventID": "DEU-0177303",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "Set Point Deviation",
			"status": "Closed",
			"cause": "null",
			"effect": "NoBackground",
			"source": "Analytic",
			"returnStatus": "Good Feedback",
			"comments": "Found points in override. Request has been closed. by IBC Albert Yulo at",
			"createdTime": "Sun Oct 05 03:40:15 EDT 2014",
			"closedTime": "Mon Oct 13 13:46:27 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "11",
			"potentialSaving": "882.6761905"
		},
		{
			"eventID": "DEU-0169963",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "Status Not Equal to Command",
			"status": "Closed",
			"cause": "null",
			"effect": "NoBackground",
			"source": "Analytic",
			"returnStatus": "Good Feedback",
			"comments": "Found unit OFF at motor starter.  Placed to auto and checked operation. Request has been closed. by IBC Albert Yulo at",
			"createdTime": "Sat Sep 13 01:25:10 EDT 2014",
			"closedTime": "Wed Sep 24 08:16:04 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "11",
			"potentialSaving": "872.9047619"
		},
		{
			"eventID": "DEU-0173235",
			"facility": "60 Wall Street",
			"asset": "AHU3",
			"anomaly": "Status Not Equal to Command",
			"status": "Closed",
			"cause": "null",
			"effect": "NoBackground",
			"source": "Analytic",
			"returnStatus": "Good Feedback",
			"comments": "Duplicate Ticket Request has been closed. by IBC Albert Yulo at",
			"createdTime": "Mon Sep 22 19:18:07 EDT 2014",
			"closedTime": "Fri Sep 26 09:18:41 EDT 2014",
			"stationName": "WLST",
			"organization": "DEU",
			"pointUsed": [
				"DAT",
				"MAT",
				"ST"
			],
			"waste": "11",
			"potentialSaving": "869.647619"
		}
	];
	
}]);