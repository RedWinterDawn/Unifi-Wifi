'use strict';

managedWifi.controller('AccessPointListController', ["$scope", "$location", "AccessPointService", "notificationService", "messagingService",
    function AccessPointListController($scope, $location, accessPointService, notificationService, messagingService) {

        $scope.paginator = managedWifi.paginator('name');

        var init = function (){
            accessPointService.getAll().then(
                function(devices){
                    notificationService.clear("loadDevices");
                    devices.forEach(function(device){ // modify model to work with angular particulars
                        device.orderableIp = managedWifi.createOrderableIp(device.ip);
                        device.searchables = managedWifi.createSearchables(device, ['name', 'mac', 'ip']);
                        device.user_num_sta = device['user-num_sta'];
                        device.id = device._id;
                        delete device['user-num_sta'];
                    });
                    $scope.accessPoints = devices;
                    $scope.paginator.updateTotalItems(devices.length);
                },
                function(reason){
                    notificationService.error("loadDevices", "An error occurred while loading access points.");
                }
            );
        };
        init();

        $scope.adoptDevice = function(accessPoint){
            accessPointService.adopt(accessPoint).then(function(){
                notificationService.success("accessPointAdopt", "The access point has been adopted");
                init();
            });
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.accessPointService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
