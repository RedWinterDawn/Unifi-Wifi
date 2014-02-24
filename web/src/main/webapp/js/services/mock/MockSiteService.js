managedWifi.factory('mockSiteService', ['$q', '$http', 'appSettings', function ($q, $http, appSettings) {

    var sites = [
        {
            "_id" : "529495674f150922d07ca960",
            "accountId" : 1,
            "site_id" : "524930485ae0f4741fc157a8",
            "friendly_name" : "1545 N Canyon Rd",
            "address1" : "1545 N Canyon Rd",
            "city" : "Provo",
            "state" : "UT",
            "zip" : "84604",
            "is_selected" : false
        },
        {
            "_id" : "529495674f150922d07ca961",
            "accountId" : 1,
            "site_id" : "524930485ae0f4741fc157a8",
            "friendly_name" : "Provo Town Center",
            "address1" : "Provo Town Center",
            "city" : "Provo",
            "state" : "UT",
            "zip" : "84601",
            "is_selected" : false
        },
        {
            "_id" : "529495674f150922d07ca962",
            "accountId" : 1,
            "site_id" : "524930485ae0f4741fc157a8",
            "friendly_name" : "575 E Univesity Pwky",
            "address1" : "575 E Univesity Pwky",
            "city" : "Provo",
            "state" : "UT",
            "zip" : "84097",
            "is_selected" : true
        }
    ];

    return {
        getAll: function () {
            var deferred = $q.defer();
            deferred.resolve(sites);
            return deferred.promise;
        },

        selectSite: function() {

        }
    };
}]);
