'use strict';
managedWifi.controller('NotificationController',["$scope", "$timeout", "messagingService",
    function NotificationController($scope, $timeout, messagingService) {
        $scope.alerts = [];

        var addMsg = function(topic, msg){
            if(msg.type == 'clear'){
                $scope.alerts = $scope.alerts.filter(function(notice){return notice.id != msg.id;});
                return;
            }

            var existingMsg = $scope.alerts.filter(function(notice){return notice.msg == msg.msg;});
            if(existingMsg.length > 0)
                return;

            $scope.alerts.push(msg);
            if(msg.type=='success'){
                $timeout(function() {
                    $scope.closeAlert(msg);
                }, 2000);
            }
        };

        messagingService.subscribe(managedWifi.messageTopics.ui.notify, addMsg);
//        messagingService.subscribe(managedWifi.messageTopics.system.error, function(exception){
  //          addMsg("", {type: 'error', msg: 'An unexpected error occurred.'});
    //    });

        $scope.closeAlert = function(msg) {
            $scope.alerts = $scope.alerts.filter(function(notice){return notice!=msg;});
        };
    }
]);
