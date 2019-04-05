#!/usr/bin/env bash
set -e

# Called from packages/$project by npm postpublish, so the pwd is already the project folder

RESOURCES_DIR=${1:-dist}
echo $RESOURCES_DIR
PROJ_BASE=$(basename `pwd`)
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g')

echo "Deploying $PROJ_BASE $PACKAGE_VERSION..."

echo "Copying $RESOURCES_DIR files to resources"
mkdir -p mvn/resources
cp -r $RESOURCES_DIR mvn/resources/$PROJ_BASE

echo "Starting deploy process"
cd mvn
mvn -P release versions:set "-DnewVersion=$PACKAGE_VERSION"
mvn -P release deploy --settings ../../../mvn/settings.xml
