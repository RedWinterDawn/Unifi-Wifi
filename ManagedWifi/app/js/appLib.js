'use strict';

managedWifi.createOrderableIp = function(ip){
    if(!angular.isString(ip))
        return ip;

    var parts = ip.split('.');
    var orderableIp = ""
    parts.forEach(function(part){
        orderableIp = orderableIp + ('00'+part).slice(-3) + ".";
    });

    return parseInt(orderableIp.replace(/\./gi,''));
};

managedWifi.createSearchables = function(model, props){
    var searchableStr= '';
    props.forEach(function(prop){ searchableStr = searchableStr + ' ' + model[prop]});
    return searchableStr;
};

managedWifi.paginator = function(defaultOrder){
    var obj = {
        currentPage: 1,
        orderBy: defaultOrder,
        totalItems: 0,
        setOrder: function(property){
            obj.orderBy = obj.orderBy == property ? obj.orderBy = "-"+property : obj.orderBy = property;
        },
        updateTotalItems: function(count){
            obj.totalItems = count
        }
    };
    return obj;
};

managedWifi.randomMinMax = function (min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

managedWifi.randomBool = function () {
    return managedWifi.randomMinMax(0,1) == 1;
};

managedWifi.regExLib = {
    ipAddress: /^[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}$/
};

managedWifi.messageTopics = {
    ui: {
        all: "ui",
        notify: "ui.notify"
    },
    system: {
        all: "system",
        error: "system.error"
    },
    service: {
        all: "service",
        refresh: "service.refresh",
        refreshComplete: {
            all: "service.refreshComplete",
            accessPointService: "service.refreshComplete.accessPointService",
            accessPointUserService: "service.refreshComplete.accessPointUserService",
            networkService: "service.refreshComplete.networkService",
            siteService: "service.refreshComplete.siteService",
            siteSetttingService: "service.refreshComplete.siteSetttingService"
        }
    }
};