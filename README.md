# pkgdeps/git-tag-action [![Actions Status: Release](https://github.com/pkgdeps/git-tag-action/workflows/Release/badge.svg)](https://github.com/pkgdeps/git-tag-action/actions?query=workflow%3A"Release") [![Actions Status: test](https://github.com/pkgdeps/git-tag-action/workflows/test/badge.svg)](https://github.com/pkgdeps/git-tag-action/actions?query=workflow%3A"test")

This action do `git tag ${version}` to the repository, but it is idempotent. 

- Push the tag if the tag does not exist on the repository

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
        uses: pkgdeps/git-tag-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo: ${{ github.repository }}
          git_commit_sha: ${{ github.sha }}
          version: "1.0.0"
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
      # Push tag to GitHub if package.json version's tag is not tagged
      - name: package-version
        run: node -p -e '`PACKAGE_VERSION=${require("./package.json").version}`' >> $GITHUB_ENV
      - name: package-version-to-git-tag
        uses: pkgdeps/git-tag-action@v2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_repo: ${{ github.repository }}
          version: ${{ env.PACKAGE_VERSION }}
          git_commit_sha: ${{ github.sha }}
          git_tag_prefix: "v"
```

- [pkgdeps/npm-github-package-example: npm registry to GitHub Package Registry example.](https://github.com/pkgdeps/npm-github-package-example)

## Options

```yaml
inputs:
  version:
    description: 'Git Tag version'
    required: true
  github_token:
    description: 'use secrets.GITHUB_TOKEN'
    required: true
  git_commit_sha:
    description: 'Git commit SHA'
    required: false
  git_tag_prefix:
    description: "prefix for git tag. Example) 'v'"
    required: false
    default: ""
  github_repo:
    description: 'GitHub repository path. Example) azu/test'
    required: true
```

## Release

1. https://github.com/pkgdeps/git-tag-action
2. Create new tag like "v2.0.0"
3. CI publish "v2.0.0", "v2.0", and "v2"

## CHANGELOG

- 2.0.0: tag is annotated tag instead of lightweight tag
    - Rename `action-package-version-to-git-tag` to `git-tag-action`

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
