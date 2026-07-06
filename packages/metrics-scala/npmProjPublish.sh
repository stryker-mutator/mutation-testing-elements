#!/usr/bin/env bash
set -e

# 1st argument, or dist folder
DIST_BASE=${1:-dist}
# Full directory name
DIST_DIR=$PWD/$DIST_BASE
# Current folder name
PROJ_BASE=$(basename `pwd`)

echo "Deploying $PROJ_BASE $PACKAGE_VERSION..."

cd ../metrics-scala

SBT_RESOURCES_DIR=$PROJ_BASE/src/main/resources
mkdir -p $SBT_RESOURCES_DIR

echo "Copying $DIST_BASE files to resources"
cp -r $DIST_DIR $SBT_RESOURCES_DIR/$PROJ_BASE

# Start from a clean local staging bundle
rm -rf target/sona-staging

# Stream sbt output live via `tee`
SBT_LOG="$(mktemp)"
set -o pipefail
sbt_status=0
sbt "publishSigned; sonaRelease" 2>&1 | tee "$SBT_LOG" || sbt_status=$?

exit "$sbt_status"
