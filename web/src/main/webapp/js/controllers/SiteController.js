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
            if($scope.isNew) {
                siteService.add($scope.site).then(
                    function(){
                        notificationService.success("siteAdd", "The site has been added");
                        $scope.offLocationChangeStart();
                        window.onbeforeunload = null;
                        $location.url("/devices");
                    },
                    function(reason){
                        notificationService.error("siteAdd", "An error occurred while attempting to add this site");
                    }
                )
            } else {
                $scope.site.devices = $scope.site.macs == undefined ? [] : $scope.site.macs.split("\n");
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
        
        $scope.updateMac = function() {
        	$scope.site.devices = $scope.site.macs == undefined ? [] : $scope.site.macs.split("\n");
        	siteService.update($scope.site).then(
                    function(){
                        angular.copy($scope.site, $scope.original);
                        notificationService.success("siteEdit", "The site has been updated");
                    },
                    function(reason){
                        notificationService.error("siteEdit", "An error occurred while attempting to save this site");
                    }
                )
        };

        $scope.reset = function() {
            $scope.site = angular.copy($scope.original);
        };

        $scope.isDirty = function() {
            var dirty = !angular.equals($scope.site, $scope.original);

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

        $scope.delete = function(){
            dialogService.confirm({
                title: "Confirmation Required",
                msg: "Note that all configurations and history with respect to this site will be deleted. All associated devices will be restored to their factory state."
            }).result.then(function(){
                siteService.delete($scope.original).then(function() {
                    notificationService.success("siteDelete", $scope.original.friendly_name + " was deleted.");
                    $location.replace("/sites");
                    $location.url("/sites");
                });
            });
        };
    }
]);