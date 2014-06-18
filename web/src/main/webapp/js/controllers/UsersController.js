
'use strict';

managedWifi.controller('UsersController', ["$scope", "$location", "$routeParams", "AccessPointUserService", "AccessPointService", "notificationService", "messagingService",
    function UsersController($scope, $location, $routeParams, accessPointUserService, accessPointService, notificationService, messagingService) {

        $scope.paginator = managedWifi.paginator('-tx_bytes');
        $scope.filter = {is_connected: "true"};

        if($routeParams.mac != undefined){
            $scope.showApMac = true;
            $scope.filter['ap_mac'] = $routeParams.mac;
        }

	$scope.showUsers = 'active';
        
        var init = function(){
            accessPointService.getAll().then(
                function(accessPoints){
                    if($routeParams.mac != undefined){
                        var accessPoint = accessPoints.filter(function(ap){return ap.mac == $routeParams.mac;});
                        if(accessPoint.length > 0)
                            $scope.accessPoint = accessPoint[0].name == undefined ? accessPoint[0].mac : accessPoint[0].name;
                            $scope.apId = accessPoint[0]._id;
                    }

                    accessPointUserService.getAll().then(
                        function(users){
                            notificationService.clear("loadUsers");

                            users.forEach(function(user){ // modify model to work with angular particulars
                                var accessPoint = accessPoints.filter(function(ap){return ap.mac == user.ap_mac;});
                                if(accessPoint.length > 0)
                                    user.ap = accessPoint[0].name == undefined ? accessPoint[0].mac : accessPoint[0].name;
                                user.orderableIp = user.ip == undefined ? '' : managedWifi.createOrderableIp(user.ip);
                                user.searchables = managedWifi.createSearchables(user, ['hostname', 'mac', 'ip']);
                                user.is_connected = user.ip != undefined;
                                user.id = user._id;
				user.essid = user.essid==undefined ? '' : user.essid;
                            });
                            $scope.users = users;
                            $scope.networks = users.pluck('essid').distinct();
                            $scope.paginator.updateTotalItems(users.length);
                        },
                        function(reason){
                            notificationService.error("loadUsers", "An error occurred while loading users.");
                        }
                    );
                },
                function(reason){
                    notificationService.error("loadUsers", "An error occurred while loading users.");
                }
            );
        };
        init();
        
	$scope.filterUsers = function(type) {
		if(type=='active')
			$scope.filter = {is_connected: "true"};
		else
			$scope.filter = {};
	}        

        $scope.blockUser = function(user){
            accessPointUserService.blockUser(user._id, !user.blocked).then(
                function(){
                    user.blocked = !user.blocked;
                    var name = user.hostname == undefined ? user.mac : user.hostname;
                    notificationService.success("userBlock", name + " was " + (user.blocked ? "blocked" : "unblocked"));
                },
                function(reason){
                    notificationService.error("userBlock", "An error occurred while blocking this user.");
                }
            );
            init();
        };

        $scope.authorizeUser = function(user){
            accessPointUserService.authorizeUser(user._id, !user.authorized).then(
                function(){
                    user.authorized = !user.authorized;
                    var name = user.hostname == undefined ? user.mac : user.hostname;
                    notificationService.success("userAuth", name + " was " + (user.authorized ? "authorized" : "unauthorized"));
                },
                function(reason){
                    notificationService.error("userAuth", "An error occurred while unblocking this user.");
                }
            );
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.accessPointUserService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
