managedWifi.factory('unifiNetworkService', ['$q', '$http', 'appSettings', 'messagingService', 'AccessPointService', function ($q, $http, appSettings, messagingService, accessPointService) {

    var allNetworkData = {};
    var networks = null;
    var wlangroups = null;
    var usergroups = null;
    var service = new unifi.WebServiceBase($q, $http, appSettings);

    messagingService.subscribe(managedWifi.messageTopics.service.refresh, function(){
        networks = null;
        wlangroups = null;
        usergroups = null;
        allNetworkData = {};
        messagingService.publishSync(managedWifi.messageTopics.service.refreshComplete.networkService);
    });

    return {
        // Gets all the networks for a site.
        getAll: function () {
            var deferred = $q.defer();

            if(networks == null){
                $http({method: "POST", url: appSettings.apiEndpoint+"/network/groups/wlan"})
                .then(
                    function(response) {
                        wlangroups = response.data.data;
                        allNetworkData.wlangroups = wlangroups;
                    },
                    function(response) {
                        deferred.reject(response);
                    }
                )
                .then(function(){
                    $http({method: "POST", url: appSettings.apiEndpoint+"/network/groups/user"}).then(
                        function(response) {
                            usergroups = response.data.data;
                            allNetworkData.usergroups = usergroups;
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
                            allNetworkData.networks = networks;
                            deferred.resolve(allNetworkData);
                        },
                        function(response) {
                            deferred.reject(response);
                        }
                    );
                });
            } else {
                deferred.resolve(allNetworkData);
            }
            return deferred.promise;
        },

        getProfileById: function(id){
            if(wlangroups == null){
                var self = this;
                return this.getAll().then(function(data){
                    return self.getProfileById(id);
                })
            }
            var deferred = $q.defer();
            var results = wlangroups.filter(function(profile){return profile._id == id});
            if(results.length == 0)
                deferred.reject('Profile not found');
            else
                deferred.resolve(results[0]);
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
            var firstGroup = wlangroups == null ? [] : wlangroups.filter(function(group){return group.attr_no_edit == undefined;});
            if(firstGroup.length > 0) {
                if(network.zeroHandoff){
                	if(network.zeroHandoffRadio == '2G')
                		network.wlangroup_id = firstGroup.filter(function(group){return group.name == "zero-handoff2G";})[0]._id;
                	else
                		network.wlangroup_id = firstGroup.filter(function(group){return group.name == "zero-handoff5G";})[0]._id;
                }
                else{
                    network.wlangroup_id = firstGroup[0]._id;
                }
            }

            var deferred = $q.defer();
            if(usergroups == null || usergroups.length == 0){
            	var self = this;
                return this.getAll().then(function(allNetworkData){
                    return self.add(network);
                });
            }
	        network.usergroup_id = usergroups[0]._id;
	        deferred = $q.defer();
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

        createZeroHandoffGroup: function(networkGroup){
            var copy = angular.copy(networkGroup);
            delete copy.id;
            delete copy._id;
            return service.webServicePostForm("/network/groups/add/wlan", copy);
        },

        changeAllNetworksZeroHandoff: function(zeroHandoff){
        	 if(networks == null || wlangroups == null){
                 var self = this;
                 return this.getAll().then(function(data){
                     return self.changeAllNetworksZeroHandoff(zeroHandoff);
                 })
             }
        	 
            var networkGroupId;
            var firstGroup = wlangroups == null ? [] : wlangroups.filter(function(group){return group.attr_no_edit == undefined;});
            if(firstGroup.length > 0) {
            	if(zeroHandoff){
                    networkGroupId = firstGroup.filter(function(group){return group.name == "zero-handoff";})[0]._id;
            	}
                else
                	networkGroupId = firstGroup[0]._id;
            }
           
            for(var i = 0; i < networks.length; i++){
                networks[i].wlangroup_id = networkGroupId;
                this.update(networks[i]);
            }
            
            accessPointService.getAll().then(
            	function(accessPoints){
            		for(var i = 0; i < accessPoints.length; i++){
        				accessPoints[i].wlangroup_id_ng = networkGroupId;
            	     	accessPoints[i].wlan_overrides = [];
            	     	accessPointService.update(accessPoints[i]);
            		}
            	}
            );
        },

        delete: function(network){
            var deferred = $q.defer();

            service.webServiceDelete("/network/" + network._id).then(
                function(){
                    networks = networks.filter(function(existingNetwork){
                       return existingNetwork._id != network._id;
                    });
                    allNetworkData.networks = networks;
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
