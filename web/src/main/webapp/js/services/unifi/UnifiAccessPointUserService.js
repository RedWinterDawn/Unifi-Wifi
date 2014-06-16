managedWifi.factory('unifiAccessPointUserService', ['$q', '$http', 'appSettings', 'messagingService', function ($q, $http, appSettings, messagingService) {
    var users = null;
    var service = new unifi.WebServiceBase($q, $http, appSettings);

    messagingService.subscribe(managedWifi.messageTopics.service.refresh, function(){
        users = null;
        messagingService.publishSync(managedWifi.messageTopics.service.refreshComplete.accessPointUserService);
    });

    service.getAll =  function () {
        var deferred = $q.defer();

        if(users == null){
            $http({method: "POST", url: appSettings.apiEndpoint+"/user"}).then(
                function(response) {
                    users = response.data.data;
                    return $http({method: "POST", url: appSettings.apiEndpoint+"/user/active"})
                },
                function(response) {
                    deferred.reject(response);
                }
            ).then (
                function(response) {
                    response.data.data.forEach(function(activeUser){
                        users.forEach(function(user){
                            if(activeUser.user_id == user._id)
                                jive.mergeRecursive(user, activeUser);
                        })
                    });
                    return deferred.resolve(response.data.data);
                },
                function(response) {
                    deferred.reject(response);
                }
            );
        } else {
            deferred.resolve(users);
        }
        return deferred.promise;
    };

     service.getAllActive =  function () {
        var deferred = $q.defer();

        if(users == null){
            $http({method: "POST", url: appSettings.apiEndpoint+"/user/active"}).then(
                function(response) {
                    users = response.data.data;
                    deferred.resolve(response.data.data);
                },
                function(response) {
                    deferred.reject(response);
                }
            )
        }

        return deferred.promise;
    };

    service.getById = function(id){
        if(users == null){
            var self = this;
            return this.getAll().then(function(data){
                return self.getById(id);
            })
        }
        var deferred = $q.defer();
        var results = users.filter(function(user){return user._id == id});
        if(results.length == 0)
            deferred.reject('User not found');
        else
            deferred.resolve(results[0]);
        return deferred.promise;
    };

    service.blockUser = function (userId, shouldBlock) {
        var found = users.filter(function(user){return user._id == userId && user.blocked != shouldBlock;});
        var data = found[0] ? {cmd: shouldBlock ? 'block-sta' : 'unblock-sta', mac: found[0].mac} : null;
        return this.webServiceCmdStaMgr(data);
    };

    service.authorizeUser = function (userId, shouldAuthorize) {
        var found = users.filter(function(user){return user._id == userId && user.authorized != shouldAuthorize;});
        var data = found[0] ?  {cmd: shouldAuthorize ? 'authorize-guest' : 'unauthorize-guest', mac: found[0].mac} : null;
        return this.webServiceCmdStaMgr(data);
    };

    return service;
}]);
