/* eslint-disable @typescript-eslint/naming-convention */
import { isEmptyObject } from "@src/types/utils/EmptyObject";
import * as core from '@actions/core';
import CONST from '../../../libs/CONST';
import * as GithubUtils from '../../../libs/GithubUtils';

const run = function () {
    const issueNumber = Number(core.getInput('ISSUE_NUMBER', {required: true}));

    console.log(`Fetching issue number ${issueNumber}`);

    // @ts-expect-error -- TODO: remove this once GithubUtils is typed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return GithubUtils.octokit.issues
        .get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: issueNumber,
        })
        // @ts-expect-error -- TODO: remove this once GithubUtils is typed
        .then(({data}) => {
            console.log('Checking for unverified PRs or unresolved deploy blockers', data);

            // Check the issue description to see if there are any unfinished/un-QAed items in the checklist.
            const uncheckedBoxRegex = /-\s\[\s]\s/;
            if (uncheckedBoxRegex.test(data.body)) {
                console.log('An unverified PR or unresolved deploy blocker was found.');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
                return;
            }

            // @ts-expect-error -- TODO: remove this once GithubUtils is typed
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return GithubUtils.octokit.issues.listComments({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: issueNumber,
                per_page: 100,
            });
        })
        // @ts-expect-error -- TODO: remove this once GithubUtils is typed
        .then((comments) => {
            console.log('Checking the last comment for the :shipit: seal of approval', comments);

            // If comments is undefined that means we found an unchecked QA item in the
            // issue description, so there's nothing more to do but return early.
            if (typeof comments === undefined) {
                return;
            }

            // If there are no comments, then we have not yet gotten the :shipit: seal of approval.
            if (isEmptyObject(comments.data)) {
                console.log('No comments found on issue');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
                return;
            }

            console.log('Verifying that the last comment is the :shipit: seal of approval');
            const lastComment = comments.data.pop();
            const shipItRegex = /^:shipit:/g;
            if (shipItRegex.exec(lastComment.body) === null) {
                console.log('The last comment on the issue was not :shipit');
                core.setOutput('HAS_DEPLOY_BLOCKERS', true);
            } else {
                console.log('Everything looks good, there are no deploy blockers!');
                core.setOutput('HAS_DEPLOY_BLOCKERS', false);
            }
        })
        // @ts-expect-error -- TODO: remove this once GithubUtils is typed
        .catch((error) => {
            console.error('A problem occurred while trying to communicate with the GitHub API', error);
            core.setFailed(error);
        });
};

if (require.main === module) {
    run();
}

// module.exports = run;
export default run;
