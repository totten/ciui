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
    $routeProvider
      .when('/welcome', {
        templateUrl: 'views/welcome.html',
        controller: 'WelcomeCtrl'
      })
      .when('/tutorials', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/link', {
        templateUrl: 'views/link.html',
        controller: 'LinkCtrl'
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
      if ($location.path() == href) return;
      for (var key in $rootScope.mainTab) {
        $rootScope.mainTab[key] = false;
      }
      $rootScope.mainTab[href] = true;
      $location.url(href);
    };
  });
