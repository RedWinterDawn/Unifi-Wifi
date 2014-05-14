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
        
        $scope.addAccessPoints = function(){
        	$scope.site_id = $location.path().split("/")[2];
        	$location.url('/site/'+$scope.site_id+'/devices/new');
        };

        $scope.adoptDevice = function(accessPoint){
            accessPointService.adopt(accessPoint).then(function(){
                notificationService.success("accessPointAdopt", "The access point has been adopted");
                init();
            });
        };
        
        $scope.forgetDevice = function(){
            dialogService.confirm({
                title: "Confirmation Required",
                msg: "If you no longer wish to manage this AP, you may remove it. Note that all configurations and history with respect to this access point will be deleted as well. The device will be restored to its factory state."
            }).result.then(function(){
                accessPointService.delete($scope.original).then(function(){
                    notificationService.success("accessPointDelete", $scope.original.mac + " was deleted.");
                    $location.replace("/devices");
                    $location.url("/devices");
                });
            });
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.accessPointService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
