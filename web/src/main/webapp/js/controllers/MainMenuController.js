'use strict';
managedWifi.controller('MainMenuController',["$scope", "$timeout", "$http", "$location", "$routeParams", "$cookies", "appSettings", "navigationService", "notificationService", "siteService", "networkService", "messagingService", "dialogService", "loginService", "AccessPointService",
    function MainMenuController($scope, $timeout, $http, $location, $cookies, $routeParams, appSettings, navigationService, notificationService, siteService, networkService, messagingService, dialogService, loginService, accessPointService) {
        $scope.siteFilter = '';
        $scope.referrer = document.referrer;

        $(window).resize(resizeSiteList);

        function resizeSiteList() {
            $('.site-list ul').css('max-height', $(window).height() - 200);
        }

        function killEvent(e) {
            if (!e) return false;
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;

            return false;
        }

        resizeSiteList();

        $scope.init = function(){
            siteService.getAll().then(
                function(sites){
                    notificationService.clear("loadSites");
                    
                    $scope.sites = sites;
                    
                    if(sites.length != 0){
	                    $scope.selectedSite = sites.filter(function(site) {
	                        return site.is_selected;
	                    })[0];
	                    $scope.filter();
	                    if($scope.selectedSite == undefined){
	                    	$scope.selectedSite = sites[0];
	                    	sites[0].is_selected = true;
	                    }
                    }

                },
                function(reason){
                    notificationService.error("loadSites", "An error occurred while loading the sites for this account.");
                }
            );

            if($scope.selectedSite != undefined){
                networkService.getAll().then(
                    function(allNetworkData){
                        $scope.networks = allNetworkData.networks;
                    }
                );
            }
            
            loginService.isAdmin().then(
                function(isAdmin){
                    $scope.isAdmin = isAdmin;
                }
            )
        };

        loginService.isLoggedIn().then(function(){
            $scope.init();
            $scope.firstName = $cookies.firstName;
            $scope.lastName = $cookies.lastName;
            $scope.email = $cookies.email;
            $scope.emailHash = $cookies.emailHash;
        });

        $scope.$on("$routeChangeSuccess", function(angularEvent, current, previous){
            $scope.activeMainNav = navigationService.getActiveMainNav(current.controller);
            $scope.activeSubNav = navigationService.getActiveSubNav(current.controller);
        });

        $scope.cancel = function(e) {
            return killEvent(e);
        };

        $scope.isActive = function (navElement){
            return $scope.activeMainNav == navElement || $scope.activeSubNav == navElement ? "active" : "";
        };

        $scope.logout = function(){
            loginService.logout().then(
                function(){
                    window.location.href = "https://www.onjive.com/auth/logout";
                },
                function(reason){
                    notificationService.error("login", "An error occurred while logging you out.");
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
                    location.reload();
                },
                function(){
                    notificationService.error("loadSite", "An error occurred while switching sites.");
                }
            )
        };

        
         $scope.deleteSite = function(site,sites){
            dialogService.confirm({
                title: "Confirmation Required",
                msg: "Make sure all access points are deleted from this site before clicking 'Confirm'. Note that all configurations and history with respect to this site will be deleted."
                }).result.then(function(){

                var devices = site.macs.split("\n");
                $scope.sites = sites.filter(function(site){return site.site_id != site.site_id;});



                if($scope.sites.length != 0){
                    $scope.selectedSite = $scope.sites.filter(function(site) {
                        return site.is_selected;
                    })[0];
                    $scope.filter();
                    if($scope.selectedSite == undefined){
                        $scope.selectedSite = $scope.sites[0];
                        $scope.sites[0].is_selected = true;
                        $scope.selectSite($scope.sites[0]);
                    }
                }

               devices.forEach(function (mac){
                    accessPointService.delete(mac);
                        });

                $scope.removeSite(site);

                });
        };

        $scope.removeSite = function(site){
            $timeout(function(){siteService.delete(site).then(function() {
                siteService.getAll().then(function(sites){
                    notificationService.clear("loadSites");

                    $scope.sites = sites;

                    notificationService.success("siteDelete", site.friendly_name + " was deleted.");

                    if(sites.length == 0){
                        $location.url("/newsite");
                        location.reload();
                    }
                });
            });}, 10000);
        };

        var sitePropertiesToFilter = ['friendly_name', 'city', 'state', 'zip'];
        $scope.filter = function() {
            if ($scope.siteFilter.replace(/^\s+|\s+$/g, '') === '') {
                $scope.filteredSites = $scope.sites;
            } else {
                var searchTerms = $scope.siteFilter.toLowerCase().split(' ');

                $scope.filteredSites = _.filter($scope.sites, function(site) {
                    return _.all(searchTerms, function(term) {
                        return _.any(sitePropertiesToFilter, function(prop) {
                        	if(site[prop] != undefined)
                        		return site[prop].toLowerCase().indexOf(term) > -1;
                        	else
                        		return false;
                        });
                    });
                });
            }

            sort(sortField, sortReverse);
        };
        
        

        $scope.sortIcons = {
            friendly_name: 'icon-caret-down',
            city: 'icon-sort',
            state: 'icon-sort',
            zip: 'icon-sort'
        };
        var sortField = 'friendly_name',
            sortReverse = false;

        function setAllIcons(value) {
            _.each(_.keys($scope.sortIcons), function(key) {
                $scope.sortIcons[key] = value;
            });
        }

        $scope.toggleSortDirection = function(e, field) {
            var direction = $scope.sortIcons[field];
            var reverse = false;

            setAllIcons('icon-sort');

            if (direction.indexOf('down') >= 0) {
                $scope.sortIcons[field] = 'icon-caret-up';
                reverse = true;
            } else {
                $scope.sortIcons[field] = 'icon-caret-down';
            }

            sort(field, reverse);

            if (e) return killEvent(e);
        }

        function sort(field, reverse) {
            sortField = field;
            sortReverse = reverse;

            $scope.filteredSites = _.sortBy($scope.filteredSites, function(site) {
                return site[field];
            });

            if (reverse) $scope.filteredSites.reverse();
        };

        $scope.returnHome = function() {
            window.location = "https://www.onjive.com/";
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.siteService, $scope.init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);