'use strict';

managedWifi.controller('LoginController',["$scope", "$http", "$location", "$modal", "$routeParams", "unifiLoginService",
    function LoginController($scope, $http, $location, $modal, $routeParams, loginService) {
        $scope.credentials = {};
        console.log("LoginController");
        var modal = $modal.open({
            templateUrl: 'templates/Login.html',
            scope: $scope,
            backdrop: 'static'
        });
        modal.result.then(function(){$location.url("/");});

        $scope.login = function(){
            console.log("Login");
            console.log($scope.credentials.username + ":" + $scope.credentials.password);
            loginService.login($scope.credentials.username, $scope.credentials.password)
                .then(
                function(data){
                    console.log(data);
                    modal.close();
                },
                function(data){
                    $scope.showError = true;
                }
            )
        };

    }]
);
