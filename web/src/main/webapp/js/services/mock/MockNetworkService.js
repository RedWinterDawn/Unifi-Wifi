managedWifi.factory('mockNetworkService',['$q', function ($q) {
    var networks = null;

    return {
        getAll: function () {
            var deferred = $q.defer();
            if(networks == null){
                networks = [];
                for(var i=0;i<10;i++){
                    networks.push({
                        _id: i,
                        enabled: managedWifi.randomBool(),
                        hide_ssid: managedWifi.randomBool(),
                        is_guest: managedWifi.randomBool(),
                        name: "wlan"+ ('0'+i).slice(-2),
                        security: managedWifi.randomBool() ? "wpapsk" : "wep",
                        vlan: "",
                        vlan_enabled: false,
                        wpa_enc: "ccmp",
                        wpa_mode: "auto",
                        x_passphrase: "pass@word1"
                    })
                }
            }
            deferred.resolve(networks);
            return deferred.promise;
        },

        getById: function(id){
            if(networks == null){
                this.getAll().then(function(data){
                    return this.getById(id);
                })
            }
            var deferred = $q.defer();
            var results = networks.filter(function(network){return network._id == id});
            if(results.length == 0)
                throw new Error('Network not found');
            deferred.resolve(results[0]);
            return deferred.promise;
        },

        update: function(network){
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        },

        delete: function(){
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }

    };
}]);
