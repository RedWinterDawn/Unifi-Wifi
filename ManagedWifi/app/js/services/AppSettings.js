managedWifi.factory('appSettings', ['$cookies', function ($cookies) {
    return {
        apiEndpoint: "https://unifi.emarkit.com:8090/" + $cookies.unifises,
        loginEndpoint: "https://unifi.emarkit.com:8443"
    }
}]);
