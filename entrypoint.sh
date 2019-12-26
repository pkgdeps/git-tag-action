#!/bin/bash

cd "$GITHUB_WORKSPACE"
# check this version is enable to release or not
npx can-npm-publish --verbose
if [ $? -eq 1 ] ; then
  exit 255
fi
 
# get current version from package.json
VERSION=$(cat package.json | jq .version)
GIT_TAG_NAME=${INPUT_GIT_TAG_PREFIX}${VERSION}
echo "add new tag to GitHub: ${GIT_TAG_NAME}"
 
# Add tag to GitHub
API_URL="https://api.github.com/repos/${INPUT_GITHUB_REPO}/git/refs"
 
curl -s -X POST $API_URL \
  -H "Authorization: token ${INPUT_GITHUB_TOKEN}" \
  -d @- << EOS
{
  "ref": "refs/tags/${GIT_TAG_NAME}",
  "sha": "${INPUT_GIT_COMMIT_SHA}"
}
EOS