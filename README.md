#  action-npm-publish-with-git-tag

[![Docker Image CI](https://github.com/azu/action-npm-publish-with-git-tag/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/azu/action-npm-publish-with-git-tag/actions)

This action runs `npm publish` and `git tag` for the repository.

## Usage

You create workflow file like `.github/workflows/publish.yml`.

```yml
name: publish
env:
  CI: true
on:
  push:
    branches:
      - master
    tags:
      - "!*"
jobs:
  release:
    name: Setup
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v1
      - name: setup Node
        uses: actions/setup-node@v1
      - name: npm-publish-with-git-tag
        uses: azu/action-npm-publish-with-git-tag@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo: ${{ github.repository }}
          git_commit_sha: ${{ github.sha }}
```

## Release


    npm version {patch,minor,major}
    git push && git push --tags

## Reference

- [GitHub Actionsでnpmに自動でリリースするworkflowを作ってみた ｜ Developers.IO](https://dev.classmethod.jp/etc/github-actions-npm-automatic-release/)