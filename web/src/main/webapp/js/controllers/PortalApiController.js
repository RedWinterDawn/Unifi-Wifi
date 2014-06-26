'use strict'

managedWifi.controller('PortalApiController', ["$scope", "$http", "$location", "jiveLoginService",
	function PortalApiController($scope, $http, $location, loginService) {

		 // get info from portal api for user
        var params = managedWifi.parseQuery();
        if(params.access_token && params.inflightRedirect){
            loginService.oauthReceive(params.access_token, params.inflightRedirect).then(loginService.isAdmin).then(
                function(response){
                    var location = managedWifi.getLocation(window.location.href);
                    window.location.href = location.pathname + "#/devices";
                },
                function(){
                    notificationService.error("login", "We're sorry, but an error occurred while authorizing your login. Please ensure you are browsing to this app from the Jive portal.");
                }
            );
        }
	}
])