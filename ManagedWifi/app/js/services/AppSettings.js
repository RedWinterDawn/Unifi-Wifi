managedWifi.factory('appSettings', ['$cookies', function ($cookies) {
    return {
        apiEndpoint: "http://localhost:8080/web/" + $cookies.unifises,
        loginEndpoint: "http://localhost:8080/web/"
    }
}]);
