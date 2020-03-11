#!/bin/bash

# get current version from package.json or env
if [ -n "$INPUT_VERSION" ] ; then
  VERSION=$INPUT_VERSION
else
  VERSION=$(cat package.json | jq -r .version)
fi
GIT_TAG_NAME=${INPUT_GIT_TAG_PREFIX}${VERSION}
echo "add new tag to GitHub: ${GIT_TAG_NAME}"

# Add tag to GitHub
GET_API_URL="https://api.github.com/repos/${INPUT_GITHUB_REPO}/git/ref/tags/${GIT_TAG_NAME}"
POST_API_URL="https://api.github.com/repos/${INPUT_GITHUB_REPO}/git/refs"
# exist tag
http_status_code=$(curl -LI $GET_API_URL -o /dev/null -w '%{http_code}\n' -s \
  -H "Authorization: token ${INPUT_GITHUB_TOKEN}")
# if tag is not found, tagged
if [ "$http_status_code" -ne "404" ] ; then
  echo "already tagged: ${GIT_TAG_NAME} "
  exit 0
fi
curl -s -X POST $POST_API_URL \
  -H "Authorization: token ${INPUT_GITHUB_TOKEN}" \
  -d @- << EOS
{
  "ref": "refs/tags/${GIT_TAG_NAME}",
  "sha": "${INPUT_GIT_COMMIT_SHA}"
}
EOS
