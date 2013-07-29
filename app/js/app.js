'use strict';

var managedWifi = angular.module('managedWifi', ['ui.bootstrap'])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider.when('/',
            {
                templateUrl: 'templates/AccessPointList.html',
                controller: 'AccessPointListController'
            })
            .when('/networks',
            {
                templateUrl: 'templates/Networks.html',
                controller: 'NetworksController'
            })
            .when('/users',
            {
                templateUrl: 'templates/Users.html',
                controller: 'UsersController'
            })
            .when('/device-report',
            {
                templateUrl: 'templates/DeviceReport.html',
                controller: 'DeviceReportController'
            })
            .when('/user-report',
            {
                templateUrl: 'templates/UserReport.html',
                controller: 'UserReportController'
            })
            .when('/help',
            {
                templateUrl: 'templates/Help.html',
                controller: 'HelpController'
            })
            .when('/login',
            {
                templateUrl: 'templates/Login.html',
                controller: 'LoginController'
            })
            .otherwise({redirectTo: '/'});
    })
    .run(function($location, loginService){
        var l = loginService.isLoggedIn().then(function(){$location.url("/");}, function(){$location.url("/login")});
    })
    ;


