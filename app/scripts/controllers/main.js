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
      vagrant: false,

      buildkit: {
        adminPass: 't0ps3cr3t',
        dir: '/srv/buildkit',
        type: 'drupal-clean',
        civiVer: 'master',
        customType: 'my-custom-type',
        url: 'http://localhost:8000',
        name: 'mytestbuild'
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

    $scope.toggles = {
      useCase: true
    };

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

    // Misnomer: Root of the build (like buildkit's WEB_ROOT)
    $scope.webRoot = function() {
      return cfg.buildkit.dir + '/build/' + cfg.buildkit.name
    };

    // Public document root of the CMS (like buildkit's CMS_ROOT)
    $scope.cmsRoot = function() {
      if ($scope.isBogre() && cfg.bogre.subdir) {
        return $scope.webRoot() + '/' + cfg.bogre.subdir;
      } else {
        return $scope.webRoot();
      }
    };

    $scope.civiRoot = function() {
      if ($scope.isDrupal()) {
        return $scope.cmsRoot() + '/sites/all/modules/civicrm';
      } else {
        return $scope.cmsRoot() + '/wp-content/plugins/civicrm/civicrm';
      }
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

    $scope.isJenkins = function() {
      return cfg.algo == 'sched' || cfg.algo == 'review';
    };

    $scope.buildkitType = function() {
      if ($scope.isCustom()) {
        return cfg.buildkit.customType;
      } else {
        return cfg.buildkit.type;
      }
    };

    $scope.createPanoramaBuild = function() {
      var r = '';
      r = r + '## Download and install Drupal with Civi 4.4\n' +
        'civibuild create d44 \\\n' +
        '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' +
        '  --civi-ver "4.4" \\\n' +
        '  --type "drupal-demo" \\\n' +
        '  --url "http://d44.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install Drupal with Civi (master)\n' +
        'civibuild create dmaster \\\n' +
        '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' +
        '  --civi-ver "master" \\\n' +
        '  --type "drupal-demo" \\\n' +
        '  --url "http://dmaster.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install WordPress with Civi 4.4\n' +
        'civibuild create wp44 \\\n' +
        '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' +
        '  --civi-ver "4.4" \\\n' +
        '  --type "wp-demo" \\\n' +
        '  --url "http://wp44.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install WordPress with Civi (master)\n' +
        'civibuild create wpmaster \\\n' +
        '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' +
        '  --civi-ver "master" \\\n' +
        '  --type "drupal-clean" \\\n' +
        '  --url "http://wpmaster.localhost"\n';
      return r;
    };

    $scope.downloadApplication = function() {
      var env = [];

      if ($scope.isBogre()) {
        env.push('BOGRE_URL=\"' + cfg.bogre.url + '\"');
        if (cfg.bogre.subdir) {
          env.push('BOGRE_SUBDIR=\"' + cfg.bogre.subdir + '\"');
        }
      }

      var r = '';
      if (env.length > 0) {
        r = r + "env " + env.join(" \\\n  ") + " \\\n" +
          "  civibuild download " + cfg.buildkit.name + " \\\n";
      } else {
        r = r + "civibuild download " + cfg.buildkit.name + " \\\n";
      }
      if (!$scope.isBogre()) {
        r = r + "  --civi-ver \"" + cfg.buildkit.civiVer + "\" \\\n";
      }

      r = r + '  --type \"' + $scope.buildkitType() + "\"";
      return r;
    };

    $scope.codeReviewPath = function() {
      return ($scope.isBogre()) ? $scope.webRoot() : $scope.civiRoot();
    };

    $scope.applyPatch = function() {
      switch (cfg.codeReview.type) {
        case 'github':
          return "pushd \"" + $scope.codeReviewPath() + "\"\n" +
            "  git fetch origin \"+refs/pull/*:refs/remotes/origin/pr/*\"\n" +
            "  git checkout \"$sha1\"\n" +
            "popd"

        case 'gerrit':
          return "pushd \"" + $scope.codeReviewPath() + "\"\n" +
            "  # git checkout thepatch fromgerrit\n" +
            "  git fetch https://gerrit.example.org/r/foo/myproject refs/changes/07/141607/2\n" +
            "  git checkout FETCH_HEAD" +
            "popd"
      }
    };

    $scope.installApplication = function() {
      return "civibuild install " + cfg.buildkit.name + " \\\n" +
        '  --url \"' + cfg.buildkit.url + '\" \\\n' +
        '  --admin-pass \"' + cfg.buildkit.adminPass + '\"';
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
      if (cfg.civiUpgradeTest.enable && $scope.isDrupal()) {
        r = r + "civibuild upgrade-test " + cfg.buildkit.name + " " + cfg.civiUpgradeTest.versions + "\n";
        r = r + "cp ... \"" + $scope.junitDir() + "\"\n";
      }
      if (cfg.simpleTest.enable && $scope.isDrupal()) {
        r = r + '## FIXME: drush test...' + cfg.simpleTest.test + "\n";
      }
      return r;
    };

    $scope.reportResults = function() {
      var r = '';
      r = r + "## Jenkins should be configured to read JUnit XML from " + $scope.junitDir();
      return r;
    }

    $scope.createExampleCode = function() {
      var r = '';
      if (!cfg.vagrant) {
        r = r + "export PATH=\"" + cfg.buildkit.dir + "/bin:$PATH\"\n\n";
      }
      if (cfg.algo == 'pano') {
        r = r + $scope.createPanoramaBuild();
      } else {
        r = r + "## Download application\n"
          + $scope.downloadApplication() + "\n"
          + "\n";
        if (cfg.algo == 'review') {
          r = r + "## Apply patch\n"
            + $scope.applyPatch() + "\n"
            + "\n";
        }
        r = r + "## Install application\n"
          + $scope.installApplication() + "\n"
          + "\n";
      }
      if ($scope.isJenkins()) {
        r = r + "## Execute tests\n"
          + $scope.executeTests() + "\n"
          + "## Report results\n"
          + $scope.reportResults() + "\n"
          + "\n";
      }
      return r;
    };

    $scope.installBuildkit = function() {
      var r = '';
      r = r + "git clone \"https://github.com/civicrm/civicrm-buildkit.git\" \"" + cfg.buildkit.dir + "\"\n";
      if (!cfg.vagrant) {
        r = r +
          "export PATH=\"" + cfg.buildkit.dir + "/bin:$PATH\"\n" +
          "civi-download-tools\n" +
          "amp config\n" +
          "amp test\n";
      } else {
        r = r + "cd \"" + cfg.buildkit.dir + "/vagrant/precise32-standalone\"\n" +
          "vagrant up\n" +
          "vagrant ssh\n"
      }
      return r;
    };

    $scope.scheduledTestPseudocode = function() {
      return "downloadApplication();\n" +
        "installApplication();\n" +
        "executeTests();\n" +
        "reportResults();";
    }
  });
