'use strict';

/**
 * @ngdoc function
 * @name ciuiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ciuiApp
 */
angular.module('ciuiApp')
  .controller('MainCtrl', function($scope) {
    var cfg = {
      algo: 'inst',
      cms: 'drupal',
      downloader: 'bash',

      buildkit: {
        dir: '/srv/buildkit',
        type: 'drupal-clean',
        customType: 'my-new-type',
        name: 'mytest'
      },

      bogre: {
        url: 'https://github.com/me/bigrepo.git'
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
      },

      codeReview: {
        type: 'github',
        path: 'sites/all/modules/mymodule'
      }
    };
    $scope.cfg = cfg;

    $scope.algoName = function() {
      switch (cfg.algo) {
        case 'inst':
          return 'basicInstall';
        case 'sched':
          return 'onScheduledStart';
        case 'review':
          return 'onSubmitPatch';
      }
    };

    $scope.civiRoot = function() {
      return cfg.buildkit.dir + '/build/' + cfg.buildkit.name + '/sites/all/modules/civicrm';
    };

    $scope.junitDir = function() {
      return '$WORKDIR/junit';
    };

    $scope.isCustom = function() {
      return cfg.buildkit.type == 'CUSTOM';
    };

    $scope.isBogre = function() {
      if (cfg.buildkit.type == 'drupal-bogre' || cfg.buildkit.type == 'wp-bogre') {
        return true;
      }
      if ($scope.isCustom()) {
        return cfg.downloader == 'bogre';
      }
      return false;
    };

    $scope.isDrupal = function() {
      if (cfg.buildkit.type.startsWith('drupal-')) {
        return true;
      }
      if ($scope.isCustom() && cfg.cms == 'drupal') {
        return true;
      }
      return false;
    };

    $scope.buildkitType = function() {
      if ($scope.isCustom()) {
        return cfg.buildkit.customType;
      } else {
        return cfg.buildkit.type;
      }
    };

    $scope.downloadApplication = function() {
      var env = [];

      if ($scope.isBogre()) {
        env.push('BOGRE=\"' + cfg.bogre.url + '\"');
      }

      if (env.length > 0) {
        return "env " + env.join(" \\\n  ") + " \\\n" +
          "  civibuild download " + cfg.buildkit.name + " \\\n" +
          '  --type \"' + $scope.buildkitType() + "\"";
      } else {
        return "civibuild download " + cfg.buildkit.name + " \\\n" +
          '  --type \"' + $scope.buildkitType() + "\"";
      }
    };

    $scope.applyPatch = function() {
      switch (cfg.codeReview.type) {
        case 'github':
          return "pushd \"" + $scope.civiRoot() + "\"\n" +
            "  git fetch origin \"+refs/pull/*:refs/remotes/origin/pr/*\"\n" +
            "  git checkout \"$sha1\"\n" +
            "popd"

        case 'gerrit':
          return "pushd \"" + $scope.civiRoot() + "\"\n" +
            "  # git checkout thepatch fromgerrit\n" +
            "popd"
      }
    };

    $scope.installApplication = function() {
      return "civibuild install " + cfg.buildkit.name + " \\\n" +
        '  --url \"http://localhost:8000\" \\\n' +
        '  --admin-pass \"s3cr3t\"';
    };

    $scope.executeTests = function() {
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
        if ($scope.isDrupal()) {
          r = r + "civibuild upgrade-test " + cfg.buildkit.name + " " + cfg.civiUpgradeTest.versions + "\n";
          r = r + "cp ... \"" + $scope.junitDir() + "\"\n";
        } else {
          r = r + "## SKIP: CiviCRM UpgradeTest is not supported in this configuration.\n"
        }
      }
      if (cfg.simpleTest.enable) {
        if ($scope.isDrupal()) {
          r = r + '## FIXME: drush test...' + cfg.simpleTest.test + "\n";
        } else {
          r = r + "## SKIP: Drupal SimpleTest is not supported in this configuration.\n"
        }
      }
      return r;
    };

    $scope.reportResults = function() {
      var r = '';
      r = r + "## Jenkins should be configured to read JUnit XML from " + $scope.junitDir();
      return r;
    }

    $scope.createPseudocode = function() {
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

    $scope.createExampleCode = function() {
      var r = '';
      r = r + "export PATH=\"" + cfg.buildkit.dir + "/bin:$PATH\"\n\n";
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
    };

    $scope.installBuildkit = function() {
      return "git clone \"https://github.com/civicrm/civicrm-buildkit.git\"\n" +
        "cd civicrm-buildkit/bin\n" +
        "./civi-download-tools\n" +
        "./amp config\n" +
        "## At this point, check to make sure you follow the instructions output by amp config,\n" +
        "## which involve adding a line to your Apache configuration file\n" +
        "./amp test\n";
    };
  });
