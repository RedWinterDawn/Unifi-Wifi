'use strict';

managedWifi.filter('deviceStatus', function() {
    return function(device) {
        if(device.state){
            switch(device.state){
                case 1:
                    return "Active";
                case 5:
                    return "Provisioning";
            }
        }
        return "Inactive";
    }
});

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
            return bytes + ' B';

        } else if ((bytes >= kb) && (bytes < mb)) {
            return (bytes / kb).toFixed(precision) + ' KB';

        } else if ((bytes >= mb) && (bytes < gb)) {
            return (bytes / mb).toFixed(precision) + ' MB';

        } else if ((bytes >= gb) && (bytes < tb)) {
            return (bytes / gb).toFixed(precision) + ' GB';

        } else if (bytes >= tb) {
            return (bytes / tb).toFixed(precision) + ' TB';

        } else {
            return bytes + ' B';
        }
    }
})

managedWifi.filter('gridCount', function(){
    return function(arrayToCount){
        return arrayToCount && typeof(arrayToCount == "array") ? arrayToCount.length : "-";
    }
});
