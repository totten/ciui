'use strict';

/**
 * @ngdoc function
 * @name ciuiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ciuiApp
 */
angular.module('ciuiApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
