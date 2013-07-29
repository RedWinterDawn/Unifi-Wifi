'use strict';

managedWifi.controller('HelpController',
    function HelpController($scope) {
        $scope.activeHelpItem = "Overview";
        $scope.itemClass = function (item) {
            return $scope.activeHelpItem == item ? "active" : "";
        }
        $scope.setActiveItem = function(item){
            $scope.activeHelpItem = item;
        }

    }
);
