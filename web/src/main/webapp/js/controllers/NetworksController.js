'use strict';

managedWifi.controller('NetworksController', ["$scope", "$location", "$routeParams", "NetworkService", "notificationService", "messagingService", "dialogService", "siteService", "SiteSettingsService",
    function NetworksController($scope, $location, $routeParams, networkService, notificationService, messagingService, dialogService, siteService, siteSettingsService) {

        $scope.paginator = managedWifi.paginator('name');

        var init = function(){
            networkService.getAll().then(
                function(allNetworkData){
                    notificationService.clear("loadNetworks");

                    $scope.zeroHandoffGroup2G = allNetworkData.wlangroups.filter(function(group){return group.name == 'zero-handoff2G';})[0];
                    $scope.zeroHandoffGroup5G = allNetworkData.wlangroups.filter(function(group){return group.name == 'zero-handoff5G';})[0];

                    if($scope.zeroHandoffGroup2G == undefined){
                        var networkGroup = {
                            name: "zero-handoff2G",
                            roam_enabled:true,
                            roam_radio:"ng",
                            roam_channel_ng:1,
                            roam_channel_na:36
                        };
                        
                        networkService.createZeroHandoffGroup(networkGroup);
                    }

                    if($scope.zeroHandoffGroup5G == undefined){
                        var networkGroup = {
                            name: "zero-handoff5G",
                            roam_enabled:true,
                            roam_radio:"na",
                            roam_channel_ng:1,
                            roam_channel_na:36
                        };
                        
                        networkService.createZeroHandoffGroup(networkGroup);
                    }

                    allNetworkData.networks.forEach(function(network){ // modify model to work with angular particulars
                        network.id = network._id;
                    });
                    $scope.networks = allNetworkData.networks;
                    $scope.paginator.updateTotalItems($scope.networks.length);
        
				    siteSettingsService.getAll().then(
	                     function(settings){
	                    	 $scope.guestSettings = settings.filter(function(setting){return setting.key == 'guest_access'})[0];
	                     } 
				    );	   
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
