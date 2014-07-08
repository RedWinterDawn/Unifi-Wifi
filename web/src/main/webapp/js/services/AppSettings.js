managedWifi.factory('appSettings', ['$cookies', function ($cookies) {
    return {
        apiEndpoint: window.JiveConfig.apiEndpoint + $cookies.unifises + "/" + $cookies.account + "/" + $cookies.accessToken,
        loginEndpoint: window.JiveConfig.loginEndpoint
    }
}]);
