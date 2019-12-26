#  action-npm-publish-with-git-tag

[![Docker Image CI](https://github.com/azu/action-npm-publish-with-git-tag/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/azu/action-npm-publish-with-git-tag/actions)
[![Release](https://img.shields.io/github/release/azu/action-npm-publish-with-git-tag.svg?maxAge=43200)](https://github.com/azu/action-npm-publish-with-git-tag/releases)

This action runs `npm publish` and `git tag` for the repository.

## Usage

You create workflow file like `.github/workflows/publish.yml`.

```yml
name: publish
on:
  push:
    branches:
      - master
    tags:
      - "!*"
jobs:
  eslint:
    name: Publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: npm-publish-with-git-tag
        uses: azu/action-npm-publish-with-git-tag@v1
        with:
          GITHUB_TOKEN: ${{ GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
          GIT_COMMIT_SHA: ${{ github.sha }}
```

## Release

  npm version {patch,minor,major}
  git push && git push --tags