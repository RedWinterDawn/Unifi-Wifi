'use strict';

managedWifi.controller('ErrorController',["$scope", "$http", "$location", "$modal", "$routeParams",
    function ErrorController($scope, $http, $location, $modal, $routeParams) {
        $scope.msg = "The account/PBX you are accessing has not been set up. Please contact us so we may complete the setup.";
        $modal.open({
            templateUrl: 'templates/Error.html',
            scope: $scope,
            backdrop: 'static'
        });
    }
]);

