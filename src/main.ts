import * as core from "@actions/core";
import * as github from "@actions/github";
import { tag } from "./tag";

async function run(): Promise<void> {
    try {
        const token = core.getInput("github_token", {
            required: true
        });
        const octokit = github.getOctokit(token);
        const version: string = core.getInput("version", {
            required: true
        });
        const prefix: string = core.getInput("git_tag_prefix") ?? "";
        const git_commit_sha: string = core.getInput("git_commit_sha", {
            required: true
        });
        const github_repo: string = core.getInput("github_repo", {
            required: true
        });
        const [owner, repo] = github_repo.split("/");
        const gitTagName = `${prefix}${version}`;
        await tag(octokit, {
            owner,
            repo,
            gitName: github.context.actor,
            gitEmail: `${github.context.actor}@users.noreply.github.com`,
            gitTagName,
            gitCommitSha: git_commit_sha || github.context.sha,
            gitCommitMessage: `chore(release): ${gitTagName}`,
            gitDate: new Date().toISOString()
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
