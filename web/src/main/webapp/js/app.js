'use strict';

var managedWifi = angular.module('managedWifi', ['ui.bootstrap', 'ngRoute', 'ngCookies']);

// used for resolving services, whether they be mocks or device/controller
// specific implementations
managedWifi.resolveServiceAlias = function(names) {
	var obj = {};
	if (angular.isString(names)) names = [names];

	names.forEach(function(name) {
		obj[name] = ['$injector', '$cookies',
			function($injector, $cookies) {
				var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
				var prefix = useMockServices == "true" ? "mock" : "unifi";
				return $injector.get(prefix + name);
			}
		];
	});
	return obj;
};

managedWifi.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/devices', {
				templateUrl: 'templates/AccessPointList.html',
				controller: 'AccessPointListController',
				resolve: managedWifi.resolveServiceAlias("AccessPointService")
			})
			.when('/device/:id?/:tab?', {
				templateUrl: 'templates/AccessPoint.html',
				controller: 'AccessPointController',
				resolve: managedWifi.resolveServiceAlias("AccessPointService")
			})
			.when('/users', {
				templateUrl: 'templates/Users.html',
				controller: 'UsersController',
				resolve: managedWifi.resolveServiceAlias(["AccessPointUserService", "AccessPointService"])
			})
			.when('/user/:id?', {
				templateUrl: 'templates/User.html',
				controller: 'UserController',
				resolve: managedWifi.resolveServiceAlias(["AccessPointUserService", "AccessPointService", "NetworkService"])
			})
			.when('/user/:id?/:tab?', {
				templateUrl: 'templates/User.html',
				controller: 'UserController',
				resolve: managedWifi.resolveServiceAlias(["AccessPointUserService", "AccessPointService", "NetworkService"])
			})
			.when('/profiles', {
				templateUrl: 'templates/Profiles.html',
				controller: 'ProfilesController',
				resolve: managedWifi.resolveServiceAlias(["NetworkService"])
			})
			.when('/profiles/:id?', {
				templateUrl: 'templates/Profile.html',
				controller: 'ProfileController',
				resolve: managedWifi.resolveServiceAlias(["NetworkService"])
			})
			.when('/devices/new', {
				templateUrl: 'templates/Site.html',
				controller: 'SiteSettingsController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "SiteService"])
			})
			.when('/help', {
				templateUrl: 'templates/Help.html',
				controller: 'HelpController'
			})
			.when('/login', {
				templateUrl: 'templates/Blank.html',
				controller: 'LoginController'
			})
			.when('/oauth2&:code?', {
				templateUrl: 'templates/Blank.html',
				controller: 'PortalApiController'
			})
			.when('/oauth2/:code?', {
				templateUrl: 'templates/Blank.html',
				controller: 'Oauth2Controller'
			})
			.when('/error', {
				templateUrl: 'templates/Blank.html',
				controller: 'ErrorController'
			})
			.when('/settings', {
				templateUrl: 'templates/SiteSettings.html',
				controller: 'SiteSettingsController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "SiteService"])
			})
			.when('/settings/:tab?', {
				templateUrl: 'templates/SiteSettings.html',
				controller: 'SiteSettingsController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "SiteService"])
			})
			.when('/newsite', {
				templateUrl: 'templates/NewSite.html',
				controller: 'NewSiteController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "SiteService"])
			})
			.when('/networks', {
				templateUrl: 'templates/Networks.html',
				controller: 'NetworksController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "NetworkService"])
			})
			.when('/networks/new', {
				templateUrl: 'templates/Network.html',
				controller: 'NetworkController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "NetworkService"])
			})
			.when('/networks/:id?', {
				templateUrl: 'templates/Network.html',
				controller: 'NetworkController',
				resolve: managedWifi.resolveServiceAlias(["SiteSettingsService", "NetworkService"])
			})
			.otherwise({
				redirectTo: "/networks"
			});
		$locationProvider.html5Mode(false);
	}
])
	.run(["$location", "$cookies", "notificationService", "jiveLoginService", 'siteService',
		function($location, $cookies, notificationService, loginService, siteService) {
			if ($location.search().mock != undefined)
				$cookies.useMockServices = $location.search().mock;

    if(managedWifi.parseQuery().pbxid != null){
    	console.log("pbxid exists");
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
                                $location.url(isAdmin ? '/newsite' : '/error')
                        }
                    );
                }
            )
        },
        function(){
//            notificationService.error("login", "We're sorry, but an error occurred while authorizing your login. You may reload this page and try again.")
        }
    );
}]);

managedWifi.factory('siteService', ['$cookies', '$injector',
	function($cookies, $injector) {
		var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
		var prefix = useMockServices == "true" ? "mock" : "unifi";
		return $injector.get(prefix + "SiteService");
	}
]);

managedWifi.factory('networkService', ['$cookies', '$injector',
	function($cookies, $injector) {
		var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
		var prefix = useMockServices == "true" ? "mock" : "unifi";
		return $injector.get(prefix + "NetworkService");
	}
]);

managedWifi.factory('AccessPointService', ['$cookies', '$injector',
	function($cookies, $injector) {
		var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
		var prefix = useMockServices == "true" ? "mock" : "unifi";
		return $injector.get(prefix + "AccessPointService");
	}
]);

managedWifi.factory('loginService', ['$cookies', '$injector',
	function($cookies, $injector) {
		var useMockServices = $cookies.useMockServices != undefined ? $cookies.useMockServices : false;
		var prefix = useMockServices == "true" ? "mock" : "jive";
		return $injector.get(prefix + "LoginService");
	}
]);
