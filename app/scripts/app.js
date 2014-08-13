'use strict';

/**
 * @ngdoc overview
 * @name ciuiApp
 * @description
 * # ciuiApp
 *
 * Main module of the application.
 */
angular
  .module('ciuiApp', [
    'ui.bootstrap',
    'ngRoute'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider
      .html5Mode(true)
      .hashPrefix('!')
    ;
    $routeProvider
      .when('/welcome', {
        templateUrl: 'views/welcome.html',
        controller: 'WelcomeCtrl'
      })
      .when('/tutorials', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/todo', {
        templateUrl: 'views/todo.html',
        controller: 'TodoCtrl'
      })
      .otherwise({
        redirectTo: '/tutorials'
      })
    ;
  })
  .run(function ($rootScope, $location) {
    $rootScope.mainTab = {};
    $rootScope.mainTab[$location.path()] = 1;
    $rootScope.gotoPage = function (href) {
      for (var key in $rootScope.mainTab) {
        $rootScope.mainTab[key] = false;
      }
      $rootScope.mainTab[href] = true;
      $location.path(href);
    };
  });
