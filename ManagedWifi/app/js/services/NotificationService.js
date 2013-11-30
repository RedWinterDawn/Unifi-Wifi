managedWifi.factory('notificationService', ['messagingService', function (messagingService) {
    return {
        error: function(msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'error', msg: msg});
        },
        notice: function(msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'notice', msg: msg});
        },
        success: function(msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'success', msg: msg});
        }
    }
}]);
