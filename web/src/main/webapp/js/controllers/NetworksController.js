'use strict';

managedWifi.controller('NetworksController', ["$scope", "$location", "$routeParams", "NetworkService", "notificationService", "messagingService", "dialogService",
    function NetworksController($scope, $location, $routeParams, networkService, notificationService, messagingService, dialogService) {

        $scope.paginator = managedWifi.paginator('name');
        $scope.site_id = $routeParams.site_id;

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

        $scope.addNetwork = function(type){
            $location.url('/site/'+$scope.site_id+'/networks/new'+type+'/');
        };
        
        $scope.manageNetwork = function(network_id,type){
        	type = type ? 'guestnetwork' : 'network';
            $location.url('/site/'+$scope.site_id+'/networks/'+type+'/'+network_id);
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
