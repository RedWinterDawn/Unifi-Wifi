'use strict';

var managedWifi = angular.module('managedWifi', ['ui.bootstrap', 'ngRoute', 'ngCookies']);

// used for resolving services, whether they be mocks or device/controller specific implementations
managedWifi.resolveServiceAlias = function(names){
    var obj = {};
    if(angular.isString(names)) names = [names];

    names.forEach(function(name){
        obj[name] = ['$injector', '$cookies', function($injector, $cookies){
            var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
            var prefix = useMockServices == "true" ? "mock" : "unifi";
            return $injector.get(prefix+name);
        }];
    });
    return obj;
};

managedWifi.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/devices',
        {
            templateUrl: 'templates/AccessPointList.html',
            controller: 'AccessPointListController',
            resolve: managedWifi.resolveServiceAlias("AccessPointService")
        })
        .when('/device/:id?',
        {
            templateUrl: 'templates/AccessPoint.html',
            controller: 'AccessPointController',
            resolve: managedWifi.resolveServiceAlias("AccessPointService")
        })
        .when('/networks',
        {
            templateUrl: 'templates/Networks.html',
            controller: 'NetworksController',
            resolve: managedWifi.resolveServiceAlias("NetworkService")
        })
        .when('/network/:id?',
        {
            templateUrl: 'templates/Network.html',
            controller: 'NetworkController',
            resolve: managedWifi.resolveServiceAlias("NetworkService")
        })
        .when('/users',
        {
            templateUrl: 'templates/Users.html',
            controller: 'UsersController',
            resolve: managedWifi.resolveServiceAlias(["AccessPointUserService", "AccessPointService"])
        })
        .when('/user/:id?',
        {
            templateUrl: 'templates/User.html',
            controller: 'UserController',
            resolve: managedWifi.resolveServiceAlias(["AccessPointUserService", "AccessPointService", "NetworkService"])
        })
        .when('/sites',
        {
            templateUrl: 'templates/Sites.html',
            controller: 'SitesController',
            resolve: managedWifi.resolveServiceAlias(["SiteService"])
        })
        .when('/site/:id?',
        {
            templateUrl: 'templates/Site.html',
            controller: 'SiteController',
            resolve: managedWifi.resolveServiceAlias(["SiteService"])
        })
        .when('/help',
        {
            templateUrl: 'templates/Help.html',
            controller: 'HelpController'
        })
        .when('/login',
        {
            templateUrl: 'templates/Blank.html',
            controller: 'LoginController'
        })
        .when('/oauth2/:code?',
        {
            templateUrl: 'templates/Blank.html',
            controller: 'Oauth2Controller'
        })
        .when('/error',
        {
            templateUrl: 'templates/Blank.html',
            controller: 'ErrorController'
        })
        .when('/settings',
        {
            templateUrl: 'templates/SiteSettings.html',
            controller: 'SiteSettingsController',
            resolve: managedWifi.resolveServiceAlias(["SiteSettingsService"])
        })
        .otherwise({redirectTo: "/devices"});
    $locationProvider.html5Mode(false);
}])
.run(["$location", "$cookies", "notificationService", "jiveLoginService", 'siteService', function($location, $cookies, notificationService, loginService, siteService){
    if($location.search().mock != undefined)
        $cookies.useMockServices = $location.search().mock;

    if($location.url() == "/oauth2")
        return;

    if(managedWifi.parseQuery().pbxid != null){
        $location.url('/oauth2');
        return;
    }

    loginService.isLoggedIn().then(
        function(){
            loginService.isAdmin().then(
                function(isAdmin){
                    siteService.getAll().then(
                        function(sites){
                            if(sites.length == 0)
                                $location.url(isAdmin ? '/sites' : '/error')
                        }
                    );
                }
            )
        },
        function(){
            notificationService.error("login", "We're sorry, but an error occurred while authorizing your login. You may reload this page and try again.")
        }
    );
}])
;

managedWifi.factory('siteService', ['$cookies','$injector', function($cookies, $injector) {
    var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
    var prefix = useMockServices == "true" ? "mock" : "unifi";
    return $injector.get(prefix+"SiteService");
}]);

managedWifi.factory('loginService', ['$cookies','$injector', function($cookies, $injector) {
    var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
    var prefix = useMockServices == "true" ? "mock" : "jive";
    return $injector.get(prefix+"LoginService");
}]);
