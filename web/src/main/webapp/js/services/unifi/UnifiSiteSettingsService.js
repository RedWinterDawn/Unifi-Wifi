managedWifi.factory('unifiSiteSettingsService', ['$q', '$http', 'appSettings', 'messagingService', function ($q, $http, appSettings, messagingService) {

    var settings = null;
    var service = new unifi.WebServiceBase($q, $http, appSettings);

    messagingService.subscribe(managedWifi.messageTopics.service.refresh, function(){
        settings = null;
        messagingService.publishSync(managedWifi.messageTopics.service.refreshComplete.siteSetttingService);
    });

    return {
        getAll: function () {
            var deferred = $q.defer();

            if(settings == null){
                settings = [];
                $http({method: "POST", url: appSettings.apiEndpoint+"/network/groups/user"})
                .then(
                    function(response){
                        var userGroup = response.data.data[0];
                        userGroup.key = 'limits';
                        if(userGroup.qos_rate_max_down != undefined)
                            userGroup.qos_rate_max_down = parseInt(userGroup.qos_rate_max_down);
                        if(userGroup.qos_rate_max_up != undefined)
                            userGroup.qos_rate_max_up = parseInt(userGroup.qos_rate_max_up);
                        settings.push(userGroup);
                    },
                    function(response) {
                        deferred.reject(response);
                    }
                )
                .then(
                    function(response){
                        $http.get(appSettings.apiEndpoint+"/site-setting").then(
                            function(response) {
                                settings = settings.concat(response.data.data.filter(function(setting){return setting.key == 'guest_access';}));
                                deferred.resolve(settings);
                            },
                            function(response) {
                                deferred.reject(response);
                            }
                        );
                    },
                    function(response) {
                        deferred.reject(response);
                    }
                );
            } else {
                deferred.resolve(settings);
            }
            return deferred.promise;
        },

        getBySiteId: function(id){
            if(settings == null){
                var self = this;
                return this.getAll().then(function(data){
                    return self.getBySiteId(id);
                })
            }
            var deferred = $q.defer();
            var results = settings.filter(function(setting){return setting.site_id == id});
            if(results.length == 0)
                deferred.reject('Site setting not found');
            else
                deferred.resolve(results[0]);
            return deferred.promise;
        },

        update: function(setting){
            var copy = angular.copy(setting);
            delete copy.id;
            delete copy._id;
            return service.webServicePostForm("/site-setting/", copy);
        }

    };
}]);
