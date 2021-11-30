---
title: Static mutants
custom_edit_url: https://github.com/stryker-mutator/mutation-testing-elements/edit/master/docs/static-mutants.md
---

In mutation testing, not all mutants are created equal. The performance cost for some of them is higher than others. Of all mutants, _static mutants_ have the most noticeable performance impact and are sometimes not even supported. This page explains what they are and how Stryker handles them.

## What is a static mutant

A static mutant is a mutant that is executed once on startup instead of when the tests are running. 

Take this small JavaScript example:

```js
// greet.js
const hi = '👋';

export function greet(name) {
  return `${hi} ${name}`;
}

// greet.spec.js
import { greet } from './greet.js';

it('should greet me', () => {
  expect(greet('me')).toBe('👋 me');
});
```

When you run StrykerJS on this code, it will create a mutant for the `hi` constant:

```diff
-const hi = '👋';
+const hi = ''; 
```

All Stryker frameworks use mutant schemata, or mutation switching, to activate mutations during test executing. This means that the actual code Stryker produces looks more like this:

```js
const hi = global.activeMutant === '1' ? '' : '👋';
```

The goal is that Stryker would be able to activate this mutant during test execution by setting `global.activeMutant` to `'1'`. However, since this mutant is only executed once during startup. Activating or de-activating the mutant won't help. The `hi` const here is already declared, and activating mutant '1' doesn't change that. 

This mutant is referred to as a _static mutant_. They are executed once and cannot be activated or de-activated later during test runtime.

You can identify static mutants in your report with the 🗿 static emoji.

![static mutant](img/static-mutant.png)

## How to deal with static mutants

You can deal with static mutants in two ways:

1. You can ignore them<br />
   The mutants will be shown in your report with the "Ignored" state and won't count towards your mutation score. This feature is called `--ignoreStatic`
2. You can run them<br />
  The static mutants will get a fresh test environment to run in. This might require a browser page refresh or the creation of a new process or app domain. Test filtering is limited since per test coverage cannot be determined. 

## What Stryker does

Different Stryker versions use different approaches here. In the table below, you can see which choices are available per framework.

| Framework | Detect | Support run | Support ignore | Default |
|--|--|--|--|--|
| StrykerJS | ✅ | ✅ | ✅* | Run |
| Stryker.NET| ❌ | ✅ | ❌ | Run |
| Stryker.NET| ✅ | ❌ | ✅ | Ignore |

\* Using `--ignoreStatic`