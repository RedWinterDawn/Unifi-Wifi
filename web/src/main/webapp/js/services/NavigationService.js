managedWifi.factory('navigationService', function () {
    var controllerNavMapping = {
        AccessPointListController : "Devices",
        NetworksController : "Networks",
        UsersController : "Users",
        HelpController : "Help",
        LoginController : "Login",
        NetworkController : "Networks",
        UserController : "Users",
        AccessPointController : "Devices",
        SiteSettingsController : "Settings",
        SitesController : "Sites"
    }

    return {
        getActiveMainNav: function(controller){
            return controllerNavMapping[controller];
        },
        getActiveSubNav: function(controller){
            return controllerNavMapping[controller];
        }
    }
});
