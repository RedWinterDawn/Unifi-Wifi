managedWifi.factory('jiveLoginService', ['$q', '$http', '$cookies', '$location', 'appSettings', function ($q, $http, $cookies, $location, appSettings) {

    var sessionId = null;
    var isAdminCache = null;

    var oauthReceive = function(access_token, account){
        var deferred = $q.defer();
        $http.get(appSettings.loginEndpoint + "oauth/v2/authorize/" + account + "/" + access_token).then(
            function(response) {
                sessionId = response.data.sessionId;
                $cookies.unifises = sessionId;
                $cookies.isAdmin = response.data.permissionLevel == "Platform-Admin" || response.data.permissionLevel == "Administrator" || response.data.permissionLevel == "Platform-Customer-Service";
                $cookies.firstName = response.data.firstName;
                $cookies.lastName = response.data.lastName;
                $cookies.email = response.data.email;
                $cookies.emailHash = response.data.emailHash;
                $cookies.accessToken = access_token;
                deferred.resolve();
            },
            function(response) {
                deferred.reject();
            }
        );
        return deferred.promise;
    };

    // Find out if user is admin
    var isAdmin = function (){
        var deferred = $q.defer();

        if(($cookies.unifises != null || sessionId != null) && isAdminCache == null){
            $http.get(appSettings.loginEndpoint + (sessionId == null ? $cookies.unifises : sessionId) + "/login").then(
                function(response) {
                    isAdminCache = response.data == "true";
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

    //get access token
    var login = function (account){
        var deferred = $q.defer();

        if(account==null)
           deferred.reject();
        else 
            deferred.resolve();
            
        window.location.href = "https://auth.jive.com/oauth2/v2/grant?client_id=27abd5a4-9e81-4e4e-9ccf-f6e81df64d19&inflightRequest="+account+"&redirect_uri=https:%2F%2Fwifi.jive.com%2Findex.html%23%2Foauth2&response_type=token&scope=pbx.v1.profile";
         
        return deferred.promise;
    };

    var isLoggedIn= function (){
        var deferred = $q.defer();
        if($cookies.accessToken == null)
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
