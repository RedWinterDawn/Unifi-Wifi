'use strict';

managedWifi.controller('UserController', ["$scope", "$location", "$routeParams", "AccessPointService", "AccessPointUserService", "NetworkService", "notificationService", "dialogService",
    function UserController($scope, $location, $routeParams, accessPointService, accessPointUserService, networkService, notificationService, dialogService) {
        $scope.activeSubItem = 'Overview';

        accessPointUserService.getById($routeParams.id).then(
            function(user){
                $scope.original = user;
                $scope.name = user.name == undefined ? user.mac : user.name;
                accessPointService.getByMac(user.ap_mac).then(function(ap){
                    $scope.original.ap = ap.name == undefined ? ap.mac : ap.name;
                    $scope.original.apId = ap._id;
                }).then(function(){
                    networkService.getBySsid($scope.original.essid).then(function(network){
                        if(network != undefined)
                            $scope.original.networkId = network._id;
                    })
                });
            },
            function(reason){
                notificationService.error("An error occurred while loading this user. Please reload the page.");
            }
        );

        $scope.toggleBlock = function(){
            accessPointUserService.blockUser($scope.original._id, !$scope.original.blocked).then(
                function(){
                    var name = $scope.original.hostname == undefined ? $scope.original.mac : $scope.original.hostname;
                    $scope.original.blocked = !$scope.original.blocked;
                    notificationService.success(name + " was " + ($scope.original.blocked ? "blocked" : "unblocked"));
                },
                function(reason){
                    notificationService.error("An error occurred while blocking this user.");
                }
            );
        };

        $scope.toggleAuthorize = function(){
            accessPointUserService.authorizeUser($scope.original._id, !$scope.original.authorized).then(
                function(){
                    $scope.original.authorized = !$scope.original.authorized;
                    var name = $scope.original.hostname == undefined ? $scope.original.mac : $scope.original.hostname;
                    notificationService.success(name + " was " + ($scope.original.authorized ? "authorized" : "unauthorized"));
                },
                function(reason){
                    notificationService.error("An error occurred while unblocking this user.");
                }
            );
        }
    }
]);
