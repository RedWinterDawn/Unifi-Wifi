'use strict';

managedWifi.controller('NetworkController', ["$scope", "$location", "$routeParams", "NetworkService", "notificationService", "dialogService", "SiteSettingsService",
    function NetworkController($scope, $location, $routeParams, networkService, notificationService, dialogService, siteSettingsService) {
        $scope.activeItem = 'Configuration';
        $scope.activeSubItem = 'Basic';
        
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;

        $scope.isNew = $routeParams.id == undefined;
        
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

            $scope.network = angular.copy($scope.original);
        }
        else{
        	$scope.original = {
	                enabled: true,
	                hide_ssid: false,
	                is_guest: false,
	                name: "New Network",
	                security: "wpapsk",
	                vlan_enabled: false,
	                wpa_enc: "auto",
	                wpa_mode: "auto",
	                auth: "none",
                    zeroHandoff: false
	            };
        }
		$scope.network = angular.copy($scope.original);

        siteSettingsService.getAll().then(
            function(settings){
                $scope.guestSettings = settings.filter(function(setting){return setting.key == 'guest_access'})[0];

                if (!_.has($scope.guestSettings, 'expire')) $scope.guestSettings.expire = '4320';
                if ($scope.guestSettings.hotspotNoAuth === 'true') {
                    $scope.guestSettings.auth2 = 'tou';
                }
                if (!_.has($scope.guestSettings, 'originalTerms'))
                    $scope.guestSettings.originalTerms = "By accessing the wireless network, you acknowledge that you're of legal age, you have read and understood and agree to be bound by this agreement\nThe wireless network service is provided by the property owners and is completely at their discretion. Your access to the network may be blocked, suspended, or terminated at any time for any reason.\nYou agree not to use the wireless network for any purpose that is unlawful and take full responsibility of your acts.\nThe wireless network is provided &quot;as is&quot; without warranties of any kind, either expressed or implied."

                if(!_.has($scope.guestSettings, 'redirect_enabled'))
                    $scope.guestSettings.redirect_enabled = false;
            }
        );

        $scope.update = function() {
            if($scope.isNew)
                networkService.add($scope.network).then(
                    function(){
                        notificationService.success("networkAdd", $scope.network.name + " has been added");
                        $scope.offLocationChangeStart();
                        window.onbeforeunload = null;
                        $scope.network.is_guest ? $location.url("/settings/guest") : $location.url("/networks");
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
    $scope.getColor = function() { 
    	if($scope.network.is_guest)
    		return '#aaa';
    	else
    		return 'black';
    }
    $scope.guest = function() {
        $scope.network.security = "open";
    };
	
	$scope.redirect = function(page) {
	    $location.url('/settings/'+page);
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
