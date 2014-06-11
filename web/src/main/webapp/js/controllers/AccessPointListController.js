'use strict';

managedWifi.controller('AccessPointListController', ["$scope", "$location", "dialogService", "AccessPointService", "siteService", "notificationService", "messagingService",
    function AccessPointListController($scope, $location, dialogService, accessPointService, siteService, notificationService, messagingService) {

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
			if(device.version != undefined){device.version = device.version.substring(0,6);}
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
	init();

        $scope.upgradeDevice = function(accessPoint){
            accessPointService.upgrade(accessPoint).then(function(){
                notificationService.success("accessPointUpgrade", "The access point is upgrading");
                init();
            });
        };
        
        $scope.addAccessPoints = function(){
        	$location.url('/devices/new');
        };
        
        $scope.redirect = function(accesspoint_id, tab){
        	$location.url('/device/'+accesspoint_id+'/'+tab);
        }

        $scope.adoptDevice = function(accessPoint){
            accessPointService.adopt(accessPoint).then(function(){
                notificationService.success("accessPointAdopt", "The access point is being adopted");
                init();
            });
        };
        
        $scope.forgetDevice = function(mac){
            dialogService.confirm({
                title: "Confirmation Required",
                msg: "If you no longer wish to manage this AP, you may remove it. Note that all configurations and history with respect to this access point will be deleted as well. The device will be restored to its factory state."
            }).result.then(function(){
                accessPointService.delete(mac).then(function(){
                    notificationService.success("accessPointDelete", mac + " was deleted.");
                    init();
                });
            });
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.accessPointService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
