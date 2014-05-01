'use strict';

managedWifi.controller('SiteController', ["$scope", "$location", "$routeParams", "SiteService", "notificationService", "dialogService",
    function SiteController($scope, $location, $routeParams, siteService, notificationService, dialogService) {

        $scope.activeItem = 'Macs';

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

        $scope.update = function() {
            $scope.site.devices = $scope.site.macs == undefined ? [] : $scope.site.macs.split("\n");
            
            siteService.update($scope.site).then(
                function(){
                    angular.copy($scope.site, $scope.original);
                    notificationService.success("macEdit", "The MACs have been updated");
                },
                function(reason){
                    notificationService.error("macEdit", "An error occurred while attempting to save the MACs");
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

    }
]);