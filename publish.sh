#/usr/bin/env bash
set -e

npm run lerna:publish

./mvn/mvnPublish.sh
