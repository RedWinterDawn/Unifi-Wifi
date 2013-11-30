managedWifi.factory('mockAccessPointService', ['$q',function ($q) {

    var accessPoints = null;

    return {
        getAll: function () {
            var deferred = $q.defer();

            if(accessPoints == null){
                accessPoints = [];
                for(var i=0;i<250;i++){
                    accessPoints.push({
                        _id: i,
                        name: "access point "+i,
                        mac: "dc:9f:db:82:29:"+ ('0'+i).slice(-2),
                        ip: "192.0.0."+managedWifi.randomMinMax(1, 250),
                        state: managedWifi.randomMinMax(1, 2),
                        model: "model"+managedWifi.randomMinMax(1, 1000),
                        'user-num_sta' : managedWifi.randomMinMax(1, 1000),
                        tx_bytes: managedWifi.randomMinMax(1, 10000000000),
                        rx_bytes: managedWifi.randomMinMax(1, 10000000000),
                        adopted: true,
                        "default": true,
                        "uptime": 233425,
                        "config_network": {
                            "ip": "192.168.1.112",
                            "type": "dhcp"
                        },
                        stat: {
                            "_id": "524930c191187abca6207a05",
                            "ap": "dc:9f:db:82:29:0f",
                            "bytes": 123285725,
                            "ng-rx_bytes": 6406548,
                            "ng-rx_packets": 48523,
                            "ng-time_delta": 2768996131,
                            "ng-tx_bytes": 116879177,
                            "ng-tx_dropped": 178315,
                            "ng-tx_packets": 181008,
                            "o": "ap",
                            "rx_bytes": 6406548,
                            "rx_packets": 48523,
                            "site_id": "524930485ae0f4741fc157a8",
                            "time_delta": 2768996131,
                            "tx_bytes": 116879177,
                            "tx_dropped": 178315,
                            "tx_packets": 181008,
                            "uplink-rx_bytes": 134016033,
                            "uplink-rx_packets": 455016,
                            "uplink-time_delta": 1384570334,
                            "uplink-tx_bytes": 108547749,
                            "uplink-tx_packets": 258830,
                            "user-ng-rx_bytes": 6406548,
                            "user-ng-rx_packets": 48523,
                            "user-ng-time_delta": 2768996131,
                            "user-ng-tx_bytes": 116879177,
                            "user-ng-tx_dropped": 178315,
                            "user-ng-tx_packets": 181008,
                            "user-rx_bytes": 6406548,
                            "user-rx_packets": 48523,
                            "user-time_delta": 2768996131,
                            "user-tx_bytes": 116879177,
                            "user-tx_dropped": 178315,
                            "user-tx_packets": 181008
                        },
                        "uplink": {
                            "full_duplex": true,
                            "ip": "0.0.0.0",
                            "mac": "dc:9f:db:82:29:0f",
                            "max_speed": 100,
                            "name": "eth0",
                            "num_port": 1,
                            "rx_bytes": 117529650,
                            "rx_dropped": 0,
                            "rx_errors": 0,
                            "rx_multicast": 12062,
                            "rx_packets": 287910,
                            "speed": 100,
                            "tx_bytes": 63992134,
                            "tx_dropped": 0,
                            "tx_errors": 0,
                            "tx_packets": 164246,
                            "type": "wire",
                            "up": true
                        }
                    })
                }
            }
            deferred.resolve(accessPoints);
            return deferred.promise;
        },

        getById: function(id){
            if(accessPoints == null){
                this.getAll().then(function(data){
                    return this.getById(id);
                })
            }
            var deferred = $q.defer();
            var results = accessPoints.filter(function(accessPoint){return accessPoint._id == id});
            if(results.length == 0)
                throw new Error('Access point not found');
            deferred.resolve(results[0]);
            return deferred.promise;
        },

        update: function(accessPoint){
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        },

        adopt: function(accessPoint){
            accessPoints
                .filter(function(ap){return ap._id == accessPoint._id;})
                .forEach(function(ap){ap.state = 1; ap.adopted = true;})
            ;

            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        },

        delete: function(accessPoint){
            accessPoints = accessPoints.filter(function(ap){return ap._id != accessPoint._id;});
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    };
}]);
