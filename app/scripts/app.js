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
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
