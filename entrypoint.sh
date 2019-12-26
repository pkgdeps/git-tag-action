#!/bin/bash
 
# check this version is enable to release or not
npx can-npm-publish --verbose
if [ $? -eq 1 ] ; then
  exit 255
fi
 
# get current version from package.json
VERSION=$(cat package.json | jq .version)
GIT_TAG_NAME=${git_tag_prefix}${VERSION}
echo "add new tag to GitHub: ${GIT_TAG_NAME}"
 
# Add tag to GitHub
API_URL="https://api.github.com/repos/${github_repo}/git/refs"
 
curl -s -X POST $API_URL \
  -H "Authorization: token $github_token" \
  -d @- << EOS
{
  "ref": "refs/tags/${GIT_TAG_NAME}",
  "sha": "${git_commit_sha}"
}
EOS