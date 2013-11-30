'use strict';

managedWifi.controller('UsersController', ["$scope", "$location", "$routeParams", "AccessPointUserService", "AccessPointService", "notificationService", "messagingService",
    function UsersController($scope, $location, $routeParams, accessPointUserService, accessPointService, notificationService, messagingService) {

        $scope.paginator = managedWifi.paginator('-tx_bytes');
        $scope.filter = {is_connected: "true"};

        if($routeParams.mac != undefined){
            $scope.showApMac = true;
            $scope.filter['ap_mac'] = $routeParams.mac;
        }

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
                            users.forEach(function(user){ // modify model to work with angular particulars
                                var accessPoint = accessPoints.filter(function(ap){return ap.mac == user.ap_mac;});
                                if(accessPoint.length > 0)
                                    user.ap = accessPoint[0].name == undefined ? accessPoint[0].mac : accessPoint[0].name;
                                user.orderableIp = managedWifi.createOrderableIp(user.ip);
                                user.searchables = managedWifi.createSearchables(user, ['hostname', 'mac', 'ip']);
                                user.is_connected = user.ip != undefined;
                                user.id = user._id;
                            });
                            $scope.users = users;
                            $scope.networks = users.pluck('essid').distinct();
                            $scope.paginator.updateTotalItems(users.length);
                        },
                        function(reason){
                            notificationService.error("An error occurred while loading users. Please reload the page.");
                        }
                    );
                },
                function(reason){
                    notificationService.error("An error occurred while loading users. Please reload the page.");
                }
            );
        };
        init();

        $scope.blockUser = function(user){
            accessPointUserService.blockUser(user._id, !user.blocked).then(
                function(){
                    user.blocked = !user.blocked;
                    var name = user.hostname == undefined ? user.mac : user.hostname;
                    notificationService.success(name + " was " + (user.blocked ? "blocked" : "unblocked"));
                },
                function(reason){
                    notificationService.error("An error occurred while blocking this user.");
                }
            );
        };

        $scope.authorizeUser = function(user){
            accessPointUserService.authorizeUser(user._id, !user.authorized).then(
                function(){
                    user.authorized = !user.authorized;
                    var name = user.hostname == undefined ? user.mac : user.hostname;
                    notificationService.success(name + " was " + (user.authorized ? "authorized" : "unauthorized"));
                },
                function(reason){
                    notificationService.error("An error occurred while unblocking this user.");
                }
            );
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.accessPointUserService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
