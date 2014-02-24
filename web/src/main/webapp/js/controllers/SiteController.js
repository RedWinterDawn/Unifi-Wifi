'use strict';

managedWifi.controller('SiteController', ["$scope", "$location", "$routeParams", "SiteService", "notificationService", "dialogService",
    function SiteController($scope, $location, $routeParams, siteService, notificationService, dialogService) {

        $scope.activeItem = 'Details';
        $scope.isNew = $routeParams.id == undefined;

        if(!$scope.isNew){
            siteService.getById($routeParams.id).then(
                function(site){
                    site.macs = site.devices == undefined ? "" : site.devices.join("\n");
                    $scope.original = site;
                    $scope.site = angular.copy($scope.original);
                },
                function(reason){
                    notificationService.error("loadSite", "An error occurred while attempting to retrieve this site's details");
                }
            );
        } else {
            $scope.original = {
                friendly_name: "New Site"
            };
            $scope.site = angular.copy($scope.original);
        }

        $scope.update = function() {
            $scope.site.devices = $scope.site.macs == undefined ? [] : $scope.site.macs.split("\n");
            if($scope.isNew) {
                siteService.add($scope.site).then(
                    function(){
                        notificationService.success("siteAdd", "The site has been added");

                        $location.url("/sites");
                    },
                    function(reason){
                        notificationService.error("siteAdd", "An error occurred while attempting to add this site");
                    }
                )
            } else {
                siteService.update($scope.site).then(
                    function(){
                        angular.copy($scope.site, $scope.original);
                        notificationService.success("siteEdit", "The site has been updated");
                    },
                    function(reason){
                        notificationService.error("siteEdit", "An error occurred while attempting to save this site");
                    }
                )
            }
        };

        $scope.reset = function() {
            $scope.site = angular.copy($scope.original);
        };

        $scope.isDirty = function() {
            return !angular.equals($scope.site, $scope.original);
        };

        $scope.delete = function(){
            dialogService.confirm({
                title: "Confirmation Required",
                msg: "Note that all configurations and history with respect to this site will be deleted. All associated devices will be restored to their factory state."
            }).result.then(function(){
                    siteService.delete($scope.original).then(function(){
                    notificationService.success("siteDelete", $scope.original.friendly_name + " was deleted.");
                    $location.replace("/sites");
                    $location.url("/sites");
                });
            });
        };

    }
]);
