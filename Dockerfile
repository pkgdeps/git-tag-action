FROM node:current-alpine

RUN apk --no-cache add jq git

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
