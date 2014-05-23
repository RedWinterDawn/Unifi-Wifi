'use strict'

managedWifi.controller("ProfilesController", ["$scope", "$location", "NetworkService",
	function ProfilesController($scope, $location, networkService) {

		$scope.paginator = managedWifi.paginator('name');

		var init = function(){
			networkService.getAll().then(
				function(allNetworkData){
					notificationService.clear("loadNetworks");

					allNetworkData.wlangroups.forEach(function(network){ // modify model to work with angular particulars
                        network.id = network._id;
                    });
                    $scope.profiles = allNetworkData.wlangroups;
                    $scope.paginator.updateTotalItems($scope.profiles.length);

				},
				function(reason){
					notificationService.error("loadNetworks", "An error occurred while loading networks.");
				}
			);
		};
		init();
	}
]);