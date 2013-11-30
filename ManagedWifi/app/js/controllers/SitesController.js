'use strict';

managedWifi.controller('SitesController', ["$scope", "$location", "SiteService", "notificationService", "messagingService",
    function SitesController($scope, $location, siteService, notificationService, messagingService) {

        $scope.paginator = managedWifi.paginator('friendly_name');

        var init = function (){
            siteService.getAllInAccounts().then(
                function(sites){
                    sites.forEach(function(site){ // modify model to work with angular particulars
                        site.orderableIp = managedWifi.createOrderableIp(site.ip);
                        site.searchables = managedWifi.createSearchables(site, ['friendly_name', 'city', 'account_id']);
                    });
                    $scope.sites = sites;
                    $scope.paginator.updateTotalItems(sites.length);
                }
            );
        };
        init();

        $scope.addSite = function(){
            $location.url('/site/');
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.siteService, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);
