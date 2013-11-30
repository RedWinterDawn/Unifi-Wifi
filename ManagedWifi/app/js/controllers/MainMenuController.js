'use strict';
managedWifi.controller('MainMenuController',["$scope", "$http", "$location", "appSettings", "navigationService", "notificationService", "siteService", "messagingService", "unifiLoginService",
    function MainMenuController($scope, $http, $location, appSettings, navigationService, notificationService, siteService, messagingService, loginService) {

        var init = function(){
            siteService.getAll().then(
                function(sites){
                    $scope.sites = sites;
                    $scope.selectedSite = sites.filter(function(site){
                        return site.is_selected;
                    })[0];
                },
                function(reason){
                    notificationService.error("An error occurred while loading the sites for this account.");
                }
            );
        };
        loginService.isLoggedIn().then(init);

        $scope.$on("$routeChangeSuccess", function(angularEvent, current, previous){
            $scope.activeMainNav = navigationService.getActiveMainNav(current.controller);
            $scope.activeSubNav = navigationService.getActiveSubNav(current.controller);
        });

        $scope.isActive = function (navElement){
            return $scope.activeMainNav == navElement || $scope.activeSubNav == navElement ? "active" : "";
        };

        $scope.logout = function(){
            loginService.logout().then(
                function(){
                    $location.url("/login");
                },
                function(reason){
                    notificationService.error("An error occurred while logging you out.");
                }
            );
        };

        $scope.navigate = function(route){
            if(route == null || route == '')
                route = '/';
            $location.url(route);
        };

        $scope.selectSite = function(site){
            siteService.selectSite(site).then(
                function(){
                    $scope.selectedSite = site;
                },
                function(){
                    notificationService.error("An error occurred while switching sites.");
                }
            )
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.siteService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);