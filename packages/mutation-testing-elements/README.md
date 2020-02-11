[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fmutation-testing-elements%2Fmaster%3Fmodule%3Delements)](https://badge-api.stryker-mutator.io/github.com/stryker-mutator/mutation-testing-elements/master?module=elements)
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing elements

A suite of elements designed to display a mutation testing report.

![Directory result example](https://raw.githubusercontent.com/stryker-mutator/mutation-testing-elements/master/packages/mutation-testing-elements/docs/directory-result-example.png)

![File result example](https://raw.githubusercontent.com/stryker-mutator/mutation-testing-elements/master/packages/mutation-testing-elements/docs/file-result-example.png)

***Note:** Please see https://stryker-mutator.io for an introduction to mutation testing.*

## Features

The mutation test report supports the following features:

📊 Calculates and displays the mutation score and other metrics  
📁 Group results into directories  
👓 Show mutants directly in your source code  
😎 Code highlighting with [Prism](https://prismjs.com/)  
🧙‍ Filter mutants based on the outcome  
🔗 Deep linking using anchors (uses fragment, so path will not be contaminated)  
✨ A nice (yet basic) UI with embedded [bootstrap](https://getbootstrap.com) css  
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
    }
</script>
```

Feel free to use other ways to bind the `report` property. For example, you can use `<mutation-test-report-app [report]="myReport"></mutation-test-report-app>` to bind `report` to the `myReport` property in an Angular component.

## Mutation testing report schema

The mutation testing report data is expected to be in the format of a the [mutation-testing-report-schema](https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-report-schema#readme). Please view that readme to understand the structure.

For some examples, please see the [testResources](https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-elements/testResources).

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

## Browser compatibility

These elements are built with [LitElement](https://lit-element.polymer-project.org/), which uses the Web Components set of standards. They are currently supported by all major browsers with the exception of Edge.

For compatibility with older browsers and Edge, load the Web Components polyfills: https://lit-element.polymer-project.org/guide/use#polyfills
