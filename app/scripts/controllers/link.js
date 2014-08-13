'use strict';

/**
 * @ngdoc function
 * @name ciuiApp.controller:LinkCtrl
 * @description
 * # LinkCtrl
 * Controller of the ciuiApp
 */
angular.module('ciuiApp')
  .controller('LinkCtrl', function ($scope, $location) {
    $scope.exampleUrl = $location.absUrl().replace('/link', "/tutorials?useCase=review&codeReview.path=sites/all/modules/othermodule");
  });