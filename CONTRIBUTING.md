# Contribute to mutation-testing-elements

This is the contribution guide for mutation-testing-elements. Great to have you here! Here are a few ways you can help make this project better.

## Learn & listen

Get in touch with us through twitter or via the [Stryker Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM).

- [@stryker_mutator](https://twitter.com/stryker_mutator)
- [@\_nicojs](https://twitter.com/_nicojs)
- [@hugovr@mastodon.social](https://mastodon.social/@hugovr)

## Code style

Please adhere to our [editorconfig](https://editorconfig.org), [eslint](https://eslint.org/) rules and prettier rules.

If you're using vscode, please open the [workspace.code-workspace](./workspace.code-workspace) file (note: **not** the directory) and install the recommended extensions.

## Dependencies

Install the following:

- An LTS version of [NodeJS](https://nodejs.org/)
- For metrics-scala:
  - [Java JDK](https://openjdk.java.net/), a recent version like 11, 17 or 21 is recommended
  - [sbt](https://www.scala-sbt.org/), to build and test the project

## Running stuff locally

We use [nx](https://nx.dev/) to manage the packages in this repository. You don't have to install it globally. The packages themselves can be found in the [packages folder](./packages/).

### Cheatsheet for NX

Here are some common nx commands:

- `npx nx show projects` (optionall with `--affected`)
- `npx nx run-many --target test`
- `npx nx test metrics`
- `npx nx run metrics:test`
- `npm run all -- --base=master`

In general, whenever you want to `npm run $A` something, instead call `npx nx $A $PROJECT` where `$PROJECT` is the name of the project you want to run it on. For example, `npm run test:unit` in `packages/elements` becomes `npx nx test:unit elements`.

## VSCode environment configuration

Some quick notes to help you get started:

1. On the left side, you can see all stryker projects and plugins. Open files from there.
1. Use `CTRL+Shift+B` (or `⌘+Shift+B` on OSX) to run the _build task_. This runs `npm start`, compiling any changes you make in the background.
1. Use `CTRL+Shift+D` (or `⌘⇧D` on OSX) to open up the _debug_ pane. Here you can select a config to run.

Have fun!

## Debugging mutation-testing-elements

### Unit tests

To debug the unit tests, you can place a `debugger` statement on the place you want to debug. Then, start the unit tests and open the dev tools to trigger the debug statement.

## Integration tests

Install the VS Code Playwright plugin (from the recommended extensions). Then run any test from the sidebar in a test file.

## Running Stryker on mutation-testing-elements

We support mutation testing mutation-testing-elements with Stryker! You can run it with `npx nx run PACKAGE_NAME:stryker`, for example `npx nx run elements:stryker`.

## Adding new features

New features are welcome! Either as requests or proposals.

1. Please create an issue first or let us know via the [Stryker Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)
1. Create a fork on your github account.
1. When writing your code, please conform to the existing coding style.
   See [.editorconfig](https://github.com/stryker-mutator/stryker-js/blob/master/.editorconfig), the [typescript guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines) and our tslint.json
   - You can check if there are lint issues using `npx nx run-many -t lint`.
   - You can automatically fix a lot of lint issues using `npm run lint:fix`
1. Please create or edit unit tests or integration tests.
1. Run the tests using `npx nx run test`
1. Push your changes and create [a pull request](https://github.com/stryker-mutator/mutation-testing-elements/compare)

Don't get discouraged! We estimate that the response time from the
maintainers is around 3 days or so.

# Bug triage

Found a bug? Don't worry, we'll fix it, or you can ;)

Please report a bug report on our [issues page](https://github.com/stryker-mutator/mutation-testing-elements/issues). In this please:

1. Label the issue as bug
2. Explain what the bug is in clear English
3. Include reproduction steps
   This can be an example project, code snippet, etc
4. Include the expected behavior.
5. Include actual behavior.
6. Add more details if required (e.g. which browser, which test runner, which versions, etc)
