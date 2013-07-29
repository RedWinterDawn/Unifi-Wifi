managedWifi.factory('accessPointRepository', function ($q, $http, $log, appSettings) {
    return {
        getAll: function () {
            var deferred = $q.defer();

            $http({method: "POST", url: appSettings.apiEndpoint+"/api/s/default/stat/device"}).
                success(function(data, status) {
                    $log.info(data);
                    deferred.resolve(data.data);
                }).
                error(function(data, status) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    };
});
