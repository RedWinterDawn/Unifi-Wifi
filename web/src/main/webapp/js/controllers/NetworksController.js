'use strict';

managedWifi.controller('NetworksController', ["$scope", "$location", "NetworkService", "notificationService", "messagingService",
    function NetworksController($scope, $location, networkService, notificationService, messagingService) {

        $scope.paginator = managedWifi.paginator('name');

        var init = function(){
            networkService.getAll().then(
                function(networks){
                    notificationService.clear("loadNetworks");

                    networks.forEach(function(network){ // modify model to work with angular particulars
                        network.id = network._id;
                    });
                    $scope.networks = networks;
                    $scope.paginator.updateTotalItems(networks.length);
                },
                function(reason){
                    notificationService.error("loadNetworks", "An error occurred while loading networks.");
                }
            );
        };
        init();

        $scope.addNetwork = function(){
            $location.url('/network/');
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.networkService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
