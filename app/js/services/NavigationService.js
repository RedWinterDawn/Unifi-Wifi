managedWifi.factory('navigationService', function () {
    var controllerNavMapping = {
        AccessPointListController : "Devices",
        NetworksController : "Networks",
        UsersController : "Users",
        DeviceReportController : "DeviceReport",
        UserReportController : "UserReport",
        HelpController : "Help",
        LoginController : "Login"
    }

    return {
        getActiveMainNav: function(controller){
            if(controller == "DeviceReportController" || controller == "UserReportController"){
                return "Reports";
            }
            return controllerNavMapping[controller];
        },
        getActiveSubNav: function(controller){
            return controllerNavMapping[controller];
        }
    }
});
