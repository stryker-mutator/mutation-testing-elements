#!/usr/bin/env bash
set -e

PACKAGE_VERSION=$(cat ../package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo "Deploying $PACKAGE_VERSION..."

echo "Importing gpg key..."
echo "$PGP_SECRET" | base64 --decode | gpg --import

echo "Starting deploy process"
mvn -P release versions:set "-DnewVersion=$PACKAGE_VERSION"
mvn -P release deploy --settings settings.xml
