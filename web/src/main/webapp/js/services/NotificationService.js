managedWifi.factory('notificationService', ['messagingService', function (messagingService) {
    return {
        processing: function(id, msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'processing', id: id, msg: msg});
        },
        error: function(id, msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'error', id: id, msg: msg});
        },
        notice: function(id, msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'notice', id: id, msg: msg});
        },
        success: function(id, msg){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'success', id: id, msg: msg});
        },
        clear: function(id){
            messagingService.publishSync(managedWifi.messageTopics.ui.notify, {type: 'clear', id: id});
        }
    }
}]);
