'use strict'

managedWifi.controller('PortalApiController', ["$scope", "$http", "$location", "$modal", "jiveLoginService", "notificationService",
	function PortalApiController($scope, $http, $location, $modal, loginService, notificationService) {
	
    console.log("PortalApiController");

	$modal.open({
            templateUrl: 'templates/ProcessingLogin.html',
            scope: $scope,
            backdrop: 'static'
        });

	// get info from portal api for user
        var params = managedWifi.parseQuery();
        if(params.access_token && params.inflightRequest){
            console.log(params);
            loginService.oauthReceive(params.access_token, params.inflightRequest).then(loginService.isAdmin).then(
                function(response){
                    console.log(response);
                    var location = managedWifi.getLocation(window.location.href);
                    window.location.href = location.pathname + "#/devices";
                    window.location.reload();
		},
                function(){
                    notificationService.error("login", "We're sorry, but an error occurred while authorizing your login. Please ensure you are browsing to this app from the Jive portal.");
                }
            );
        }
	}
])
