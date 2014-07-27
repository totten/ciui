'use strict';

/**
 * @ngdoc function
 * @name ciuiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ciuiApp
 */
angular.module('ciuiApp')
  .controller('MainCtrl', function ($scope) {
    $scope.cfg = {
      algo: 'sched',
      build: 'buildkit',

      buildKit: {
        type: 'drupal-clean',
        name: 'mytest'
      },

      testCiviPhpunit: true,
      civiPhpunitTest: 'CRM_AllTests',

      testCiviUpgradeTest: false,
      upgradeTestVersions: '4.2.0* 4.3.0*',

      testSimpleTest: false,
      simpleTest: "TODO"
    };

    $scope.algoName = function () {
      switch ($scope.cfg.algo) {
        case 'inst':
          return 'basicInstall';
        case 'sched':
          return 'onScheduledStart';
        case 'review':
          return 'onSubmitPatch';
      }
    };

    $scope.civiRoot = function () {
      switch ($scope.cfg.build) {
        case 'buildkit':
          return '~/src/buildkit/build/mytest/sites/all/modules/civicrm';
        case 'drush':
          return "/var/www/mytest/sites/all/modules/civicrm";
        case 'wpcli':
          return "/var/www/mytest/wp-content/plugins/civicrm/civicrm";
      }
    };

    $scope.junitDir = function () {
      return '$WORKDIR/junit';
    };

    $scope.downloadApplication = function () {
      switch ($scope.cfg.build) {
        case 'buildkit':
          return 'civibuild download mytest \\\n' +
            '  --type ' + $scope.cfg.buildKit.type;
        case 'drush':
          return "drush -y make --working-copy \\\n" +
            "  myfile.make /var/www/mytest";
        case 'wpcli':
          return "mkdir /var/www/mytest\n" +
            "cd /var/www/mytest\nwp core download";
      }
    };

    $scope.applyPatch = function () {
      return "pushd " + $scope.civiRoot() + "\n" +
        "  git checkout thepatch\n" +
        "popd"
    };

    $scope.installApplication = function () {
      switch ($scope.cfg.build) {
        case 'buildkit':
          return 'civibuild install mytest \\\n' +
            '  --url http://localhost:8000 \\\n' +
            '  --admin-pass s3cr3t';
        case 'drush':
          return "drush site-install \\\n" +
            "  myfile.make \\\n" +
            "  /var/www/mytest\n" +
            "";
        case 'wpcli':
          return "mkdir /var/www/mytest\n" +
            "cd /var/www/mytest\n" +
            "wp core download";
      }
    };

    $scope.executeTests = function () {
      var r = '';
      if ($scope.cfg.testCiviPhpunit) {
        r = r + 'pushd ' + $scope.civiRoot() + "/tools\n";
        r = r + "  ./scripts/phpunit --log-junit=" + $scope.junitDir() + "/civi-phpunit.xml \\\n" +
          "    " + $scope.cfg.civiPhpunitTest + "\n";
        r = r + "popd\n";
      }
      if ($scope.cfg.testCiviUpgradeTest) {
        if ($scope.cfg.build == 'buildkit') {
          r = r + "civibuild upgrade-test mytest " + $scope.cfg.upgradeTestVersions + "\n";
        }
        else {
          r = r + "## skipped: CiviCRM UpgradeTest does not work with " + $scope.cfg.build + "\n";
        }
      }
      if ($scope.cfg.testSimpleTest) {
        if ($scope.cfg.build == 'buildkit' || $scope.cfg.build == 'drush') {
          r = r + 'TODO drush test...'
        }
        else {
          r = r + "## skipped: Drupal SimpleTest does not work with " + $scope.cfg.build + "\n";
        }
      }
      return r;
    };
  });
