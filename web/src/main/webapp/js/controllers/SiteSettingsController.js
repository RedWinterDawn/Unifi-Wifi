'use strict';

managedWifi.controller('SiteSettingsController', ["$scope", "$location", "$routeParams", "SiteService", "SiteSettingsService", "notificationService", "dialogService", "networkService",
    function SiteSettingsController($scope, $location, $routeParams, siteService, siteSettingsService, notificationService, dialogService, networkService) {
        $scope.activeItem = 'Details';
        $scope.activeSubItem = 'Access';
        
	if($routeParams.tab == 'guest')
	    $scope.activeItem = 'Guest';

	$scope.regExIpAddress = managedWifi.regExLib.ipAddress;
        $scope.showPassword = false;

	
        
        siteSettingsService.getAll().then(
                function(settings){
                    $scope.originalSettings = settings.filter(function(setting){return setting.key == 'guest_access'})[0];
		            $scope.originalSettingsMgmt = settings.filter(function(setting){return setting.key == 'mgmt'})[0];
                    
                    if (!_.has($scope.originalSettings, 'expire')) $scope.originalSettings.expire = '4320';
                    if ($scope.originalSettings.hotspotNoAuth === 'true') {
                        $scope.originalSettings.auth2 = 'tou';
                    }
                    if (!_.has($scope.originalSettings, 'originalTerms'))
                        $scope.originalSettings.originalTerms = "By accessing the wireless network, you acknowledge that you're of legal age, you have read and understood and agree to be bound by this agreement\nThe wireless network service is provided by the property owners and is completely at their discretion. Your access to the network may be blocked, suspended, or terminated at any time for any reason.\nYou agree not to use the wireless network for any purpose that is unlawful and take full responsibility of your acts.\nThe wireless network is provided &quot;as is&quot; without warranties of any kind, either expressed or implied."

                    if(!_.has($scope.originalSettings, 'redirect_enabled'))
                        $scope.originalSettings.redirect_enabled = false;

                    $scope.settings = angular.copy($scope.originalSettings);

                    $scope.originalLimits = settings.filter(function(setting){return setting.key == 'limits'})[0];
                    $scope.limits = angular.copy($scope.originalLimits);

		            $scope.settingsMgmt = angular.copy($scope.originalSettingsMgmt);
                    
                    siteService.getById($scope.settings.site_id).then(
                            function(site){
                                $scope.originalSite = site;
                                
                                if(!_.has($scope.originalSite, 'zeroHandoff'))
                                    $scope.originalSite.zeroHandoff = false;
                                
                                $scope.site = angular.copy($scope.originalSite);
                            },
                            function(reason){
                                notificationService.error("loadSite", "An error occurred while attempting to retrieve this site's details");
                            }
                        );
                },
                function(reason){
                    notificationService.error("loadSiteSettings", "An error occurred while loading this site's settings.");
                }
       );

        $scope.updateSite = function() {
            siteService.update($scope.site).then(
                    function(){
                        angular.copy($scope.site, $scope.originalSite);
                        siteService.selectSite($scope.site);
                    },
                    function(reason){
                        notificationService.error("siteEdit", "An error occurred while attempting to save this site");
                    }
                );

            if($scope.site.zeroHandoff != $scope.originalSite.zeroHandoff) {
            	networkService.changeAllNetworksZeroHandoff($scope.site.zeroHandoff);
            }
        
            $scope.isNew = $routeParams.id == undefined;

            $scope.settings.portal_enabled=true;
            $scope.settings.portal_customized = true;
            $scope.settings.payment_enabled = false;
            $scope.settings.voucher_enabled = false;
            $scope.settings.auth_none = true;
           // $scope.settings.hotspotNoAuth = 'true';

            var termsModified = $scope.settings.terms !== $scope.originalSettings.terms || $scope.settings.companyName !== $scope.originalSettings.companyName;
            var terms = $scope.settings.terms;
            var companyName = $scope.settings.companyName;
            var toComplete = 2;
            var completed = 0;
            var allSuccessful = true;
            var callback = function() {
                if (completed == toComplete) {
                    if (allSuccessful) {
                        notificationService.success("siteSettingsEdit", "This site's settings have been updated");
                    } else {
                        notificationService.error("siteSettingsEdit", "An error occurred while updating the settings.");
                    }
                }
            };

            siteSettingsService.update($scope.settings).then(function() {
                completed++;
                //if ($scope.settings.hotspotNoAuth === 'true') {
                  //  $scope.settings.auth = 'tou';
               // }

                angular.copy($scope.settings, $scope.originalSettings);

                if (termsModified) {
                    siteSettingsService.updateTou(terms, companyName).then(function() {
                        completed++;
                        callback();
                    }, function(reason) {
                        completed++;
                        callback();
                    });
                } else {
                    callback();
                }

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

         $scope.updateMac = function() {
            $scope.site.devices = $scope.site.macs == undefined ? [] : $scope.site.macs.split("\n");
            siteService.update($scope.site).then(
                    function(){
                        angular.copy($scope.site, $scope.originalSite);
                        notificationService.success("siteEdit", "The site has been updated");
                        $location.url("/devices");
                    },
                    function(reason){
                        notificationService.error("siteEdit", "An error occurred while attempting to save this site");
                    }
                )
        };

        $scope.resetTerms = function() {
            $scope.settings.terms = $scope.settings.originalTerms;
        }

        $scope.reset = function() {
            $scope.settings = angular.copy($scope.originalSettings);
            $scope.limits = angular.copy($scope.originalLimits);
            $scope.site = angular.copy($scope.originalSite);
        };

        $scope.isDirty = function() {
            var dirty = !angular.equals($scope.site, $scope.originalSite) || !angular.equals($scope.limits, $scope.originalLimits) || !angular.equals($scope.settings, $scope.originalSettings);

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
