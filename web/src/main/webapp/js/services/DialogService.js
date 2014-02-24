managedWifi.factory('dialogService', ['$modal', function ($modal) {
    return {
        confirm: function(model){
            return $modal.open({
                templateUrl: 'templates/ConfirmationDialog.html',
                controller: 'ConfirmDialogController',
                resolve: { model: function(){return model;}}
            });
        }
    }
}]);
