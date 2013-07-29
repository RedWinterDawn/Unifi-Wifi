'use strict';

managedWifi.controller('AccessPointListController',
    function AccessPointListController($scope, $location, accessPointRepository) {
        $scope.accessPoints = accessPointRepository.getAll();
    }
);
