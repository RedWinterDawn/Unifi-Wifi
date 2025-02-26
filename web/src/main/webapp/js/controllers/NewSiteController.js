'use strict';

managedWifi.controller('NewSiteController', ["$scope", "$location", "$routeParams", "SiteService", "notificationService", "dialogService", "SiteSettingsService",
    function NewSiteController($scope, $location, $routeParams, siteService, notificationService, dialogService, siteSettingsService) {
        $scope.original = {
            friendly_name: ""
        };
        
        $scope.site = angular.copy($scope.original);
        
	$scope.create = function() {
            siteService.add($scope.site).then(
                function(){
                    notificationService.success("siteAdd", "The site has been added");
                    $scope.offLocationChangeStart();
                    window.onbeforeunload = null;
       		        siteService.selectSite($scope.site).then(
                    		function() {
                        			$scope.selectedSite = $scope.site;
                        			location.href = "#/devices";
                    		},
                    		function() {
                        			notificationService.error("loadSite", "An error occurred while switching sites.");
                    		}
                	)
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
