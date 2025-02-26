'use strict';

managedWifi.controller('SiteController', ["$scope", "$location", "$routeParams", "SiteService", "notificationService", "dialogService",
    function SiteController($scope, $location, $routeParams, siteService, notificationService, dialogService) {

        $scope.isNew = $location.path().split("/")[2] == undefined;

        $scope.original = {
            friendly_name: "New Location"
        };
        $scope.site = angular.copy($scope.original);
        
        $scope.update = function() {
            siteService.add($scope.site).then(
                function(){
                    notificationService.success("siteAdd", "The site has been added");
                    $scope.offLocationChangeStart();
                    window.onbeforeunload = null;
                    siteService.selectSite($scope.site);
                    $location.url("/networks");
                },
                function(reason){
                    notificationService.error("siteAdd", "An error occurred while attempting to add this site");
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