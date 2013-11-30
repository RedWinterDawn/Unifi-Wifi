'use strict';

managedWifi.controller('ConfirmDialogController', ["$scope", "$modalInstance", "model",
    function ConfirmDialogController($scope, $modalInstance, model) {

        $scope.okText = model.okText == undefined ? "Confirm" : model.okText;
        $scope.cancelText = model.cancelText == undefined ? "Cancel" : model.cancelText;
        $scope.title = model.title;
        $scope.msg = model.msg;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }
]);
