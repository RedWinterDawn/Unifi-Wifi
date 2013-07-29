'use strict';

managedWifi.factory('$exceptionHandler', function() {
    return function (exception) {
        throw exception;
        //console.log("exception: " + exception.message);

    };
});
