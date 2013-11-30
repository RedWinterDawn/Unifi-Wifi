managedWifi.factory('unifiNetworkService', ['$q', '$http', 'appSettings', 'messagingService', function ($q, $http, appSettings, messagingService) {

    var networks = null;
    var wlangroups = null;
    var usergroups = null;
    var service = new unifi.WebServiceBase($q, $http, appSettings);

    messagingService.subscribe(managedWifi.messageTopics.service.refresh, function(){
        networks = null;
        wlangroups = null;
        usergroups = null;
        messagingService.publishSync(managedWifi.messageTopics.service.refreshComplete.networkService);
    });

    return {
        getAll: function () {
            var deferred = $q.defer();

            if(networks == null){
                $http({method: "POST", url: appSettings.apiEndpoint+"/network/groups/wlan"})
                .then(
                    function(response) {
                        wlangroups = response.data.data;
                    },
                    function(response) {
                        deferred.reject(response);
                    }
                )
                .then(function(){
                    $http({method: "POST", url: appSettings.apiEndpoint+"/network/groups/user"}).then(
                        function(response) {
                            usergroups = response.data.data;
                        },
                        function(response) {
                            deferred.reject(response);
                        }
                    );
                })
                .then(function(){
                    $http({method: "POST", url: appSettings.apiEndpoint+"/network"}).then(
                        function(response) {
                            networks = response.data.data;
                            deferred.resolve(networks);
                        },
                        function(response) {
                            deferred.reject(response);
                        }
                    );
                });
            } else {
                deferred.resolve(networks);
            }
            return deferred.promise;
        },

        getById: function(id){
            if(networks == null){
                var self = this;
                return this.getAll().then(function(data){
                    return self.getById(id);
                })
            }
            var deferred = $q.defer();
            var results = networks.filter(function(network){return network._id == id});
            if(results.length == 0)
                deferred.reject('Network not found');
            else
                deferred.resolve(results[0]);
            return deferred.promise;
        },

        getBySsid: function(ssid){
            if(networks == null){
                var self = this;
                return this.getAll().then(function(data){
                    return self.getBySsid(ssid);
                })
            }
            var deferred = $q.defer();
            var results = networks.filter(function(network){return network.name == ssid});
            if(results.length == 0)
                deferred.reject('Network not found');
            else
                deferred.resolve(results[0]);
            return deferred.promise;
        },

        update: function(network){
            var copy = angular.copy(network);
            delete copy.id;
            delete copy._id;
            return service.webServicePostForm("/network/" + network._id, copy);
        },

        add: function(network){
            delete network.id;
            delete network._id;
            var firstGroup = wlangroups.filter(function(group){return group.attr_no_edit == undefined;});
            if(firstGroup.length > 0)
                network.wlangroup_id = firstGroup[0]._id;
            network.usergroup_id = usergroups[0]._id;
            var deferred = $q.defer();
            service.webServicePutForm("/network", network).then(
                function(response) {
                    networks.push(response.data.data[0]);
                    deferred.resolve();
                },
                function(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        },

        delete: function(network){
            var deferred = $q.defer();

            service.webServiceDelete("/network/" + network._id).then(
                function(){
                    networks = networks.filter(function(existingNetwork){
                       return existingNetwork._id != network._id;
                    });
                    deferred.resolve();
                },
                function(){
                    deferred.reject();
                }
            );

            return deferred.promise;
        }
    };
}]);
