'use strict';

managedWifi.controller('AccessPointController', ["$scope", "$location", "$routeParams", "AccessPointService", "notificationService", "dialogService",
    function AccessPointController($scope, $location, $routeParams, accessPointService, notificationService, dialogService) {
        $scope.activeItem = 'Settings';
        $scope.activeSubItem = 'Overview';
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;
        
        $scope.site_id = $location.path().split("/")[2];

        accessPointService.getById($routeParams.id).then(function(accessPoint){
            $scope.original = accessPoint;
            $scope.accessPoint = angular.copy($scope.original);
            $scope.name = accessPoint.name == undefined ? accessPoint.mac : accessPoint.name;
        });

        $scope.update = function() {
            accessPointService.update($scope.accessPoint).then(function(){
                angular.copy($scope.accessPoint, $scope.original);
                notificationService.success("accessPointEdit", "The access point has been updated");
            })
        };

        $scope.reset = function() {
            $scope.accessPoint = angular.copy($scope.original);
        };

        $scope.isDirty = function() {
            var dirty = !angular.equals($scope.accessPoint, $scope.original);

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
        
        $scope.forgetDevice = function(){
            dialogService.confirm({
                title: "Confirmation Required",
                msg: "If you no longer wish to manage this AP, you may remove it. Note that all configurations and history with respect to this access point will be deleted as well. The device will be restored to its factory state."
            }).result.then(function(){
                accessPointService.delete($scope.original.mac).then(function(){
                    notificationService.success("accessPointDelete", $scope.original.mac + " was deleted.");
                    $location.replace("/site/"+$scope.site_id+"/devices");
                    $location.url("/site/"+$scope.site_id+"/devices");
                });
            });
        };

        $scope.viewUsers = function(){
            $location.replace("/site/"+$scope.site_id+"/users?mac="+$scope.original.mac);
            $location.url("/site/"+$scope.site_id+"/users?mac="+$scope.original.mac);
        }
    }
]);
