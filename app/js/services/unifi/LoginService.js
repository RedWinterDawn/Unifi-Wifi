managedWifi.factory('loginService', function ($q, $http, appSettings) {
    return {
        login: function (username, password) {
            var deferred = $q.defer();

            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': ' text/html'
            };
            $http({method: "POST", url: appSettings.apiEndpoint+"/login", data: "username="+encodeURIComponent(username)+"&password="+encodeURIComponent(password)+"&login=Login", headers: headers }).
                success(function() {
                    $http({method: "POST", url: appSettings.apiEndpoint+"/api/s/default/stat/sta"}).
                        success(function(data, status) {
                            if(status == 200)
                                deferred.resolve();
                            else
                                deferred.reject();
                        }).
                        error(function() {
                            deferred.reject();
                        });
                }).
                error(function() {
                    deferred.reject();
                });

            return deferred.promise;
        },

        isLoggedIn: function (){
            var deferred = $q.defer();
            $http({method: "POST", url: appSettings.apiEndpoint+"/api/s/default/stat/sta"}).
                success(function(data, status) {
                    if(status == 200)
                        deferred.resolve();
                    else
                        deferred.reject();
                }).
                error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        }
    };
});
