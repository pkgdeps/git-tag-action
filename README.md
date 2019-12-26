#  action-package-version-to-git-tag

[![Docker Image CI](https://github.com/azu/action-package-version-to-git-tag/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/azu/action-package-version-to-git-tag/actions)

This action runs that get `${version}` from `package.json` and `git tag ${version}` for the repository.

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
      - name: package-version-to-git-tag
        uses: azu/action-package-version-to-git-tag@v1
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

## FAQ

### Error: npm ERR! code E401

Occur following error:

```
npx: installed 57 in 6.945s
npm ERR! code E401
npm ERR! Unable to authenticate, need: Basic realm="GitHub Package Registry"

npm ERR! A complete log of this run can be found in:
npm ERR!     /github/home/.npm/_logs/2019-12-26T08_02_20_108Z-debug.log
```