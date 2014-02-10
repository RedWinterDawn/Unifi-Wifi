'use strict';

managedWifi.controller('Oauth2Controller',["$scope", "$http", "$location", "$modal", "$routeParams", "notificationService", "jiveLoginService",
    function Oauth2Controller($scope, $http, $location, $modal, $routeParams, notificationService, loginService) {
        $scope.credentials = {};

        $modal.open({
            templateUrl: 'templates/ProcessingLogin.html',
            scope: $scope,
            backdrop: 'static'
        });

        var account = managedWifi.parseQuery().pbx;
        if(account != null){
            loginService.isLoggedIn().then(
                function(){
                    loginService.logout();
                    loginService.login(account);
                },
                function(){
                    loginService.login(account);
                }
            )
        }

        var params = managedWifi.parseQuery();
        if(params.code && params.state){
            loginService.oauthReceive(params.code, params.state).then(loginService.isAdmin).then(
                function(response){
                    var location = managedWifi.getLocation(window.location.href);
                    window.location.href = location.pathname + "#/devices";
                },
                function(){
                    notificationService.error("login", "We're sorry, but an error occurred while authorizing your login. You may reload this page and try again.");
                }
            );
        }
    }
]);

