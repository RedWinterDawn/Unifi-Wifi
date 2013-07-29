'use strict';

managedWifi.controller('LoginController',
    function LoginController($scope, $http, $location, appSettings, loginService) {

        $scope.modalOpts = {
            backdropFade: true,
            dialogFade:true,
            keyboard: false,
            backdropClick: false
        };

        $scope.showLogin = true;
        $scope.showError = false;

        $scope.login = function(){
            var q = loginService.login($scope.username, $scope.password).then(
                function(data){
                    $scope.showLogin = false;
                    $location.url("/");
                },
                function(data){
                    $scope.showError = true;
                });
        }
    }
);
