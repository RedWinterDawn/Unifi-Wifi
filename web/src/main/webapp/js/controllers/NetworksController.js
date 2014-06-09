'use strict';

managedWifi.controller('NetworksController', ["$scope", "$location", "$routeParams", "NetworkService", "notificationService", "messagingService", "dialogService", "siteService",
    function NetworksController($scope, $location, $routeParams, networkService, notificationService, messagingService, dialogService, siteService) {

        $scope.paginator = managedWifi.paginator('name');

        var init = function(){
            networkService.getAll().then(
                function(allNetworkData){
                    notificationService.clear("loadNetworks");

                    allNetworkData.networks.forEach(function(network){ // modify model to work with angular particulars
                        network.id = network._id;
                    });
                    $scope.networks = allNetworkData.networks;
                    $scope.paginator.updateTotalItems($scope.networks.length);
                },
                function(reason){
                    //notificationService.error("loadNetworks", "An error occurred while loading networks.");
                }
            );
        };
        init();

        $scope.addNetwork = function(type){
            $location.url('/networks/new/');
        };
        
        $scope.manageNetwork = function(network_id){
            $location.url('/networks/'+network_id);
        };
        
        $scope.deleteNetwork = function(networkId){
            dialogService
                .confirm({title: "Confirmation Required", msg: "Deleting this network is irreversible. Please click 'confim' to delete this network."})
                .result.then(function(){
                	 networkService.getById(networkId).then(function(network){
                         if(network.vlan != undefined) network.vlan = parseInt(network.vlan);
                         if(network.radius_port_1 != undefined) network.radius_port_1 = parseInt(network.radius_port_1);
                	
		                    networkService.delete(network).then(
		                        function(){
		                            notificationService.success("networkDelete", network.name + " was deleted.");
		                            $location.replace("/networks");
		                            $location.url("/networks");
		                            init();
		                        },
		                        function(reason){
		                            notificationService.error("networkDelete", "An error occurred while attempting to delete this network");
		                        }
		                    )
		                
                	 });
                });
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.networkService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
