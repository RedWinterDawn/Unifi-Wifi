'use strict';
managedWifi.controller('RefreshDataController',["$scope", "$timeout", "messagingService",
    function RefreshDataController($scope, $timeout, messagingService) {

        var refreshTimer;

        var init = function(){
            if(refreshTimer != undefined) $timeout.cancel(refreshTimer);

            $scope.lastRefreshed = moment().format('h:mm:ss a');
            refreshTimer = $timeout(function(){
                messagingService.publish(managedWifi.messageTopics.service.refresh);
            }, 30000);
        };
        init();

        $scope.refreshData = function(){
            messagingService.publishSync(managedWifi.messageTopics.service.refresh);
            init()
        };

        var subToken = messagingService.subscribe(managedWifi.messageTopics.service.refreshComplete.all, init);
        $scope.$on('$destroy', function() {
            messagingService.unsubscribe(subToken);
        });
    }
]);