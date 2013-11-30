'use strict';

managedWifi.controller('LoginController',["$scope", "$http", "$location", "$modal", "unifiLoginService",
    function LoginController($scope, $http, $location, $modal, loginService) {
        $scope.credentials = {};

        var modal = $modal.open({
            templateUrl: 'templates/Login.html',
            scope: $scope
        });
        modal.result.then(function(){$location.url("/");});

        $scope.login = function(){
            loginService.login($scope.credentials.username, $scope.credentials.password)
                .then(
                function(data){
                    modal.close();
                },
                function(data){
                    $scope.showError = true;
                }
            )
        };

    }]
);
