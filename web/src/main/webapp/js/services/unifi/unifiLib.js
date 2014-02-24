var unifi = {};

unifi.WebServiceBase = function ($q, $http, appSettings){

    this.webServiceCmdStaMgr = function (data){
        if(data)
            return $http({method: "POST", data: data, url: appSettings.apiEndpoint+"/cmd/stamgr"});

        var deferred = $q.defer();
        deferred.reject("No data was provided.");
        return deferred.promise;
    };

    this.webServiceCmdDevMgr = function (data){
        if(data)
            return $http({method: "POST", data: data, url: appSettings.apiEndpoint+"/cmd/devmgr"});

        var deferred = $q.defer();
        deferred.reject("No data was provided.");
        return deferred.promise;
    };

    this.webServicePostForm = function (endpoint, data){
        return $http({
            method: "POST",
            data: $.param({json: angular.toJson(data)}),
            url: appSettings.apiEndpoint+endpoint,
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        });
    };

    this.webServicePutForm = function (endpoint, data){
        return $http({
            method: "PUT",
            data: $.param({json: angular.toJson(data)}),
            url: appSettings.apiEndpoint+endpoint,
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        });
    };

    this.webServiceDelete = function (endpoint){
        return $http({
            method: "DELETE",
            data: {},
            url: appSettings.apiEndpoint+endpoint,
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        });
    };
};
