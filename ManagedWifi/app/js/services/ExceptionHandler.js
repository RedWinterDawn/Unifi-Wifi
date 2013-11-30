'use strict';

managedWifi.factory('$exceptionHandler', ['$log', 'messagingService',
    function($log, messagingService) {
        return function (exception) {
            $log.error(exception);
            messagingService.publishSync(managedWifi.messageTopics.system.error, exception);
        };
    }]
);
