managedWifi.factory('unifiAccessPointService', ['$q', '$http', 'appSettings', 'messagingService', function ($q, $http, appSettings, messagingService) {

    var accessPoints = null;
    var service = new unifi.WebServiceBase($q, $http, appSettings);

    messagingService.subscribe(managedWifi.messageTopics.service.refresh, function(){
        accessPoints = null;
        messagingService.publishSync(managedWifi.messageTopics.service.refreshComplete.accessPointService);
    });

    return {
        getAll: function () {
            var deferred = $q.defer();

            if(accessPoints == null){
                $http({method: "POST", url: appSettings.apiEndpoint+"/device"}).then(
                    function(response) {
                        accessPoints = response.data.data;
                        deferred.resolve(accessPoints);
                    },
                    function(response) {
                        deferred.reject(response);
                    }
                );
            } else {
                deferred.resolve(accessPoints);
            }

            return deferred.promise;
        },

        getById: function(id){
            if(accessPoints == null){
                var self = this;
                return this.getAll().then(function(data){
                    return self.getById(id);
                })
            }
            var deferred = $q.defer();
            var results = accessPoints.filter(function(accessPoint){return accessPoint._id == id});
            if(results.length == 0)
                deferred.reject("Access point not found");
            else
                deferred.resolve(results[0]);
            return deferred.promise;
        },

        getByMac: function(mac){
            if(accessPoints == null){
                var self = this;
                return this.getAll().then(function(data){
                    return self.getByMac(mac);
                })
            }
            var deferred = $q.defer();
            var results = accessPoints.filter(function(accessPoint){return accessPoint.mac == mac});
            if(results.length == 0)
                deferred.reject("Access point not found");
            else
                deferred.resolve(results[0]);
            return deferred.promise;
        },

        update: function(accessPoint){
            var config = accessPoint.config_network;
            var update = {"type": config.type};
            if(config.type == 'static')
                jive.applyProps(config, update, ["ip", "gateway", "netmask", "dns1", "dns2", "dnssuffix"]);
            return service.webServicePostForm("/device/" + accessPoint._id, {name: accessPoint.name, config_network: update});
        },

        upgrade: function(accessPoint){
            return service.webServiceCmdDevMgr({mac: accessPoint.mac, cmd: "upgrade"}).then(function(){
                accessPoints = null;
            });
        },

        adopt: function(accessPoint){
            return service.webServiceCmdDevMgr({mac: accessPoint.mac, cmd: "adopt"}).then(function(){
                accessPoints = null;
            });
        },

        delete: function(mac){
            return service.webServiceCmdDevMgr({mac: mac, cmd: "delete-ap"}).then(function(){
                accessPoints = null;
            });
        }
    };
}]);
