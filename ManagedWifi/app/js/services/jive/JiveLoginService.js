managedWifi.factory('jiveLoginService', ['$q', '$http', '$cookies', '$location', 'appSettings', function ($q, $http, $cookies, $location, appSettings) {

    var sessionId = null;
    var isAdminCache = null;

    var oauthReceive = function(code, account){
        var deferred = $q.defer();
        $http.get(appSettings.loginEndpoint + "oauth/authorize/" + account + "/" + code).then(
            function(response) {
                $cookies.unifises = response.data;
                sessionId = response.data;
                deferred.resolve();
            },
            function(response) {
                deferred.reject();
            }
        );
        return deferred.promise;
    };

    var isAdmin = function (){
        var deferred = $q.defer();

        if(($cookies.unifises != null || sessionId != null) && isAdminCache == null){
            $http.get(appSettings.loginEndpoint + (sessionId == null ? $cookies.unifises : sessionId) + "/login").then(
                function(response) {
                    isAdminCache = response.data;
                    deferred.resolve(isAdminCache);
                },
                function(response) {
                    deferred.reject();
                }
            );
        } else if(isAdminCache != null){
            deferred.resolve(isAdminCache);
        } else {
            deferred.reject();
        }

        return deferred.promise;
    };

    var login = function (account){
        var deferred = $q.defer();

        if(account==null)
            deferred.reject();

        $http({method: "GET", url: appSettings.loginEndpoint + "oauth/login-uri/"+account}).then(
            function(response) {
                window.location = response.data;
                deferred.resolve();
            },
            function(response) {
                deferred.reject();

            }
        );
        return deferred.promise;
    };

    var isLoggedIn= function (){
        var deferred = $q.defer();
        if($cookies.unifises == null)
            deferred.reject();
        else
            deferred.resolve();
        return deferred.promise;
    };

    var logout = function (){
        return $http({method: "POST", url: appSettings.apiEndpoint+"/login/logout"}).then(
            function(){
                document.cookie = 'unifises=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        );
    };

    return {
        login: login,
        logout: logout,
        isAdmin: isAdmin,
        isLoggedIn: isLoggedIn,
        oauthReceive: oauthReceive
    };
}]);
