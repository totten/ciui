'use strict';

/**
 * @ngdoc function
 * @name ciuiApp.directives:prettyprint
 * @description
 *
 */
angular.module('ciuiApp')
  .directive('prettyprint', function ($parse) {
    return {
      restrict: 'C',
      link: function postLink(scope, element, attrs) {
        element.html(prettyPrintOne($parse(attrs.prettyprintCode)(scope)));
        scope.$watch(attrs.prettyprintCode, function(){
          element.html(prettyPrintOne($parse(attrs.prettyprintCode)(scope)));
        });
      }
    };
  });