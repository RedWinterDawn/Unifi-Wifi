'use strict';

managedWifi.filter('gridNumber', function($filter){
    var baseFilter = $filter("number");
    return function(num){
        return num ? baseFilter(num) : "-";
    }
});

managedWifi.filter('bytes', function(){
    var kb = 1024;
    var mb = kb * 1024;
    var gb = mb * 1024;
    var tb = gb * 1024;
    var precision = 2;

    return function(bytes){
        if ((bytes >= 0) && (bytes < kb)) {
            return bytes.toFixed(precision) + ' B';

        } else if ((bytes >= kb) && (bytes < mb)) {
            return (bytes / kb).toFixed(precision) + ' KB';

        } else if ((bytes >= mb) && (bytes < gb)) {
            return (bytes / mb).toFixed(precision) + ' MB';

        } else if ((bytes >= gb) && (bytes < tb)) {
            return (bytes / gb).toFixed(precision) + ' GB';

        } else if (bytes >= tb) {
            return (bytes / tb).toFixed(precision) + ' TB';

        } else if(bytes != undefined) {
            return bytes + ' B';
        } else {
            return 0;
        }
    }
})

managedWifi.filter('gridCount', function(){
    return function(arrayToCount){
        return arrayToCount && typeof(arrayToCount == "array") ? arrayToCount.length : "-";
    }
});

managedWifi.filter('slice', function(){
    return function(input, start, count) {
        if (!angular.isArray(input)) return input;

        start = parseInt(start);

        var out = [], i, n;

        // if abs(limit) exceeds maximum length, trim it
        if (start > input.length)
            start = input.length;
        else if (start < -input.length)
            start = -input.length;
        return input.slice(start, start+count);
    }
});

managedWifi.filter('storeItemCount', function(){
    return function(input, callback) {
        if (!angular.isArray(input)) return input;
        callback(input.length);
        return input;
    }
});

managedWifi.filter('sortClass', function(){
    return function(model, property) {
        if(model['orderBy'] == property)
            return "icon-caret-up";
        if(model['orderBy'] == "-"+property)
            return "icon-caret-down";
        return "icon-sort";
    }
});

managedWifi.filter('yesno', function(){
    return function(val) {
        return val == true ? "Yes" : "No";
    }
});

managedWifi.filter('duration', function(){
    return function(seconds) {
        return moment.duration(seconds, 'seconds').humanize();
    }
});

managedWifi.filter('uptime', function(){
    return function(duration) {
        var timeParts = [];
        if (isNaN(duration) || duration == 0) return "0s";
        var times = ["d", "h", "m", "s"],
            seconds = [86400, 3600, 60, 1];
        duration = parseInt(duration);
        for (var i = 0; i < times.length; i++) {
            var f = Math.floor(duration / seconds[i]);
            if (f) {
                timeParts.push(f + times[i]);
                duration %= seconds[i]
            }
            if (timeParts.length > 2) break
        }
        return timeParts.join(" ")
    }
});

managedWifi.filter('signal', function(){
    return function(signal) {
        signal = parseFloat(signal);
        if (!signal) return "N/A";
        if (signal > 45) signal = 45;
        if (signal < 5) signal = 5;
        return ((signal - 5) / 40 * 99).toPrecision(2) + "%"
    }
});

managedWifi.filter('deviceStatus', function(){
    return function(accessPoint) {
        var state, d = accessPoint.uplink || {};
        accessPoint.state = parseInt(accessPoint.state);
        if (isNaN(accessPoint.state)) accessPoint.state = 0;
        if (accessPoint.state == 1) {
            state = "Connected";
            if (!accessPoint.isolated)
                if (d.type == "wire") {
                    if (d.max_speed != d.speed || !d.full_duplex) {
                        state += " (" + d.speed + " " + (d.full_duplex ? "FDX" : "HDX") + ")";
                    }
                } else
                if (d.type == "wireless") state += " (wireless)";
            if (accessPoint.version_incompatible) state += " (needs upgrade)"
        } else if (accessPoint.state == 0) state = "Disconnected";
        else if (accessPoint.state == 3) state = "Pending Upgrade";
        else if (accessPoint.state == 4) state = "Upgrading";
        else if (accessPoint.state == 5) state = "Provisioning";
        else if (accessPoint.state == 2) state = accessPoint["default"] ? accessPoint.discovered_via == "scan" ? "Pending Adoption (wireless)" : "Pending Adoption" : "Managed by Other";
        else if (accessPoint.state == 6) state = "Heartbeat Missed";
        else if (accessPoint.state == 7) {
            state = "Adopting";
            if (d.type == "wireless") state += " (wireless)"
        } else if (accessPoint.state == 8) state = "Deleting";
        else if (accessPoint.state == 9) state = "Managed by Other";
        else if (accessPoint.state == 10) state = "Adoption Failed";
        else if (accessPoint.state == 11) state = "Isolated";
        return state;
    };
});

managedWifi.filter('deviceModel', function(){
    return function(device) {
        var model = device.model;
        if (model == "BZ2") return "UniFi AP";
        else if (model == "BZ2LR") return "UniFi AP-LR";
        else if (model == "U2S48") return "UniFi AP";
        else if (model == "U2L48") return "UniFi AP-LR";
        else if (model == "U2HSR") return "UniFi AP-HSR";
        else if (model == "U2O") return "UniFi AP-Outdoor";
        else if (model == "U5O") return "UniFi AP-Outdoor 5G";
        else if (model == "U7P") return "UniFi AP-Pro";
        else if (model == "U2M") return "UniFi AP-Mini";
        else if (model == "U7E") return "UniFi AP-AC";
        else if (model == "U7O") return "UniFi AP-AC Outdoor";
        else if (model == "p2N") return "PicoStation M2";
        return model;
    };
});

managedWifi.filter('pktsBytes', function(){
    return function(bytes) {
        var e = ["", "K", "M", "G", "T"];
        bytes = parseInt(bytes) || 0;
        for (var a = 0; a < e.length; a++)
            if (bytes < 999.5) return bytes.toPrecision(3) + e[a];
            else
            if (bytes < 1024) return bytes.toFixed(0) + e[a];
            else bytes /= 1024;
        return bytes.toFixed(0) + e[e.length - 1]
    }
});

managedWifi.filter('deviceActivity', function(){
    return function(device) {
        var uplink = device.uplink == undefined ? device : device.uplink;
        var h = uplink.tx_packets || 0,
            p = uplink.tx_bytes || 0,
            w = uplink.rx_packets || 0,
            k = uplink.rx_bytes || 0;
        uplink = (uplink["tx_bytes-r"] || 0) + (uplink["rx_bytes-r"] || 0);
        return uplink;
    }
});

managedWifi.filter('transferRate', function(){
    return function(b){
        return b / 1E3 + "M";
    }
});