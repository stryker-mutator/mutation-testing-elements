[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fmutation-testing-elements%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/mutation-testing-elements/master)
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing elements

Welcome to the mutation testing elements mono repo.

It is a [lernajs](https://lerna.js.org/) mono repository. Please see the [packages](https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages)
directory to navigate to a sub package.

## Versioning

The `mutation-testing-report-schema` and `mutation-testing-elements` versions will be kept in sync.

The schema can have major and minor releases, as well as patch releases. A bug or documentation update will mean a patch release. Backward compatible changes mean a minor release, breaking changes will mean a major release.

The mutation-testing-elements major and minor version will be in sync with the schema, however it _can have_ patch releases for changes of the elements without a schema update.

Note that this is not strict semver 2.0.0. See https://github.com/stryker-mutator/mutation-testing-elements/issues/5 for the reasoning behind it.

An example (just for clarification, versions are not based on reality):

| Schema version | Supported mutation-testing-elements implementations |
| -------------- | --------------------------------------------------- |
| `1.0.0`        | `1.0.0`, `1.0.1`                                    |
| `1.1.0`        | `1.0.0`, `1.0.1`, `1.1.0`, `1.1.1`                  |
| `2.0.0`        | `2.0.0`, `2.0.1`                                    |
| `2.0.1`        | `2.0.0`, `2.0.1`                                    |

## Releasing

Releasing is done with from the travis build server. Perform the following steps:

- Clone the repo and run `npm install`.
- Run `npm run lerna:version:patch`, `npm run lerna:version:minor` or `npm run lerna:version:major` (based on the release you want). Lerna will figure out which packages need to be released and prompt to ask if it is OK.
- After the new tag is pushed to the master branch, it should be released via a github workflow.
