#!/bin/bash

for package in elements metrics 
do
    if [ "$BRANCH_NAME" ]
    then
        echo "Downloading $package/$BRANCH_NAME..."
        curl -s --dump-header .header.out --create-dirs -o packages/$package/reports/stryker-incremental.json https://dashboard.stryker-mutator.io/api/reports/github.com/stryker-mutator/mutation-testing-elements/$BRANCH_NAME?module=$package
        if cat .header.out | grep HTTP | grep 404
        then
            echo "- falling back to $package/master..."
            curl -s --dump-header .header.out --create-dirs -o packages/$package/reports/stryker-incremental.json https://dashboard.stryker-mutator.io/api/reports/github.com/stryker-mutator/mutation-testing-elements/master?module=$package
        fi
        rm .header.out
    else
        echo "Downloading $package/master..."
        curl -s --create-dirs -o packages/$package/reports/stryker-incremental.json https://dashboard.stryker-mutator.io/api/reports/github.com/stryker-mutator/mutation-testing-elements/master?module=$package
    fi
done
echo 'Done ✅'
