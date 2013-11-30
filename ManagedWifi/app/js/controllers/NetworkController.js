'use strict';

managedWifi.controller('NetworkController', ["$scope", "$location", "$routeParams", "NetworkService", "notificationService", "dialogService",
    function NetworkController($scope, $location, $routeParams, networkService, notificationService, dialogService) {
        $scope.activeItem = 'Configuration';
        $scope.activeSubItem = 'Basic';
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;

        $scope.isNew = $routeParams.id == undefined;

        if(!$scope.isNew){
            networkService.getById($routeParams.id).then(function(network){
                if(network.vlan != undefined) network.vlan = parseInt(network.vlan);
                if(network.radius_port_1 != undefined) network.radius_port_1 = parseInt(network.radius_port_1);

                $scope.original = network;
                $scope.network = angular.copy($scope.original);

            });
        } else {
            $scope.original = {
                enabled: true,
                hide_ssid: false,
                is_guest: false,
                name: "New Network",
                security: "wpapsk",
                vlan_enabled: false,
                wpa_enc: "auto",
                wpa_mode: "auto"
            };
            $scope.network = angular.copy($scope.original);
        }

        $scope.update = function() {
            if($scope.isNew)
                networkService.add($scope.network).then(
                    function(){
                        notificationService.success($scope.network.name + " has been added");
                        $location.url("/networks");
                    },
                    function(reason){
                        notificationService.error("An error occurred while attempting to add network");
                    }
                );
            else
                networkService.update($scope.network).then(
                    function(){
                        angular.copy($scope.network, $scope.original);
                        notificationService.success($scope.network.name + " has been updated");
                    },
                    function(reason){
                        notificationService.error("An error occurred while attempting to update this network");
                    }
                );
        };

        $scope.reset = function() {
            $scope.network = angular.copy($scope.original);
        };

        $scope.isDirty = function() {
            return !angular.equals($scope.network, $scope.original);
        };

        $scope.deleteNetwork = function(){
            dialogService
                .confirm({title: "Confirmation Required", msg: "Deleting this network is irreversible. Please click 'confim' to delete this network."})
                .result.then(function(){
                    networkService.delete($scope.original).then(
                        function(){
                            notificationService.success($scope.original.name + " was deleted.");
                            $location.replace("/networks");
                            $location.url("/networks");
                        },
                        function(reason){
                            notificationService.error("An error occurred while attempting to delete this network");
                        }
                    )
                });
        };

    }
]);
