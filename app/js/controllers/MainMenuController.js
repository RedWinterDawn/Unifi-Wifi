'use strict';
managedWifi.controller('MainMenuController',
    function MainMenuController($scope, $http, $location, appSettings, navigationService) {
        $scope.$on("$routeChangeSuccess", function(angularEvent, current, previous){
            $scope.activeMainNav = navigationService.getActiveMainNav(current.controller);
            $scope.activeSubNav = navigationService.getActiveSubNav(current.controller);
        });

        $scope.isActive = function (navElement){
            return $scope.activeMainNav == navElement || $scope.activeSubNav == navElement ? "active" : "";
        }

        $scope.logout = function(){
            $http({method: "GET", url: appSettings.apiEndpoint+"/logout"}).
                success(function(data, status) {
                    $location.url("/login");
                }).
                error(function(data, status) {
                });
        }
    });