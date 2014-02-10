'use strict';

managedWifi.controller('SiteSettingsController', ["$scope", "$location", "$routeParams", "SiteSettingsService", "notificationService", "dialogService",
    function SiteSettingsController($scope, $location, $routeParams, siteSettingsService, notificationService, dialogService) {
        $scope.activeItem = 'Portal';
        $scope.activeSubItem = 'Limits';
        $scope.regExIpAddress = managedWifi.regExLib.ipAddress;

        siteSettingsService.getAll().then(
            function(settings){
                $scope.original = settings.filter(function(setting){return setting.key == 'guest_access'})[0];
                $scope.settings = angular.copy($scope.original);

                $scope.originalLimits = settings.filter(function(setting){return setting.key == 'limits'})[0];
                $scope.originalLimits.limitDownload = $scope.originalLimits.qos_rate_max_down > -1;
                $scope.originalLimits.limitUpload = $scope.originalLimits.qos_rate_max_up > -1;
                $scope.limits = angular.copy($scope.originalLimits);
            },
            function(reason){
                notificationService.error("loadSiteSettings", "An error occurred while loading this site's settings.");
            }
        );

        $scope.update = function() {
            siteSettingsService.update($scope.settings).then(
                function(){
                    angular.copy($scope.settings, $scope.original);
                    notificationService.success("siteSettingsEdit", "This site's settings have been updated");
                },
                function(reason){
                    notificationService.error("siteSettingsEdit", "An error occurred while updating the settings.");
                }
            )
        };

        $scope.reset = function() {
            $scope.settings = angular.copy($scope.original);
            $scope.limits = angular.copy($scope.limits);
        };

        $scope.isDirty = function() {
            return !angular.equals($scope.settings, $scope.original) || !angular.equals($scope.limits, $scope.originalLimits);
        };

    }
]);
