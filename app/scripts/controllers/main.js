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
        htmlDir: 'civibuild-html',
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
        testFile: 'modules/node/node.test',
        testClass: 'NodeCreationTestCase',
        testGroup: 'Node'
      },

      codeReview: {
        type: $routeParams['codeReview.type'] || 'github',
        path: $routeParams['codeReview.path'] || 'sites/all/modules/civicrm'
      },

      github: {
        url: $routeParams['github.url'] || 'https://github.com/civicrm/civicrm-core'
      },

      gerrit: {
        url: $routeParams['gerrit.url'] || 'https://gerrit.example.org/r/foo/myproject'
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

    $scope.htmlDir = function() {
      return '$WORKSPACE/' + cfg.buildkit.htmlDir;
    };

    $scope.junitDir = function() {
      return '$WORKSPACE/junit';
    };

    $scope.isCustom = function() {
      return cfg.buildkit.type === 'CUSTOM';
    };

    $scope.isBogre = function() {
      if (cfg.buildkit.type === 'drupal-bogre' || cfg.buildkit.type === 'wp-bogre') {
        return true;
      }
      if ($scope.isCustom()) {
        return cfg.downloader === 'bogre';
      }
      return false;
    };

    $scope.isDrupal = function() {
      if (cfg.buildkit.type.startsWith('drupal-')) {
        return true;
      }
      if ($scope.isCustom() && cfg.cms === 'drupal') {
        return true;
      }
      return false;
    };

    $scope.isJenkins = function() {
      return cfg.useCase === 'sched' || cfg.useCase === 'review';
    };

    $scope.buildkitName = function() {
      if (cfg.useCase === 'inst') {
        return cfg.buildkit.name;
      } else if ($scope.isJenkins()) {
        return '$BLDNAME';
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
      if (cfg.useCase === 'inst') {
        return cfg.buildkit.url;
      } else if ($scope.isJenkins()) {
        return '$BLDURL';
      } else {
        return 'http://FIXME';
      }
    };

    $scope.createPanoramaBuild = function() {
      var r = '';
      r = r + '## Download and install Drupal with Civi 4.4\n' +
        'civibuild create "d44" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass "' + cfg.buildkit.adminPass + '" \\\n' : '' ) +
        '  --civi-ver "4.4" \\\n' +
        '  --type "drupal-demo" \\\n' +
        '  --url "http://d44.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install Drupal with Civi (master)\n' +
        'civibuild create "dmaster" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass "' + cfg.buildkit.adminPass + '" \\\n' : '' ) +
        '  --civi-ver "master" \\\n' +
        '  --type "drupal-demo" \\\n' +
        '  --url "http://dmaster.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install WordPress with Civi 4.4\n' +
        'civibuild create "wp44" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass "' + cfg.buildkit.adminPass + '" \\\n' : '' ) +
        '  --civi-ver "4.4" \\\n' +
        '  --type "wp-demo" \\\n' +
        '  --url "http://wp44.localhost"\n';
      r = r + '\n';
      r = r + '## Download and install WordPress with Civi (master)\n' +
        'civibuild create "wpmaster" \\\n' +
        (cfg.buildkit.adminPass ? '  --admin-pass "' + cfg.buildkit.adminPass + '" \\\n' : '' ) +
        '  --civi-ver "master" \\\n' +
        '  --type "drupal-clean" \\\n' +
        '  --url "http://wpmaster.localhost"\n';
      return r;
    };

    $scope.downloadApplication = function() {
      var env = [];

      if ($scope.isBogre()) {
        env.push('BOGRE_URL="' + cfg.bogre.url + '"');
        if (cfg.bogre.subdir) {
          env.push('BOGRE_SUBDIR="' + cfg.bogre.subdir + '"');
        }
      }

      var r = '## Download application (with civibuild)\n';
      if (env.length > 0) {
        r = r + 'env ' + env.join(' \\\n  ') + ' \\\n' +
          '  civibuild download "' + $scope.buildkitName() + '" \\\n';
      } else {
        r = r + 'civibuild download "' + $scope.buildkitName() + '" \\\n';
      }
      if (!$scope.isBogre()) {
        r = r + '  --civi-ver "' + cfg.buildkit.civiVer + '" \\\n';
      }

      r = r + '  --type "' + $scope.buildkitType() + '"';
      return r;
    };

    $scope.codeReviewPath = function() {
      return $scope.webRoot() + ($scope.isBogre() ? '' : ('/' + cfg.codeReview.path));
    };

    $scope.applyPatch = function() {
      switch (cfg.codeReview.type) {
        case 'github':
          return '## Apply patch (from Github)\n' +
            'pushd "' + $scope.codeReviewPath() + '"\n' +
            '  git fetch origin "+refs/pull/*:refs/remotes/origin/pr/*"\n' +
            '  git checkout "$sha1"\n' +
            'popd';

        case 'gerrit':
          return '## Apply patch (from Gerrit)\n' +
            'pushd "' + $scope.codeReviewPath() + '"\n' +
            '  git fetch "' + cfg.gerrit.url + '" "FIXME"\n' +
            '  # FIXME: use some combination of $GERRIT_REFSPEC, $GERRIT_BRANCH, $GERRIT_BRANCH\n' +
            '  # https://wiki.jenkins-ci.org/display/JENKINS/Gerrit+Trigger\n' +
            '  git checkout FETCH_HEAD\n' +
            'popd';
      }
    };

    $scope.installApplication = function() {
      var lines = [
        'civibuild install "' + $scope.buildkitName() + '"',
        '--url "' + $scope.buildkitUrl() + '"'
        ];
      if (cfg.buildkit.adminPass) {
        lines.push('--admin-pass "' + cfg.buildkit.adminPass + '"');
      }

      return '## Install application (with civibuild)\n' +
        lines.join(' \\\n  ');
    };

    $scope.executeTests = function() {
      var rs = [];
      var r;

      if (cfg.civiPhpunit.enable) {
        r = '';
        r = r + '## Execute tests (with CiviCRM\'s PHPUnit)\n';
        r = r + 'pushd "' + $scope.civiRoot() + '/tools"\n';
        r = r + '  set +e\n';
        r = r + '    ./scripts/phpunit --tap \\\n' +
          '      --log-junit="' + $scope.junitDir() + '/civi-phpunit.xml" \\\n' +
          '      "' + cfg.civiPhpunit.test + '"\n';
        r = r + '    EXITCODE=$(($? || $EXITCODE))\n';
        r = r + '  set -e\n';
        r = r + 'popd\n';
        rs.push(r);
      }
      if (cfg.civiUpgradeTest.enable && $scope.isDrupal()) {
        r = '';
        r = r + '## Execute tests (with CiviCRM\'s UpgradeTest)\n';
        r = r + 'set +e\n';
        r = r + '  civibuild upgrade-test "' + $scope.buildkitName() + '" ' + cfg.civiUpgradeTest.versions + '\n';
        r = r + '  EXITCODE=$(($? || $EXITCODE))\n';
        r = r + 'set -e\n';
        r = r + 'cp "' + cfg.buildkit.dir + '/app/debug/' + $scope.buildkitName() + '/civicrm-upgrade-test.xml" \\\n' +
          '  "' + $scope.junitDir() + '/"\n';
        rs.push(r);
      }
      if (cfg.simpleTest.enable && $scope.isDrupal()) {
        r = '';
        r = r + '## Execute tests (with Drupal\'s SimpleTest)\n';
        r = r + 'pushd "' + $scope.cmsRoot() + '"\n';
        r = r + '  drush -y en "simpletest"\n';
        r = r + '  set +e\n';
        r = r + '    ## consider: sudo -u www-data \\\n';
        r = r + '    php scripts/run-tests.sh \\\n' +
          '      --url "' + $scope.buildkitUrl() + '" \\\n' +
          '      --xml "' + $scope.junitDir() + '" \\\n';
        switch (cfg.simpleTest.mode) {
          case 'all':
            r = r + '      --all\n';
            break;
          case 'file':
            r = r + '      --file "' + cfg.simpleTest.testFile + '"\n';
            break;
          case 'class':
            r = r + '      --class "' + cfg.simpleTest.testClass + '"\n';
            break;
          case 'group':
            r = r + '      "' + cfg.simpleTest.testGroup + '"\n';
            break;
          default:
            r = r + '    FIXME(unrecognized-test)\n';
        }
        r = r + '    EXITCODE=$(($? || $EXITCODE))\n';
        r = r + '  set -e\n';
        r = r + 'popd\n';
        rs.push(r);
      }
      return rs.join('\n');
    };

    $scope.documentBuild = function() {
      var r = '## Report details about this build of the application\n';
      if (cfg.useCase === 'sched') {
        r = r + 'civibuild show "$BLDNAME" \\\n' +
          '  --html "' + $scope.htmlDir() + '" \\\n' +
          '  --last-scan "$WORKSPACE/last-scan.json" \\\n' +
          '  --new-scan "$WORKSPACE/new-scan.json"\n' +
          'cp "$WORKSPACE/new-scan.json" "$WORKSPACE/last-scan.json"\n';
      } else {
        r = r + 'civibuild show "$BLDNAME" \\\n' +
          '  --html "' + $scope.htmlDir() + '"\n';
      }
      return r;
    };

    $scope.documentResults = function() {
      var r = '## Report test results\n';
      r = r + '# Jenkins should be configured to read JUnit XML from ' + $scope.junitDir();
      return r;
    };

    $scope.createExampleCode = function() {
      var env = [];
      if ($scope.isJenkins()) {
        env.push('#!/bin/bash\n');
        env.push('set -ex\n');
      }
      if (!cfg.vagrant) {
        env.push('export PATH="' + cfg.buildkit.dir + '/bin:$PATH"\n');
      }
      if ($scope.isJenkins()) {
        env.push('BLDNAME="jenkins-${EXECUTOR_NUMBER}"\n');
        env.push('BLDURL="http://localhost:$((8100 + $EXECUTOR_NUMBER))"\n');
        env.push('EXITCODE=0\n');
      }

      var r = '';

      if (env.length > 0) {
        for (var envIdx = 0; envIdx < env.length; envIdx++) {
          r = r + env[envIdx];
        }
        r = r + '\n';
      }

      if ($scope.isJenkins()) {
        r = r + '## Reset (cleanup after previous tests)\n' +
          '[ -d "' + $scope.junitDir() + '" ] && rm -rf "' + $scope.junitDir() + '"\n' +
          '[ -d "' + $scope.htmlDir() + '" ] && rm -rf "' + $scope.htmlDir() + '"\n' +
          '[ -d "' + $scope.webRoot() + '" ] && civibuild destroy "' + $scope.buildkitName() + '"\n' +
          'mkdir "' + $scope.junitDir() + '"\n' +
          'mkdir "' + $scope.htmlDir() + '"\n';
        r = r + '\n';
      }
      if (cfg.useCase === 'multiver') {
        r = r + $scope.createPanoramaBuild();
      } else {
        r = r + $scope.downloadApplication() + '\n' +
          '\n';
        if (cfg.useCase === 'review') {
          r = r + $scope.applyPatch() + '\n' +
            '\n';
        }
        r = r + $scope.installApplication() + '\n' +
          '\n';
      }
      if ($scope.isJenkins()) {
        r = r + $scope.documentBuild() + '\n' +
          $scope.executeTests() + '\n' +
          $scope.documentResults() + '\n' +
          'exit $EXITCODE\n' +
          '\n';
      }
      return r;
    };

    $scope.installBuildkit = function() {
      var r = '';
      if (cfg.sudo) {
        r = r + 'sudo mkdir "' + cfg.buildkit.dir + '"\n';
        if ($scope.isJenkins()) {
          r = r + 'sudo chown "jenkins" "' + cfg.buildkit.dir + '"\n';
          r = r + 'sudo -u "jenkins" -H bash\n';
        } else {
          r = r + 'sudo chown $USER "' + cfg.buildkit.dir + '"\n';
        }
      }
      r = r + 'git clone "https://github.com/civicrm/civicrm-buildkit.git" "' + cfg.buildkit.dir + '"\n';
      if (!cfg.vagrant) {
        r = r +
          'export PATH="' + cfg.buildkit.dir + '/bin:$PATH"\n' +
          'civi-download-tools\n' +
          'amp config\n' +
          'amp test\n';
      } else {
        r = r + 'cd "' + cfg.buildkit.dir + '/vagrant/precise32-standalone"\n' +
          'vagrant up\n' +
          'vagrant ssh\n';
      }
      return r;
    };

    $scope.scheduledTestPseudocode = function() {
      return 'function scheduledTest() {\n' +
        '  // Reset (e.g. cleanup any old build artifacts)\n' +
        '  reset();\n' +
        '  \n' +
        '  // Download all code for the CMS, CRM, add-ons, etc\n' +
        '  downloadApplication();\n' +
        '  \n' +
        '  // Setup databases and config files for the application\n' +
        '  installApplication();\n' +
        '  \n' +
        '  // Report details about this build of the application\n' +
        '  // (to facilitate future investigation)\n' +
        '  documentBuild();\n' +
        '  \n' +
        '  // Execute any test suites\n' +
        '  executeTests();\n' +
        '  \n' +
        '  // Report the results of the test suites\n' +
        '  documentResults();\n' +
        '}';
    };

    $scope.onSubmitCodeReviewPseudocode = function() {
      return 'function onSubmitCodeReview() {\n' +
        '  // Reset (e.g. cleanup any old build artifacts)\n' +
        '  reset();\n' +
        '  \n' +
        '  // Download all code for the CMS, CRM, add-ons, etc\n' +
        '  downloadApplication();\n' +
        '  \n' +
        '  // Fetch and apply the proposed patch\n' +
        '  applyPatch();\n' +
        '  \n' +
        '  // Setup databases and config files for the application\n' +
        '  installApplication();\n' +
        '  \n' +
        '  // Report the details about this build of the application\n' +
        '  // (to facilitate future investigation)\n' +
        '  documentBuild();\n' +
        '  \n' +
        '  // Execute any test suites\n' +
        '  executeTests();\n' +
        '  \n' +
        '  // Report the results of the test suites\n' +
        '  documentResults();\n' +
        '}';
    };

    $scope.ampExample1 = function() {
      return 'amp config:set \\\n' +
        '  --mysql_type=dsn \\\n' +
        '  --mysql_dsn="mysql://admin:secret@localhost:3306/" \\\n' +
        '  --httpd_type=apache';
    };

    $scope.ampExample2 = function() {
      return 'amp config:set \\\n' +
        '  --mysql_type=mycnf \\\n' +
        '  --httpd_type=none';
    };

    $scope.tabList = function() {
      var steps = ['summary'];
      if ($scope.isJenkins()) {
        steps.push('getJenkins');
      }
      steps.push('getBuildkit');
      if (cfg.useCase !== 'multiver' && $scope.isCustom()) {
        steps.push('defineBuildType');
      }
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
    };
  });
