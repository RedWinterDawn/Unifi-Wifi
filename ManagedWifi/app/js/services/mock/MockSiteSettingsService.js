managedWifi.factory('mockSiteSettingsService', ['$q', '$http', 'appSettings', function ($q, $http, appSettings) {

    var settings = [
        {
            "_id": "524930485ae0f4741fc157b3",
            "allowed_subnet_1": null,
            "auth": "password",
            "authorize_use_sandbox": false,
            "custom_ip": "",
            "expire": "480",
            "gateway": "paypal",
            "key": "guest_access",
            "merchantwarrior_use_sandbox": false,
            "payment_enabled": false,
            "paypal_use_sandbox": false,
            "portal_customized": false,
            "portal_enabled": true,
            "portal_hostname": "",
            "portal_use_hostname": false,
            "redirect_enabled": false,
            "redirect_url": "",
            "restricted_subnet_1": "192.168.0.0/16",
            "restricted_subnet_2": "172.16.0.0/12",
            "restricted_subnet_3": "10.0.0.0/8",
            "restricted_subnet_4": null,
            "show_tou": "false",
            "site_id": "524930485ae0f4741fc157a8",
            "tou": "Term of Use",
            "voucher_enabled": false,
            "x_authorize_loginid": "",
            "x_authorize_transactionkey": "",
            "x_merchantwarrior_apikey": "",
            "x_merchantwarrior_apipassphrase": "",
            "x_merchantwarrior_merchantuuid": "",
            "x_password": "blah",
            "x_paypal_password": "",
            "x_paypal_signature": "",
            "x_paypal_username": "",
            "x_quickpay_md5secret": "",
            "x_quickpay_merchantid": "",
            "x_stripe_api_key": ""
        },
        {
            "_id": "524930485ae0f4741fc157b4",
            "attr_hidden_id": "Default",
            "attr_no_delete": true,
            "name": "Default",
            "qos_rate_max_down": -1,
            "qos_rate_max_up": -1,
            "site_id": "524930485ae0f4741fc157a8",
            "key": "limits"
        }
    ];

    return {
        getAll: function () {
            var deferred = $q.defer();
            deferred.resolve(settings);
            return deferred.promise;
        },

        getBySiteId: function(id){
            var deferred = $q.defer();
            var results = settings.filter(function(setting){return setting.site_id == id});
            if(results.length == 0)
                throw new Error('Site setting not found');
            deferred.resolve(results[0]);
            return deferred.promise;
        },

        update: function(network){
        }

    };
}]);
