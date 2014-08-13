'use strict';

/**
 * @ngdoc function
 * @name ciuiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ciuiApp
 */
angular.module('ciuiApp')
  .controller('MainCtrl', function($scope, $routeParams) {
    var cfg = {
      useCase: $routeParams['useCase'] || 'inst',
      cms: $routeParams['cms'] || 'drupal',
      downloader: 'bash',
      vagrant: false,

      buildkit: {
        adminPass: 'n0ts3cr3t',
        dir: $routeParams['buildkit.dir'] || '/opt/buildkit',
        type: $routeParams['buildkit.type'] || 'drupal-clean',
        civiVer: $routeParams['buildkit.civiVer'] || 'master',
        customType: 'my-custom-type',
        url: 'http://localhost:8000',
        name: $routeParams['buildkit.name'] || 'mytestbuild'
      },

      bogre: {
        url: 'https://github.com/me/bigrepo.git'
      },

      civiPhpunit: {
        enable:  true,
        test: $routeParams['civiPhpunit.test'] || 'CRM_AllTests'
      },

      civiUpgradeTest: {
        enable: $routeParams['civiUpgradeTest.versions'] ? true : false,
        versions: $routeParams['civiUpgradeTest.versions'] || '4.2.0* 4.3.0*'
      },

      simpleTest: {
        enable: false,
        mode: 'all',
        testFile: "modules/node/node.test",
        testClass: "NodeCreationTestCase",
        testGroup: "Node"
      },

      codeReview: {
        type: $routeParams['codeReview.type'] || 'github',
        path: $routeParams['codeReview.path'] || 'sites/all/modules/mymodule'
      },

      github: {
        url: 'https://github.com/myuser/myproject'
      },

      gerrit: {
        url: 'https://gerrit.example.org/r/foo/myproject'
      }

    };
    $scope.cfg = cfg;

    $scope.toggles = {
      useCase: true,
      aboutJenkins: false,
      aboutBuildTypes: false,
      pickServer: true
    };

    $scope.tabToggles = {};
    $scope.tabToggles[$routeParams['tab'] || 'summary'] = true;

    $scope.useCaseName = function() {
      switch (cfg.useCase) {
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
      return cfg.buildkit.dir + '/build/' + $scope.buildkitName();
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
      return '$WORKSPACE/junit';
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
      return cfg.useCase == 'sched' || cfg.useCase == 'review';
    };

    $scope.buildkitName = function() {
      if (cfg.useCase == 'inst') {
        return cfg.buildkit.name;
      } else if ($scope.isJenkins()) {
        return "$BLDNAME";
      } else {
        return 'FIXME';
      }
    };

    $scope.buildkitType = function() {
      if ($scope.isCustom()) {
        return cfg.buildkit.customType;
      } else {
        return cfg.buildkit.type;
      }
    };

    $scope.buildkitUrl = function() {
      if (cfg.useCase == 'inst') {
        return cfg.buildkit.url;
      } else if ($scope.isJenkins()) {
        return "$BLDURL";
      } else {
        return "http://FIXME";
      }
    };

    $scope.createPanoramaBuild = function() {
      var r = '';
      r = r + '## Download and install Drupal with Civi 4.4\n' +
        'civibuild create \"d44\" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' : '' ) +
        '  --civi-ver "4.4" \\\n' +
        '  --type "drupal-demo" \\\n' +
        '  --url "http://d44.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install Drupal with Civi (master)\n' +
        'civibuild create \"dmaster\" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' : '' ) +
        '  --civi-ver "master" \\\n' +
        '  --type "drupal-demo" \\\n' +
        '  --url "http://dmaster.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install WordPress with Civi 4.4\n' +
        'civibuild create \"wp44\" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' : '' ) +
        '  --civi-ver "4.4" \\\n' +
        '  --type "wp-demo" \\\n' +
        '  --url "http://wp44.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install WordPress with Civi (master)\n' +
        'civibuild create \"wpmaster\" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass \"' + cfg.buildkit.adminPass + '\" \\\n' : '' ) +
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

      var r = "## Download application (with civibuild)\n";
      if (env.length > 0) {
        r = r + "env " + env.join(" \\\n  ") + " \\\n" +
          "  civibuild download \"" + $scope.buildkitName() + "\" \\\n";
      } else {
        r = r + "civibuild download \"" + $scope.buildkitName() + "\" \\\n";
      }
      if (!$scope.isBogre()) {
        r = r + "  --civi-ver \"" + cfg.buildkit.civiVer + "\" \\\n";
      }

      r = r + '  --type \"' + $scope.buildkitType() + "\"";
      return r;
    };

    $scope.codeReviewPath = function() {
      return $scope.webRoot() + ($scope.isBogre() ? '' : ('/' + cfg.codeReview.path));
    };

    $scope.applyPatch = function() {
      switch (cfg.codeReview.type) {
        case 'github':
          return "## Apply patch (from Github)\n" +
            "pushd \"" + $scope.codeReviewPath() + "\"\n" +
            "  git fetch origin \"+refs/pull/*:refs/remotes/origin/pr/*\"\n" +
            "  git checkout \"$sha1\"\n" +
            "popd"

        case 'gerrit':
          return "## Apply patch (from Gerrit)\n" +
            "pushd \"" + $scope.codeReviewPath() + "\"\n" +
            "  git fetch \"" + cfg.gerrit.url + "\" \"FIXME\"\n" +
            "  # FIXME: use some combination of $GERRIT_REFSPEC, $GERRIT_BRANCH, $GERRIT_BRANCH\n" +
            "  # https://wiki.jenkins-ci.org/display/JENKINS/Gerrit+Trigger\n" +
            "  git checkout FETCH_HEAD\n" +
            "popd"
      }
    };

    $scope.installApplication = function() {
      var lines = [
        "civibuild install \"" + $scope.buildkitName() + "\"",
        '--url \"' + $scope.buildkitUrl() + '\"'
        ];
      if (cfg.buildkit.adminPass) {
        lines.push('--admin-pass \"' + cfg.buildkit.adminPass + '\"')
      }

      return "## Install application (with civibuild)\n" +
        lines.join(" \\\n  ");
    };

    $scope.executeTests = function() {
      var r = '';

      if (cfg.civiPhpunit.enable) {
        r = r + "## Execute tests (with CiviCRM's PHPUnit)\n";
        r = r + 'pushd \"' + $scope.civiRoot() + "/tools\"\n";
        r = r + "  ./scripts/phpunit \\\n" +
          "    --log-junit=\"" + $scope.junitDir() + "/civi-phpunit.xml\" \\\n" +
          "    \"" + cfg.civiPhpunit.test + "\"\n";
        r = r + "popd\n";
        r = r + "\n";
      }
      if (cfg.civiUpgradeTest.enable && $scope.isDrupal()) {
        r = r + "## Execute tests (with CiviCRM's UpgradeTest)\n";
        r = r + "civibuild upgrade-test \"" + $scope.buildkitName() + "\" " + cfg.civiUpgradeTest.versions + "\n";
        //r = r + "cp ... \"" + $scope.junitDir() + "\"\n";
        r = r + "cp \"" + cfg.buildkit.dir + "/app/debug/" + $scope.buildkitName() + "/civicrm-upgrade-test.xml\" \\\n" +
          "  \"" + $scope.junitDir() + "/\"\n";
        r = r + "\n";
      }
      if (cfg.simpleTest.enable && $scope.isDrupal()) {
        r = r + "## Execute tests (with Drupal's SimpleTest)\n";
        r = r + "pushd \"" + $scope.cmsRoot() + "\"\n";
        r = r + "  drush -y en \"simpletest\"\n";
        r = r + "  ## consider: sudo -u www-data \\\n";
        r = r + "  php scripts/run-tests.sh \\\n" +
          "    --url \"" + $scope.buildkitUrl() + "\" \\\n" +
          "    --xml \"" + $scope.junitDir() + "/drupal-simpletest.xml\" \\\n";
        switch (cfg.simpleTest.mode) {
          case 'all':
            r = r + "    --all\n";
            break;
          case 'file':
            r = r + "    --file \"" + cfg.simpleTest.testFile + "\"\n";
            break;
          case 'class':
            r = r + "    --class \"" + cfg.simpleTest.testClass + "\"\n";
            break;
          case 'group':
            r = r + "    \"" + cfg.simpleTest.testGroup + "\"\n";
            break;
          default:
            r = r + "    FIXME(unrecognized-test)\n";
        }
        //
        r = r + "popd\n";
        r = r + "\n";
      }
      return r;
    };

    $scope.reportResults = function() {
      var r = "## Report results\n";
      r = r + "# Jenkins should be configured to read JUnit XML from " + $scope.junitDir();
      return r;
    }

    $scope.createExampleCode = function() {
      var env = [];
      if (!cfg.vagrant) {
        env.push("export PATH=\"" + cfg.buildkit.dir + "/bin:$PATH\"\n");
      }
      if ($scope.isJenkins()) {
        env.push("export BLDNAME=\"jenkins-${EXECUTOR_NUMBER}\"\n");
        env.push("export BLDURL=\"http://localhost:$((8100 + $EXECUTOR_NUMBER))\"\n");
      }

      var r = '';

      if (env.length > 0) {
        for (var envIdx = 0; envIdx < env.length; envIdx++) {
          r = r + env[envIdx];
        }
        r = r + "\n";
      }

      if ($scope.isJenkins()) {
        r = r + "## Cleanup (previous tests)\n" +
          "if [ -d \"" + $scope.junitDir() + "\" ]; then\n" +
          "  rm -rf \"" + $scope.junitDir() + "\"\n" +
          "fi\n" +
          "mkdir \"" + $scope.junitDir() + "\"\n" +
          "if [ -d \"" + $scope.webRoot() + "\" ]; then\n" +
          "  civibuild destroy \"" + $scope.buildkitName() + "\"\n" +
          "fi\n";
        r = r + "\n";
      }
      if (cfg.useCase == 'multiver') {
        r = r + $scope.createPanoramaBuild();
      } else {
        r = r + $scope.downloadApplication() + "\n"
          + "\n";
        if (cfg.useCase == 'review') {
          r = r + $scope.applyPatch() + "\n"
            + "\n";
        }
        r = r + $scope.installApplication() + "\n"
          + "\n";
      }
      if ($scope.isJenkins()) {
        r = r + $scope.executeTests()
          + $scope.reportResults() + "\n"
          + "\n";
      }
      return r;
    };

    $scope.installBuildkit = function() {
      var r = '';
      if (cfg.sudo) {
        r = r + "sudo mkdir \"" + cfg.buildkit.dir + "\"\n";
        if ($scope.isJenkins()) {
          r = r + "sudo chown \"jenkins\" \"" + cfg.buildkit.dir + "\"\n";
          r = r + "sudo -u \"jenkins\" -H bash\n";
        } else {
          r = r + "sudo chown $USER \"" + cfg.buildkit.dir + "\"\n";
        }
      }
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
      return "function scheduledTest() {\n" +
        "  cleanup();\n" +
        "  downloadApplication();\n" +
        "  installApplication();\n" +
        "  executeTests();\n" +
        "  reportResults();\n" +
        "}";
    };

    $scope.onSubmitCodeReviewPseudocode = function() {
      return "function onSubmitCodeReview() {\n" +
        "  cleanup();\n" +
        "  downloadApplication();\n" +
        "  applyPatch();\n" +
        "  installApplication();\n" +
        "  executeTests();\n" +
        "  reportResults();\n" +
        "}";
    };

    $scope.tabList = function() {
      var steps = ['summary'];
      if ($scope.isJenkins()) steps.push('getJenkins');
      steps.push('getBuildkit');
      if (cfg.useCase != 'multiver' && $scope.isCustom()) steps.push('defineBuildType');
      steps.push('buildSite');
      return steps;
    };

    $scope.hasNext = function() {
      return !$scope.tabToggles.buildSite;
    };

    $scope.goNext = function() {
      var steps = $scope.tabList();
      var first = steps[0];
      while (steps.length > 0 && !$scope.tabToggles[steps[0]]) {
        steps.shift();
      }
      if (steps.length > 1) {
        delete $scope.tabToggles[steps.shift()];
        $scope.tabToggles[steps.shift()] = true;
      } else {
        $scope.tabToggles = {};
        $scope.tabToggles[first] = true;
      }
    }
  });
