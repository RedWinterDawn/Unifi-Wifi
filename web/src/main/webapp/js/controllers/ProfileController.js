'use strict'

managedWifi.controller("ProfileController", ["$scope", "$location", "$routeParams", "NetworkService", "notificationService",
    function ProfileController($scope, $location, $routeParams, networkService, notificationService){
		
		if(!$scope.isNew){
			networkService.getProfileById($routeParams.id).then(function(profile){
			
				$scope.original = profile;
				$scope.profile = angular.copy($scope.original);
			});
		} else {
			$scope.original = {
					
			};
		}
	}
]);