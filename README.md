#  action-package-version-to-git-tag

[![Docker Image CI](https://github.com/pkgdeps/action-package-version-to-git-tag/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/pkgdeps/action-package-version-to-git-tag/actions)

This action runs that get `${version}` from `package.json` and `git tag ${version}` for the repository.

- Define the tag from `package.json`'s `version`
  - also support `git_tag_prefix` option.
- Push tag if the tag is not bumped on the repository

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
        uses: pkgdeps/action-package-version-to-git-tag@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo: ${{ github.repository }}
          git_commit_sha: ${{ github.sha }}
          git_tag_prefix: "v"
```

## UseCase

1. [Manual] Update Version: `npm vession {patch,minor,major}`
2. [Manual] Push: `git push` or Merge the Pull Request
3. [CI] Publish to npm and Push a tag to GitHub  

This Release flow is defined in [.github/workflows/publish.yml](./.github/workflows/publish.yml)

```yaml
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
        with:
          node-version: 12.x
          registry-url: 'https://npm.pkg.github.com'
      - name: install
        run: npm install
      - name: test
        run: npm test
      # Publish to npm if this version is not published
      - name: publish
        run: |
          npx can-npm-publish --verbose && npm publish || echo "Does not publish"
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      # Push tag to GitHub if the version's tag is not tagged
      - name: package-version-to-git-tag
        uses: pkgdeps/action-package-version-to-git-tag@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo: ${{ github.repository }}
          git_commit_sha: ${{ github.sha }}
```

- [pkgdeps/npm-github-package-example: npm registry to GitHub Package Registry example.](https://github.com/pkgdeps/npm-github-package-example)

## Options

```yaml
inputs:
  version:
    description: 'define version explicitly. if it is not defined, use package.json version'
    required: false
  github_token:
    description: 'GITHUB_TOKEN'
    required: true
  git_commit_sha:
    description: 'Git commit SHA'
    required: true
  git_tag_prefix:
    description: "prefix for git tag. Example) 'v'"
    required: false
    default: ""
  github_repo:
    description: 'GitHub repository path. Example) pkgdeps/test'
    required: true
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

Please check `NODE_AUTH_TOKEN`

```
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
