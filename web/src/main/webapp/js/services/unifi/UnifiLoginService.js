managedWifi.factory('unifiLoginService', ['$q', '$http', 'appSettings', function ($q, $http, appSettings) {

    var loggedIn;
    var isLoggedIn = function (){
        console.log("unifiLoginService");
        var deferred = $q.defer();
        if(loggedIn == true){
            deferred.resolve();
            return deferred.promise;
        }

        console.log("unifiLoginService");
        $http({method: "POST", url: appSettings.loginEndpoint+"/api/s/default/stat/sta"}).then(
            function(data) {
                console.log(appSettings.loginEndpoint+"/api/s/default/stat/sta");
                console.log(data);
                if(data.status == 200){
                    loggedIn = true;
                    deferred.resolve();
                }
                else
                    deferred.reject();
            },
            function() {
                deferred.reject();
            }
        );
        return deferred.promise;
    };

    return {
        login: function (username, password) {
            console.log("unifiLoginService");
            console.log(username + ":" + password);
            var deferred = $q.defer();

            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html'
            };
            $http({method: "POST", url: appSettings.loginEndpoint+"/login", data: "username="+encodeURIComponent(username)+"&password="+encodeURIComponent(password)+"&login=Login", headers: headers }).then(
                function(data) {
                    console.log(data);
                    isLoggedIn().then(function(){deferred.resolve();}, function(){deferred.reject();});
                },
                function() {
                    deferred.reject();
                }
            );

            return deferred.promise;
        },

        logout: function(){
            console.log("unifiLoginService");
            return $http({method: "GET", url: appSettings.loginEndpoint+"/logout"}).then(function(){loggedIn=false;});
        },

        isLoggedIn: isLoggedIn
    };
}]);
