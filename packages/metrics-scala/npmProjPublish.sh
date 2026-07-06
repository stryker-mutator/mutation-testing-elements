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

# Stream sbt output live via `tee`, and also persist it. When this script runs
# inside a lerna `postpublish` lifecycle hook, lerna swallows the child's stdout,
# so we additionally append the full output to the GitHub Actions run summary to
# make the sbt error retrievable regardless of how the parent handles stdout.
SBT_LOG="$(mktemp)"
set -o pipefail
sbt_status=0
sbt "publishSigned; sonaRelease" 2>&1 | tee "$SBT_LOG" || sbt_status=$?

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### sbt publish output — ${PROJ_BASE}"
    echo '```'
    cat "$SBT_LOG"
    echo '```'
  } >> "$GITHUB_STEP_SUMMARY"
fi

exit "$sbt_status"
