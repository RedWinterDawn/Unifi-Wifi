managedWifi.factory('jiveLoginService', ['$q', '$http', '$cookies', '$location', 'appSettings', function ($q, $http, $cookies, $location, appSettings) {

    var sessionId = null;
    var isAdminCache = null;

    var oauthReceive = function(access_token, account){
        var deferred = $q.defer();
        console.log("oauthReceive");
        console.log(access_token);
        console.log(account);
        $http.get(appSettings.loginEndpoint + "oauth/v2/authorize/" + account + "/" + access_token).then(
            function(response) {
                console.log(response);
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
        console.log("isAdmin");
        var deferred = $q.defer();

        if(($cookies.unifises != null || sessionId != null) && isAdminCache == null){
             console.log("unifises " + $cookies.unifises);
             console.log("sessionId " + sessionId);
             console.log("isAdminCache " + isAdminCache);
            $http.get(appSettings.loginEndpoint + (sessionId == null ? $cookies.unifises : sessionId) + "/login").then(
                function(response) {
                    console.log(response);
                    isAdminCache = response.data == "true";
                    deferred.resolve(isAdminCache);
                },
                function(response) {
                    deferred.reject();
                }
            );
        } else if(isAdminCache != null){
            console.log("isadminCache " + isAdminCache);
            deferred.resolve(isAdminCache);
        } else {
            deferred.reject();
        }

        return deferred.promise;
    };

    //get access token
    var login = function (account){
        console.log("login");
        console.log("account " + account);

        var deferred = $q.defer();

        if(account==null)
           deferred.reject();
        else 
            deferred.resolve();

        var client_id = "27abd5a4-9e81-4e4e-9ccf-f6e81df64d19";
        var redirect_uri = "https:%2F%2Fwifi.jive.com%2Findex.html%23%2Foauth2";
        var uri = "https://auth.jive.com/oauth2/v2/grant?client_id="+client_id+"&inflightRequest="+account+"&redirect_uri="+redirect_uri+"&response_type=token&scope=pbx.v1.profile";
            
        console.log("uri= "+uri);
        window.location.href = uri;
         
        return deferred.promise;
    };

    var isLoggedIn= function (){
        console.log("isLoggedIn");
        var deferred = $q.defer();
        console.log("$cookies.unifises " + $cookies.unifises);
        if($cookies.unifises == null)
            deferred.reject();
        else
            deferred.resolve();
        return deferred.promise;
    };

    var logout = function (){
        console.log("logout");
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
