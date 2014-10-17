'use strict';
 
angular.module('myApp.persistView', [])

.factory('persistViewService', [ '$location', '$http', function($location, $http){
	var _servObj;
	var _viewUUID;
	var _viewType;
	
	var _getViewUUID = function(){
		return _viewUUID;
	}
	
	var _setViewUUID = function(uuid){
		_viewUUID = uuid;
		
		return _servObj;
	}
	
	var _getViewType = function(){
		return _viewType;
	}
	
	var _setViewType = function(type){
		_viewType = type;
		
		return _servObj;
	}
	
	//if the current URL is of the format {PATH}?view=uuid a view should exist
	var _isViewPersisted = function(){
		if($location.search().view || _viewUUID){
			return true;
		}
		else{
			return false;
		}
	}
	
	//msgObj is a JSON object which describes all config/services needed to properly render the view.
	var _persistView = function(msgObj){
		//post to database
		$http.post('http://10.239.3.132:8080/'+_getViewType(), msgObj);
	}
	
	_servObj = {
		getViewUUID : _getViewUUID,
		setViewUUID : _setViewUUID,
		getViewType : _getViewType,
		setViewType : _setViewType,
		isViewPersisted : _isViewPersisted,
		persistView : _persistView
	}
	
	return _servObj;
	
}]);