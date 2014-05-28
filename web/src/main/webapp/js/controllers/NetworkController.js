'use strict';

managedWifi.controller('NetworkController', ["$scope", "$location", "$routeParams", "NetworkService", "notificationService", "dialogService",
    function NetworkController($scope, $location, $routeParams, networkService, notificationService, dialogService) {
        $scope.activeItem = 'Configuration';
        
        if($routeParams.tab === 'policies')
        	$scope.activeSubItem = 'Guest';
        else
        	$scope.activeSubItem = 'Basic';
        
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;

        $scope.isNew = $routeParams.id == undefined;
        
        $scope.isGuest = $routeParams.network_type == 'guestnetwork';

        $scope.showWepPassword = false;
        $scope.showWpaePassword = false;
        $scope.showWpapPassword = false;

        if(!$scope.isNew){
            networkService.getById($routeParams.id).then(function(network){
                if(network.vlan != undefined) network.vlan = parseInt(network.vlan);
                if(network.radius_port_1 != undefined) network.radius_port_1 = parseInt(network.radius_port_1);

                $scope.original = network;
                $scope.network = angular.copy($scope.original);

            });
        } else {
        	if(!$scope.isGuest) {
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
        	}
        	else {
        		 $scope.original = {
        	                enabled: true,
        	                hide_ssid: false,
        	                is_guest: true,
        	                name: "New Guest Network",
        	                security: "wpapsk",
        	                vlan_enabled: false,
        	                wpa_enc: "auto",
        	                wpa_mode: "auto",
        	                auth: "none",
        	                redirect_enabled: false,
        	                expire: ""
        	            };
        		 
        	}
        	
            $scope.network = angular.copy($scope.original);
        }

        $scope.update = function() {
            if($scope.isNew)
                networkService.add($scope.network).then(
                    function(){
                        notificationService.success("networkAdd", $scope.network.name + " has been added");
                        $scope.offLocationChangeStart();
                        window.onbeforeunload = null;
                        $location.url("/networks");
                    },
                    function(reason){
                        notificationService.error("networkAdd", "An error occurred while attempting to add network");
                    }
                );
            else
                networkService.update($scope.network).then(
                    function(){
                        angular.copy($scope.network, $scope.original);
                        notificationService.success("networkEdit", $scope.network.name + " has been updated");
                    },
                    function(reason){
                        notificationService.error("networkEdit", "An error occurred while attempting to update this network");
                    }
                );
        };

        $scope.reset = function() {
            $scope.network = angular.copy($scope.original);
        };

        $scope.isDirty = function() {
            var dirty = !angular.equals($scope.network, $scope.original);

            if (dirty) window.onbeforeunload = confirmExit;
            else window.onbeforeunload = null;

            return dirty;
        };

        function confirmExit(e) {
            e = e || window.event;
            var message = 'You have unsaved changes, are you sure you want to leave this page?';
            if (e) e.returnValue = message;

            return message;
        }

        function confirmRoute(event, next) {
            if ($scope.isDirty()) {
                event.preventDefault();
                dialogService.confirm({
                    title: 'Confirmation Required',
                    msg: 'You have unsaved changes, are you sure you want to leave this page?'
                }).result.then(function() {
                    $scope.offLocationChangeStart();
                    window.onbeforeunload = null;
                    window.location = next;
                });
            }
        }

        $scope.offLocationChangeStart = $scope.$on('$locationChangeStart', confirmRoute);


        $scope.deleteNetwork = function(){
            dialogService
                .confirm({title: "Confirmation Required", msg: "Deleting this network is irreversible. Please click 'confim' to delete this network."})
                .result.then(function(){
                    networkService.delete($scope.original).then(
                        function(){
                            notificationService.success("networkDelete", $scope.original.name + " was deleted.");
                            $location.replace("/networks");
                            $location.url("/networks");
                        },
                        function(reason){
                            notificationService.error("networkDelete", "An error occurred while attempting to delete this network");
                        }
                    )
                });
        };

    }
]);
