const {readFileSync} = require('fs'); 
const core = require('@actions/core');
const versionUpdater = require('../../../libs/versionUpdater');

const semverLevel = core.getInput('SEMVER_LEVEL', {require: true});
if (!semverLevel || !versionUpdater.SEMANTIC_VERSION_LEVELS.includes(semverLevel)) {
    core.setFailed(`'Error: Invalid input for 'SEMVER_LEVEL': ${semverLevel}`);
}

const {version: currentVersion} = JSON.parse(readFileSync('./package.json'));
const previousVersion = versionUpdater.getPreviousVersion(currentVersion, semverLevel);
core.setOutput('PREVIOUS_VERSION', previousVersion);
