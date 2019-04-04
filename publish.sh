#/usr/bin/env bash
set -e

npm run lerna:publish

cd packages/mutation-testing-elements/mvn && ./mvnPublish.sh
