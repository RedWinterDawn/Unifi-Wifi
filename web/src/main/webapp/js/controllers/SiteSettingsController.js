'use strict';

managedWifi.controller('SiteSettingsController', ["$scope", "$location", "$routeParams", "SiteSettingsService", "notificationService", "dialogService",
    function SiteSettingsController($scope, $location, $routeParams, siteSettingsService, notificationService, dialogService) {
        $scope.activeItem = 'Portal';
        $scope.activeSubItem = 'Limits';
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;

        siteSettingsService.getAll().then(
            function(settings){
                $scope.original = settings.filter(function(setting){return setting.key == 'guest_access'})[0];
                if (!_.has($scope.original, 'expire')) $scope.original.expire = '4320';
                $scope.settings = angular.copy($scope.original);

                $scope.originalLimits = settings.filter(function(setting){return setting.key == 'limits'})[0];
                $scope.limits = angular.copy($scope.originalLimits);
            },
            function(reason){
                notificationService.error("loadSiteSettings", "An error occurred while loading this site's settings.");
            }
        );

        $scope.update = function() {
            var completed = 0;
            var allSuccessful = true;
            var callback = function() {
                if (completed == 2) {
                    if (allSuccessful) {
                        notificationService.success("siteSettingsEdit", "This site's settings have been updated");
                    } else {
                        notificationService.error("siteSettingsEdit", "An error occurred while updating the settings.");
                    }
                }
            };

            siteSettingsService.update($scope.settings).then(function() {
                completed++;
                angular.copy($scope.settings, $scope.original);
                callback();
            }, function(reason) {
                completed++;
                callback();
            });

            siteSettingsService.updateLimits($scope.limits).then(function() {
                completed++;
                angular.copy($scope.limits, $scope.originalLimits);
                callback();
            }, function(reason) {
                completed++;
                callback();
            });
        };

        $scope.reset = function() {
            $scope.settings = angular.copy($scope.original);
            $scope.limits = angular.copy($scope.originalLimits);
        };

        $scope.isDirty = function() {
            var dirty = !angular.equals($scope.settings, $scope.original) || !angular.equals($scope.limits, $scope.originalLimits);

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
