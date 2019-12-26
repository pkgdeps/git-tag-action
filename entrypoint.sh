#!/bin/bash
 
# check this version is enable to release or not
npx can-npm-publish
if [ $? -eq 1 ] ; then
  exit 255
fi
 
# get current version from package.json
VERSION=$(cat package.json | jq .version)
GIT_TAG_NAME=${GIT_TAG_PREFIX}${VERSION}
echo "add new tag to GitHub: ${GIT_TAG_NAME}"
 
# Add tag to GitHub
API_URL="https://api.github.com/repos/${GITHUB_REPO}/git/refs"
 
curl -s -X POST $API_URL \
  -H "Authorization: token $GITHUB_TOKEN" \
  -d @- << EOS
{
  "ref": "refs/tags/${GIT_TAG_NAME}",
  "sha": "${GIT_COMMIT_SHA}"
}
EOS