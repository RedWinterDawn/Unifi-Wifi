'use strict';
managedWifi.controller('MainMenuController', ["$scope", "$timeout", "$http", "$location", "$routeParams", "$cookies", "appSettings", "navigationService", "notificationService", "siteService", "networkService", "messagingService", "dialogService", "loginService", "AccessPointService",
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

        $scope.init = function() {
            siteService.getAll().then(
                function(sites) {
                    notificationService.clear("loadSites");

                    $scope.sites = sites;

                    if (sites.length != 0) {
                        $scope.selectedSite = sites.filter(function(site) {
                            return site.is_selected;
                        })[0];
                        $scope.filter();
                        if ($scope.selectedSite == undefined) {
                            $scope.selectedSite = sites[0];
                            sites[0].is_selected = true;
                        }
                    }

                },
                function(reason) {
//                    notificationService.error("loadSites", "An error occurred while loading the sites for this account.");
                }
            );

            if ($scope.selectedSite != undefined) {
                networkService.getAll().then(
                    function(allNetworkData) {
                        $scope.networks = allNetworkData.networks;

                        $scope.zeroHandoffGroup2G = allNetworkData.wlangroups.filter(function(group){return group.name == 'zero-handoff2G';})[0];
                        $scope.zeroHandoffGroup5G = allNetworkData.wlangroups.filter(function(group){return group.name == 'zero-handoff5G';})[0];

                        if($scope.zeroHandoffGroup2G == undefined){
                            var networkGroup = {
                                name: "zero-handoff2G",
                                roam_enabled:true,
                                roam_radio:"ng",
                                roam_channel_ng:1,
                                roam_channel_na:36
                            };
                            
                            networkService.createZeroHandoffGroup(networkGroup);
                        }

                        if($scope.zeroHandoffGroup5G == undefined){
                            var networkGroup = {
                                name: "zero-handoff5G",
                                roam_enabled:true,
                                roam_radio:"na",
                                roam_channel_ng:1,
                                roam_channel_na:36
                            };
                            
                            networkService.createZeroHandoffGroup(networkGroup);
                        }
                    }
                );
            }

            loginService.isAdmin().then(
                function(isAdmin) {
                    $scope.isAdmin = isAdmin;
                }
            )
        };

        loginService.isLoggedIn().then(function() {
            $scope.init();
            $scope.firstName = $cookies.firstName;
            $scope.lastName = $cookies.lastName;
            $scope.email = $cookies.email;
            $scope.emailHash = $cookies.emailHash;
        });

        $scope.$on("$routeChangeSuccess", function(angularEvent, current, previous) {
            $scope.activeMainNav = navigationService.getActiveMainNav(current.controller);
            $scope.activeSubNav = navigationService.getActiveSubNav(current.controller);
        });

        $scope.cancel = function(e) {
            return killEvent(e);
        };

        $scope.isActive = function(navElement) {
            return $scope.activeMainNav == navElement || $scope.activeSubNav == navElement ? "active" : "";
        };

        $scope.logout = function() {
            loginService.logout().then(
                function() {
                    window.location.href = $cookies.pbx_path;
                },
                function(reason) {
                    notificationService.error("login", "An error occurred while logging you out.");
                }
            );
        };

        $scope.navigate = function(route) {
            if (route == null || route == '')
                route = '/';
            $location.url(route);
        };

        $scope.selectSite = function(site) {
            siteService.selectSite(site).then(
                function() {
                    $scope.selectedSite = site;
                    if(location.hash.split('/')[1] == 'user') {
                        $location.url("/users");
                        $location.replace("/users");
                    }
                    if(location.hash.split('/')[1] == 'device') {
                        $location.url("/devices");
                        $location.replace("/devices");
                    }
                    if(location.hash.split('/')[1] == 'networks') {
                        $location.url("/networks");
                        $location.replace("/networks");
                    }
                    if(location.hash.split('/')[1] == 'settings') {
                        location.reload();
                    }

                },
                function() {
                    notificationService.error("loadSite", "An error occurred while switching sites.");
                }
            )
        };

        $scope.deleteSite = function(site,sites){

            accessPointService.getBySiteId(site.site_id).then(function(devices){

                // Don't let the site be deleted until all access points have been removed.
                if(devices.length > 0){
                    dialogService.confirm({
                    title: "Confirmation Required",
                    msg: "All Access Points must be removed from this location before you can remove it."
                    }).result.then(function(){ $location.url("/devices"); });
                }

                else{ 
                    dialogService.confirm({
                        title: "Confirmation Required",
                        msg: "Note that all configurations and history with respect to this site will be deleted."
                    }).result.then(function(){

                        devices.forEach(function (device){
                            accessPointService.delete(device.mac).then(function(){
                                //notificationService.success("accessPointDelete", device.mac + " was deleted.");
                            });
                        });


                        siteService.delete(site).then(function() {
                            siteService.getAll().then(function(sites){
                                notificationService.clear("loadSites");

                                $scope.sites = sites;

                                notificationService.success("siteDelete", site.friendly_name + " was deleted.");

                                if(sites.length != 0){
                                    $scope.selectedSite = sites.filter(function(site) {
                                        return site.is_selected;
                                    })[0];
                                    $scope.filter();
                                    if($scope.selectedSite == undefined){
                                        $scope.selectedSite = sites[0];
                                        sites[0].is_selected = true;
                                        $scope.selectSite(sites[0]);
                                    }
                                }
                                else{
                                    $location.url("/newsite");
                                    location.reload();
                                }
                            });
                        });
                    });
                }
            });
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
                            if (site[prop] != undefined)
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
        	window.location.href = decodeURIComponent(getCookie("pbx_path"));
        };

        function getCookie(cname) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for(var i=0; i<ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1);
                    if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
                }
                return "";
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.siteService, $scope.init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
