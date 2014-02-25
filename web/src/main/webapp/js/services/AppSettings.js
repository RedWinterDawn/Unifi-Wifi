managedWifi.factory('appSettings', ['$cookies', function ($cookies) {
    return {
        apiEndpoint: window.JiveConfig.apiEndpoint + $cookies.unifises,
        loginEndpoint: window.JiveConfig.loginEndpoint
    }
}]);
