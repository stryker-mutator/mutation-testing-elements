[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fmutation-testing-elements%2Fmaster%3Fmodule%3Delements)](https://badge-api.stryker-mutator.io/github.com/stryker-mutator/mutation-testing-elements/master?module=elements)
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing elements

A suite of elements designed to display a mutation testing report.

<table>
<tbody>
<tr>
  <td><img width="300" alt="overview (light mode)" src="https://user-images.githubusercontent.com/10114577/217476452-888786b4-76cc-4901-bdf6-c86ced788fcf.png"></td>
  <td><img width="300" alt="overview (dark mode)" src="https://user-images.githubusercontent.com/10114577/217476446-51029c3d-a53a-49da-a981-9a8a7bfa2c99.png"></td>
</tr>
<tr>
  <td><img width="300" alt="mutant view (light mode)" src="https://user-images.githubusercontent.com/10114577/217476439-6a533270-7438-429b-b8f6-f715654a9bda.png"></td>
  <td><img width="300" alt="mutant view (dark mode)" src="https://user-images.githubusercontent.com/10114577/217476442-f98e6498-0665-4c5f-a740-68af6ad43f86.png"></td>
</tr>
<tr>
  <td><img width="300" alt="test view (light mode)" src="https://user-images.githubusercontent.com/10114577/217476461-f1cab2d0-6614-48e7-a0ea-664d3a2bfad9.png"></td>
  <td><img width="300" alt="test view (dark mode)" src="https://user-images.githubusercontent.com/10114577/217476457-ed5c705b-f718-41e8-8891-51dd6392a356.png"></td>
</tr>
</tbody>
</table>

**\*Note:** Please see https://stryker-mutator.io for an introduction to mutation testing.\*

## Features

The mutation test report supports the following features:

📊 Calculates and displays the mutation score and other metrics  
📁 Group results into directories  
👓 Show mutants directly in your source code  
😎 Code highlighting with [Prism](https://prismjs.com/)  
🧙‍ Filter mutants based on the outcome  
🌑 Switch between light and dark theme  
🔗 Deep linking using anchors (uses fragment, so path will not be contaminated)  
💅 A beautifully crafted UI made with [tailwind](https://tailwindcss.com/) CSS  
🎓 Adheres to [custom element best practices](https://developers.google.com/web/fundamentals/web-components/best-practices)

## Install

Install with npm:

```shell
$ npm install mutation-testing-elements
```

Add to your page:

```html
<script defer src="mutation-test-elements/dist/mutation-test-elements.js"></script>
```

Or you can use the unpkg as your CDN:

```html
<script defer src="https://www.unpkg.com/mutation-testing-elements"></script>
```

## Usage

Use the `mutation-test-report-app` element to load the mutation test report.

```html
<mutation-test-report-app src="mutation-report.json" title-postfix="Mutation Test Report"></mutation-test-report-app>
```

This loads the report from the source (`src`) and displays it.

Alternatively, you can use property binding directly:

```html
<mutation-test-report-app></mutation-test-report-app>
<script>
  document.getElementsByTagName('mutation-test-report-app').item(0).report = {
    /* ... */
  };
</script>
```

Add this snippet to change the background color of the whole page when the theme is changed from light to dark:

```html
<script>
  const app = document.getElementsByTagName('mutation-test-report-app').item(0);
  function updateTheme() {
    document.body.style.backgroundColor = app.themeBackgroundColor;
  }
  app.addEventListener('theme-changed', updateTheme);
  updateTheme();
</script>
```

Feel free to use other ways to bind the `report` property. For example, you can use `<mutation-test-report-app [report]="myReport"></mutation-test-report-app>` to bind `report` to the `myReport` property in an Angular component.

## Mutation testing report schema

The mutation testing report data is expected to be in the format of a the [mutation-testing-report-schema](https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/report-schema#readme). Please view that readme to understand the structure.

For some examples, please see the [testResources](https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/elements/testResources).

## API Reference

### `src` [`string`]

Default: `undefined`

Specify a source to load the mutation testing report from. The source is expected to be in JSON format and adhere to the [mutation-testing-report-schema](#mutation-testing-report-schema).

### `report` [`object`]

Default: `undefined`

Specify the mutation testing report directly by binding it to this property. It is expected to adhere to the [mutation-testing-report-schema](#mutation-testing-report-schema).

### `titlePostfix` [`string`]

Default: `undefined`

Specify the postfix to append to the title of the current page. It us reflected as attribute: `title-postfix`.

### `theme` [`'light' | 'dark'`]

Default: _user preference (OS setting)_

Specify in which theme the report needs to be shown. Possibilities: `'light'` or `'dark'`.

### `themeBackgroundColor` [`string`]

Read-only property with the hex code of the background-color from the current theme.

### ⚡ `theme-changed` [`CustomEvent<{ theme: string, themeBackgroundColor: string }>`]

Add an event listener that will raise an event when the theme is changed.

```js
const app = document.querySelector('mutation-test-report-app');
app.addEventListener('theme-changed', (event) => {
  console.log('new theme is', event.detail.theme);
  console.log('backgroundColor hex is', event.detail.themeBackgroundColor);
  // You can also use `app.theme` or `app.themeBackgroundColor` here.
});
```

## Browser compatibility

These elements are built with [LitElement](https://lit-element.polymer-project.org/), which uses the Web Components set of standards. They are currently supported by all major browsers with the exception of Edge.

For compatibility with older browsers and Edge, load the Web Components polyfills: https://lit-element.polymer-project.org/guide/use#polyfills

## Run tests

There are unit tests with karma and integration tests using selenium-webdriver. You can run them with `npm test` or by running `npm run test:unit` or `npm run test:integration` respectively. There is also a launch configuration so you can debug from vscode.

The integration tests also do screenshot comparisons. Currently, they only run when you're running in a headless browser, because the screenshots differ ever so slightly with the snapshots. You can run `npm run test:integration:headless` to run locally with screenshot comparison. It will compare and show you a diff file if the diff is deemed to large. Screenshot tests can be updated for your environment with `npm run test:integration:update`.

Screenshot snapshots are OS dependent, because, again, the screenshots differ ever so slightly on linux vs windows. You can update the screenshot for both linux and windows by running the "Update screenshots" workflow on your branch (with github). _Use with caution_ always double check the diff before updating!
