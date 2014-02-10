'use strict';

managedWifi.controller('LoginController',["$scope", "$http", "$location", "$modal", "$routeParams", "unifiLoginService",
    function LoginController($scope, $http, $location, $modal, $routeParams, loginService) {
        $scope.credentials = {};

        var modal = $modal.open({
            templateUrl: 'templates/Login.html',
            scope: $scope,
            backdrop: 'static'
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
