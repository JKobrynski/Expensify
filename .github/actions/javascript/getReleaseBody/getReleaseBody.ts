import core from '@actions/core';
import * as ActionUtils from '../../../libs/ActionUtils';
import * as GithubUtils from '../../../libs/GithubUtils';

// Parse the stringified JSON array of PR numbers, and cast each from String -> Number
const PRList = ActionUtils.getJSONInput('PR_LIST', {required: true});
console.log(`Got PR list: ${PRList}`);

// @ts-expect-error -- TODO: remove this once GithubUtils is typed
const releaseBody = GithubUtils.getReleaseBody(PRList);
console.log(`Generated release body: ${releaseBody}`);

core.setOutput('RELEASE_BODY', releaseBody);
