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
      algo: 'sched',
      build: 'buildkit',
      struct: 'bash',

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
      switch (cfg.build) {
        case 'buildkit':
          return cfg.buildkit.dir + '/build/' + cfg.buildkit.name + '/sites/all/modules/civicrm';
        case 'drush':
          return "/var/www/mytest/sites/all/modules/civicrm";
        case 'wp-cli':
          return "/var/www/mytest/wp-content/plugins/civicrm/civicrm";
      }
    };

    $scope.junitDir = function() {
      return '$WORKDIR/junit';
    };

    $scope.downloadApplication = function() {
      switch (cfg.build) {
        case 'buildkit':
          return "civibuild download " + cfg.buildkit.name + " \\\n" +
            '  --type ' + cfg.buildkit.type;
        case 'drush':
          return "drush -y dl drupal \\\n" +
            "  --destination=\"/var/www\" \\\n" +
            "  --drupal-project-rename=\"mytest\"\n" +
            "mkdir -p \"/var/www/mytest/sites/all/modules\"\n" +
            "git clone -b master \"https://github.com/civicrm/civicrm-core.git\" \\\n" +
            "  \"/var/www/mytest/sites/all/modules/civicrm\"\n" +
            "git clone -b master \"https://github.com/civicrm/civicrm-drupal.git\" \\\n" +
            "  \"/var/www/mytest/sites/all/modules/civicrm/drupal\"\n" +
            "git clone -b master \"https://github.com/civicrm/civicrm-packages.git\" \\\n" +
            "  \"/var/www/mytest/sites/all/modules/civicrm/packages\"";
        case 'wp-cli':
          return "mkdir \"/var/www/mytest\"\n" +
            "pushd \"/var/www/mytest\"\n" +
            "  wp core download\n" +
            "popd";
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
      switch (cfg.build) {
        case 'buildkit':
          return "civibuild install " + cfg.buildkit.name + " \\\n" +
            '  --url \"http://localhost:8000\" \\\n' +
            '  --admin-pass \"s3cr3t\"';
        case 'drush':
          return "pushd \"/var/www/mytest\"\n" +
            "  drush site-install ...\n" +
            "popd\n" +
            "# FIXME: The build tool (drush) does not currently support generation of the CiviCRM config\n" +
            "# files (civicrm.settings.php, setup.conf, CiviSeleniumSettings, etc) or CiviCRM DB.";
        case 'wp-cli':
          return "pushd \"/var/www/mytest\"\n" +
            "  wp core install\n" +
            "popd\n" +
            "# FIXME: The build tool (drush) does not currently support generation of the CiviCRM config\n" +
            "# files (civicrm.settings.php, setup.conf, CiviSeleniumSettings, etc) or CiviCRM DB.";
      }
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
        if (cfg.build == 'buildkit') {
          r = r + "civibuild upgrade-test " + cfg.buildkit.name + " " + cfg.civiUpgradeTest.versions + "\n";
          r = r + "cp ... \"" + $scope.junitDir() + "\"\n";
        }
        else {
          r = r + "## skipped: CiviCRM UpgradeTest with " + cfg.build + " is not supported\n";
        }
      }
      if (cfg.simpleTest.enable) {
        if (cfg.build == 'buildkit' || cfg.build == 'drush') {
          r = r + '## FIXME: drush test...' + cfg.simpleTest.test + "\n";
        }
        else {
          r = r + "## skipped: Drupal SimpleTest with " + cfg.build + " is not supported\n";
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
