'use strict'

managedWifi.controller("ProfilesController", ["$scope", "$location", "NetworkService", "notificationService",
	function ProfilesController($scope, $location, networkService, notificationService) {

		$scope.paginator = managedWifi.paginator('name');

		var init = function(){
			networkService.getAll().then(
				function(allNetworkData){
					notificationService.clear("loadNetworks");
					$scope.profiles = [];

					allNetworkData.wlangroups.forEach(function(network){ // modify model to work with angular particulars
                        network.id = network._id;
                        if(!network.attr_hidden)
                        	$scope.profiles.push(network)
                    });
                    $scope.allNetworkData = allNetworkData.wlangroups;
                    $scope.paginator.updateTotalItems($scope.profiles.length);

				},
				function(reason){
					notificationService.error("loadNetworks", "An error occurred while loading networks.");
				}
			);
		};
		init();

		$scope.manageProfile = function(profile_id){
			$location.url("/profiles/"+profile_id);
		};
	}
]);