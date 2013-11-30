'use strict';
managedWifi.controller('NotificationController',["$scope", "$timeout", "messagingService",
    function NotificationController($scope, $timeout, messagingService) {
        $scope.alerts = [];

        var addMsg = function(topic, msg){
            $scope.alerts.push(msg);
            if(msg.type=='success'){
                $timeout(function() {
                    $scope.closeAlert(msg);
                }, 2000);
            }
        };

        messagingService.subscribe(managedWifi.messageTopics.ui.notify, addMsg);
        messagingService.subscribe(managedWifi.messageTopics.system.error, function(exception){
            addMsg("", {type: 'error', msg: 'An unexpected error occurred.'});
        });

        $scope.closeAlert = function(msg) {
            $scope.alerts = $scope.alerts.filter(function(alert){return alert!=msg;});
        };
    }
]);