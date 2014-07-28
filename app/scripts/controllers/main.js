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
    var cfg = {
      algo: 'sched',
      build: 'buildkit',

      buildkit: {
        dir: '/srv/buildkit',
        type: 'drupal-clean',
        name: 'mytest'
      },

      civiPhpunit: {
        enable: true,
        test: 'CRM_AllTests'
      },

      civiUpgradeTest: {
        enable: false,
        versions: '4.2.0* 4.3.0*'
      },

      simpleTest: {
        enable: false,
        test: "TODO"
      }
    };
    $scope.cfg = cfg;

    $scope.algoName = function () {
      switch (cfg.algo) {
        case 'inst':
          return 'basicInstall';
        case 'sched':
          return 'onScheduledStart';
        case 'review':
          return 'onSubmitPatch';
      }
    };

    $scope.civiRoot = function () {
      switch (cfg.build) {
        case 'buildkit':
          return cfg.buildkit.dir + '/build/' + cfg.buildkit.name + '/sites/all/modules/civicrm';
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
      switch (cfg.build) {
        case 'buildkit':
          return "civibuild download " + cfg.buildkit.name + " \\\n" +
            '  --type ' + cfg.buildkit.type;
        case 'drush':
          return "drush -y make --working-copy \\\n" +
            "  myfile.make /var/www/mytest";
        case 'wpcli':
          return "mkdir /var/www/mytest\n" +
            "pushd \"/var/www/mytest\"\n" +
            "  wp core download\n" +
            "popd";
      }
    };

    $scope.applyPatch = function () {
      return "pushd \"" + $scope.civiRoot() + "\"\n" +
        "  git checkout thepatch\n" +
        "popd"
    };

    $scope.installApplication = function () {
      switch (cfg.build) {
        case 'buildkit':
          return "civibuild install " + cfg.buildkit.name + " \\\n" +
            '  --url \"http://localhost:8000\" \\\n' +
            '  --admin-pass \"s3cr3t\"';
        case 'drush':
          return "drush site-install ...\n" +
            "# FIXME: This doesn't install Civi config files or DB! Maybe use buildkit...";
        case 'wpcli':
          return "pushd \"/var/www/mytest\"\n" +
            "  wp core download\n" +
            "popd\n" +
            "# FIXME: This doesn't install Civi config files or DB! Maybe use buildkit...";
      }
    };

    $scope.executeTests = function () {
      var r = '';
      r = r + "[ -d \"" + $scope.junitDir() + "\" ] && rm -rf \"" + $scope.junitDir() + "\"\n";
      r = r + "mkdir \"" + $scope.junitDir() + "\"\n";
      if (cfg.civiPhpunit.enable) {
        r = r + 'pushd \"' + $scope.civiRoot() + "/tools\"\n";
        r = r + "  ./scripts/phpunit --log-junit=\"" + $scope.junitDir() + "/civi-phpunit.xml\" \\\n" +
          "    \"" + cfg.civiPhpunit.test + "\"\n";
        r = r + "popd\n";
      }
      if (cfg.civiUpgradeTest.enable) {
        if (cfg.build == 'buildkit') {
          r = r + "civibuild upgrade-test " + cfg.buildkit.name + " " + cfg.civiUpgradeTest.versions + "\n";
          r = r + "cp ... \"" + $scope.junitDir() + "\"\n";
        }
        else {
          r = r + "## skipped: CiviCRM UpgradeTest and " + cfg.build + " are not compatible\n";
        }
      }
      if (cfg.simpleTest.enable) {
        if (cfg.build == 'buildkit' || cfg.build == 'drush') {
          r = r + 'TODO drush test...' + cfg.simpleTest.test + "\n";
        }
        else {
          r = r + "## skipped: Drupal SimpleTest and " + cfg.build + " are not compatible\n";
        }
      }
      return r;
    };

    $scope.reportResults = function () {
      var r = '';
      r = r + "## Jenkins should be configured to read JUnit XML from " + $scope.junitDir();
      return r;
    }

    $scope.createPseudocode = function () {
      var r = '';
      r = r + "downloadApplication();\n";
      if (cfg.algo == 'review') {
        r = r + "applyPatch();\n";
      }
      r = r + "installApplication();\n";
      if (cfg.algo == 'sched' || cfg.algo == 'review') {
        r = r + "executeTests();\n";
        r = r + "reportResults();\n";
      }
      return r;
    };

    $scope.createExampleCode = function () {
      var r = '';
      if (cfg.build == 'buildkit') {
        r = r + "export PATH=\"" + cfg.buildkit.dir + "/bin:$PATH\"\n\n";
      }
      r = r + "## downloadApplication()\n"
        + $scope.downloadApplication() + "\n"
        + "\n";
      if (cfg.algo == 'review') {
        r = r + "## applyPatch()\n"
          + $scope.applyPatch() + "\n"
          + "\n";
      }
      r = r + "## installApplication()\n"
        + $scope.installApplication() + "\n"
        + "\n";
      if (cfg.algo == 'sched' || cfg.algo == 'review') {
        r = r + "## executeTests()\n"
          + $scope.executeTests() + "\n"
          + "## reportResults()\n"
          + $scope.reportResults() + "\n"
          + "\n";
      }
      return r;
    }
  });
