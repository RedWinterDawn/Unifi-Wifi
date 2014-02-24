managedWifi.factory('mockAccessPointUserService',['$q', function ($q) {
    var users = null;

    return {
        getAll: function () {
            var deferred = $q.defer();

            if(users == null){
                users = [];
                for(var i=0;i<250;i++){
                    users.push({
                        ap_mac: "dc:9f:db:82:29:"+ ('0'+i).slice(-2),
                        authorized: managedWifi.randomBool(),
                        essid: "network"+managedWifi.randomMinMax(1, 10),
                        hostname: "laptop"+managedWifi.randomMinMax(1, 10000),
                        ip: "192.168.1."+i,
                        is_guest: managedWifi.randomBool(),
                        last_seen: 1384549980,
                        mac: "88:32:9b:05:1e:"+ ('0'+i).slice(-2),
                        noise: -managedWifi.randomMinMax(1, 100),
                        rssi: managedWifi.randomMinMax(1, 50),
                        rx_bytes: managedWifi.randomMinMax(1, 10000000000),
                        state: 15,
                        tx_bytes: managedWifi.randomMinMax(1, 10000000000),
                        uptime: managedWifi.randomMinMax(1, 10000000),
                        user_id: i,
                        blocked: managedWifi.randomBool()
                    })
                }
            }
            deferred.resolve(users);
            return deferred.promise;
        },

        blockUser: function(userId, shouldBlock){
            var deferred = $q.defer();
            var found = users.filter(function(user){return user._id == userId && user.blocked != shouldBlock;});
            if(found[0]){
                found[0] = shouldBlock;
                deferred.resolve();
            } else {
                deferred.reject();
            }

            return deferred.promise;
        }
    };
}]);
