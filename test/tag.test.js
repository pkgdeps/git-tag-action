const assert = require("node:assert/strict");
const { test } = require("node:test");
const { tag } = require("../lib/tag");

const options = {
    owner: "example-owner",
    repo: "example-repo",
    gitTagName: "v1.2.3",
    gitCommitSha: "0123456789abcdef0123456789abcdef01234567",
    gitCommitMessage: "chore(release): v1.2.3",
    gitName: "actor",
    gitEmail: "actor@users.noreply.github.com",
    gitDate: "2024-01-01T00:00:00.000Z"
};

function octokit(overrides = {}) {
    const calls = [];
    const git = {
        getRef: async (args) => {
            calls.push(["getRef", args]);
            throw Object.assign(new Error("Not Found"), { status: 404 });
        },
        createTag: async (args) => {
            calls.push(["createTag", args]);
            return { data: { sha: "tag-object-sha" } };
        },
        createRef: async (args) => {
            calls.push(["createRef", args]);
            return { data: { ref: args.ref } };
        },
        ...overrides
    };
    const repos = {
        listTags: async (args) => {
            calls.push(["listTags", args]);
            return { data: [] };
        }
    };
    return { client: { rest: { git, repos } }, calls };
}

test("does nothing when the exact tag reference exists", async () => {
    const { client, calls } = octokit({ getRef: async (args) => { calls.push(["getRef", args]); return { status: 200 }; } });
    await tag(client, options);
    assert.deepEqual(calls.map(([method]) => method), ["listTags", "getRef"]);
    assert.deepEqual(calls[1][1], { owner: options.owner, repo: options.repo, ref: "tags/v1.2.3" });
});

test("creates the annotated tag and its reference only for a missing ref", async () => {
    const { client, calls } = octokit();
    await tag(client, options);
    assert.deepEqual(calls.map(([method]) => method), ["listTags", "getRef", "createTag", "createRef"]);
    assert.equal(calls[1][1].ref, "tags/v1.2.3");
    assert.equal(calls[2][1].object, options.gitCommitSha);
    assert.deepEqual(calls[3][1], {
        owner: options.owner,
        repo: options.repo,
        sha: "tag-object-sha",
        ref: "refs/tags/v1.2.3"
    });
});

test("propagates a tag creation API failure", async () => {
    const failure = new Error("invalid json response body");
    const { client, calls } = octokit({ createTag: async () => { throw failure; } });
    await assert.rejects(tag(client, options), failure);
    assert.deepEqual(calls.map(([method]) => method), ["listTags", "getRef"]);
});

test("propagates a reference creation API failure", async () => {
    const failure = new Error("reference creation failed");
    const { client } = octokit({ createRef: async () => { throw failure; } });
    await assert.rejects(tag(client, options), failure);
});

test("does not create a tag when reference lookup fails for another reason", async () => {
    const failure = Object.assign(new Error("Forbidden"), { status: 403 });
    const { client, calls } = octokit({ getRef: async () => { throw failure; } });
    await assert.rejects(tag(client, options), failure);
    assert.deepEqual(calls.map(([method]) => method), ["listTags"]);
});
