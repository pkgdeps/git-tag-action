import * as core from "@actions/core";
import github from "@actions/github";

export const tag = async (
    octokit: ReturnType<typeof github.getOctokit>,
    options: {
        gitTagName: string;
        gitCommitSha: string;
        gitCommitMessage: string;
        gitName: string;
        gitEmail: string;
        gitDate: string;
        owner: string;
        repo: string;
    }
) => {
    core.debug("options:" + JSON.stringify(options, null, 4));
    const tags = await octokit.rest.repos.listTags({
        owner: options.owner,
        repo: options.repo
    });
    const alreadyTags = tags.data.some((tag: { name: string }) => {
        return tag.name === options.gitTagName;
    });
    if (alreadyTags) {
        core.debug("already tagged by listTags");
        return;
    }
    // logic
    try {
        const refRes = await octokit.rest.git.getRef({
            owner: options.owner,
            repo: options.repo,
            ref: `refs/tags/${options.gitTagName}`
        });
        // @ts-expect-error: this condition is not needed. res.status should be 200. It is double check
        if (refRes.status === 404) {
            throw new Error("not found the ref");
        }
        core.debug("already tagged by ref:" + JSON.stringify(refRes));
        return; // already tagged
    } catch (error: any) {
        core.debug("expected error: " + error?.message);
        try {
            // https://stackoverflow.com/questions/15672547/how-to-tag-a-commit-in-api-using-curl-command
            const tagRes = await octokit.rest.git.createTag({
                tag: options.gitTagName,
                object: options.gitCommitSha,
                message: options.gitTagName,
                type: "commit",
                tagger: {
                    name: options.gitName,
                    email: options.gitEmail,
                    date: options.gitDate
                },
                owner: options.owner,
                repo: options.repo
            });
            core.debug("create tag" + JSON.stringify(tagRes));
            const refRes = await octokit.rest.git.createRef({
                owner: options.owner,
                repo: options.repo,
                sha: tagRes.data.sha,
                ref: `refs/tags/${options.gitTagName}`
            });
            core.debug("creat ref to tag:" + JSON.stringify(refRes));
        } catch (createTagError: any) {
            core.warning("create tag and get unexpected error: " + createTagError?.message);
        }
    }
};
