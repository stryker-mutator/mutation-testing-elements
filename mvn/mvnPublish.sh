#!/usr/bin/env bash
set -e

echo "Importing gpg key..."
echo "$PGP_SECRET" | base64 --decode | gpg --import

function deploy() {
  ORIG_DIR=$PWD
  PROJ_DIR=$1

  cd $PROJ_DIR

  PROJ_BASE=$(basename `pwd`)

  mkdir -p mvn/resources
  cp -r dist mvn/resources/$PROJ_BASE

  PACKAGE_VERSION=$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[", ]//g')

  echo "Deploying $PROJ_BASE $PACKAGE_VERSION..."

  echo "Starting deploy process"
  cd mvn
  mvn -P release versions:set "-DnewVersion=$PACKAGE_VERSION"
  mvn -P release deploy --settings $ORIG_DIR/mvn/settings.xml

  cd $ORIG_DIR
}

deploy packages/mutation-testing-elements
deploy packages/mutation-testing-report-schema
