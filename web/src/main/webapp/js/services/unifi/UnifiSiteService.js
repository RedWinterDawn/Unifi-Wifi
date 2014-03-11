managedWifi.factory('unifiSiteService', ['$q', '$http', 'appSettings', 'messagingService', function ($q, $http, appSettings, messagingService) {

    var sites = null;

    messagingService.subscribe(managedWifi.messageTopics.service.refresh, function(){
        sites = null;
        messagingService.publishSync(managedWifi.messageTopics.service.refreshComplete.siteService);
    });

    return {
        getAll: function () {
            var deferred = $q.defer();
            if(sites == null){
                $http({method: "GET", url: appSettings.apiEndpoint+"/site"}).then(
                    function(response){
                        sites = response.data;
                        deferred.resolve(sites);
                    },
                    function(response) {
                        sites = [];
                        deferred.reject(response);
                    }
                )
            } else {
                deferred.resolve(sites);
            }
            return deferred.promise;
        },

        getById: function (id) {
            var deferred = $q.defer();

            $http({method: "GET", url: appSettings.apiEndpoint+"/site/"+id}).then(
                function(response){
                    deferred.resolve(response.data);
                },
                function(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        },

        update: function(site){
            return $http.post(appSettings.apiEndpoint+"/site/"+site.site_id, site);
        },

        add: function(site){
            return $http.put(appSettings.apiEndpoint+"/site", site).then(function(response) {
                site.site_id = response.data;
                sites.push(site)
            });
        },

        delete: function(site){
            return $http.delete(appSettings.apiEndpoint+"/site/"+site.site_id, site).then(function(response) {
                sites = _.reject(sites, function(s) {
                    return s.site_id === site.site_id;
                });
            });
        },

        selectSite: function(site){
            return $http.post(appSettings.apiEndpoint+"/site/active", {site_id: site.site_id})
                .then(function(){
                    messagingService.publish(managedWifi.messageTopics.service.refresh);
                }
            );
        }
    };
}]);
