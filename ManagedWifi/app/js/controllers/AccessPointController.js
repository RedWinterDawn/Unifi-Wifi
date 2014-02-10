'use strict';

managedWifi.controller('AccessPointController', ["$scope", "$location", "$routeParams", "AccessPointService", "notificationService", "dialogService",
    function AccessPointController($scope, $location, $routeParams, accessPointService, notificationService, dialogService) {
        $scope.activeItem = 'Details';
        $scope.activeSubItem = 'Overview';
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;

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
            return !angular.equals($scope.accessPoint, $scope.original);
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

        $scope.viewUsers = function(){
            $location.url("/users?mac="+$scope.original.mac);
        }
    }
]);
