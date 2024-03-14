---
title: Supported mutators
custom_edit_url: https://github.com/stryker-mutator/mutation-testing-elements/edit/master/docs/supported-mutators.md
---

All Stryker versions support a variety of different mutators. We've aligned on a standard naming scheme so it is easy to switch and compare implementations. The difference in support is listed below.

## Support

| Mutator                                           | [StrykerJS](../stryker-js/introduction.md) | [Stryker.NET](../stryker-net/getting-started.md) | [Stryker4s](../stryker4s/getting-started.md) |
| ------------------------------------------------- | :----------------------------------------: | :----------------------------------------------: | :------------------------------------------: |
| [Arithmetic Operator](#arithmetic-operator)       |                     ✅                     |                        ✅                        |                      ❌                      |
| [Array Declaration](#array-declaration)           |                     ✅                     |                        ✅                        |                      ❌                      |
| [Assignment Expression](#assignment-expression)   |                     ❌                     |                        ✅                        |                     n/a                      |
| [Block Statement](#block-statement)               |                     ✅                     |                        ✅                        |                      ❌                      |
| [Boolean Literal](#boolean-literal)               |                     ✅                     |                        ✅                        |                     ️✅                      |
| [Checked Statement](#checked-statement)           |                    n/a                     |                        ✅                        |                     n/a                      |
| [Conditional Expression](#conditional-expression) |                     ✅                     |                        ✅                        |                      ✅                      |
| [Equality Operator](#equality-operator)           |                     ✅                     |                        ✅                        |                      ✅                      |
| [Logical Operator](#logical-operator)             |                     ✅                     |                        ✅                        |                      ✅                      |
| [Method Expression](#method-expression)           |                     ✅                     |                        ✅                        |                      ✅                      |
| [Object literal](#object-literal)                 |                     ✅                     |                       n/a                        |                     n/a                      |
| [Optional chaining](#optional-chaining)           |                     ✅                     |                        ❌                        |                     n/a                      |
| [Regex](#regex)                                   |                     ✅                     |                        ✅                        |                      ✅                      |
| [String Literal](#string-literal)                 |                     ✅                     |                        ✅                        |                      ✅                      |
| [Unary Operator](#unary-operator)                 |                     ✅                     |                        ✅                        |                      ❌                      |
| [Update Operator](#update-operator)               |                     ✅                     |                        ✅                        |                     n/a                      |
| [Math Methods](#math-methods)                     |                     ❌                     |                        ✅                        |                      ❌                      |

## Arithmetic Operator

| Original | Mutated |
| -------- | ------- |
| `a + b`  | `a - b` |
| `a - b`  | `a + b` |
| `a * b`  | `a / b` |
| `a / b`  | `a * b` |
| `a % b`  | `a * b` |

[🔝 Back to Top](#)

## Array Declaration

| Original                | Mutated       |
| ----------------------- | ------------- |
| `new Array(1, 2, 3, 4)` | `new Array()` |
| `[1, 2, 3, 4]`          | `[ ]`         |

[🔝 Back to Top](#)

## Assignment Expression

| Original             | Mutated              |
| -------------------- | -------------------- |
| `+=`                 | `-=`                 |
| `-=`                 | `+=`                 |
| `*=`                 | `/=`                 |
| `/=`                 | `*=`                 |
| `%=`                 | `*=`                 |
| `<<=`                | `>>=`                |
| `>>=`                | `<<=`                |
| `&=`                 | <code>&#124;=</code> |
| <code>&#124;=</code> | `&=`                 |
| `??=`                | `&&=`¹               |

- ¹: Only supported by Stryker-JS

[🔝 Back to Top](#)

## Block Statement

Removes the content of every block statement. For example the code:

```javascript
function saySomething() {
  console.log('Hello world!');
}
```

becomes:

```javascript
function saySomething() {}
```

[🔝 Back to Top](#)

## Boolean Literal

| Original    | Mutated    |
| ----------- | ---------- |
| `true`      | `false`    |
| `false`     | `true`     |
| `!(a == b)` | `a == b` ¹ |

- ¹: Not supported by Stryker4s

[🔝 Back to Top](#)

## Checked Statement

Stryker.NET _specific mutator_

| Original         | Mutated |
| ---------------- | ------- |
| `checked(2 + 4)` | `2 + 4` |

[🔝 Back to Top](#)

## Conditional Expression

| Original                           | Mutated                             |
| ---------------------------------- | ----------------------------------- |
| `for (var i = 0; i < 10; i++) { }` | `for (var i = 0; false; i++) { }` ¹ |
| `while (a > b) { }`                | `while (false) { }`                 |
| `do { } while (a > b);`            | `do { } while (false);`             |
| `if (a > b) { }`                   | `if (true) { }`                     |
| `if (a > b) { }`                   | `if (false) { }`                    |
| `var x = a > b ? 1 : 2;`           | `var x = true ? 1 : 2;` ¹           |
| `var x = a > b ? 1 : 2;`           | `var x = false ? 1 : 2;` ¹          |

- ¹: Not supported by Stryker4s

[🔝 Back to Top](#)

## Equality Operator

| Original  | Mutated     |
| --------- | ----------- |
| `a < b`   | `a <= b`    |
| `a < b`   | `a >= b`    |
| `a <= b`  | `a < b`     |
| `a <= b`  | `a > b`     |
| `a > b`   | `a >= b`    |
| `a > b`   | `a <= b`    |
| `a >= b`  | `a > b`     |
| `a >= b`  | `a < b`     |
| `a == b`  | `a != b`    |
| `a != b`  | `a == b`    |
| `a === b` | `a !== b` ¹ |
| `a !== b` | `a === b` ¹ |

- ¹: Only supported on StrykerJS and Stryker4s

[🔝 Back to Top](#)

## Logical Operator

| Original                      | Mutated                       |
| ----------------------------- | ----------------------------- |
| `a && b`                      | <code>a &vert;&vert; b</code> |
| <code>a &vert;&vert; b</code> | `a && b`                      |
| `a ?? b`                      | `a && b`                      |

[🔝 Back to Top](#)

## Method Expression

Due to differences in language syntax, method expressions are implemented differently in each Stryker framework:

### StrykerJS

| Original             | Mutated               |
| -------------------- | --------------------- |
| `endsWith()`         | `startsWith()`        |
| `startsWith()`       | `endsWith()`          |
| `trim()`             | ` `                   |
| `trimEnd()`          | `trimStart()`         |
| `trimStart()`        | `trimEnd()`           |
| `substr()`           | ` `                   |
| `substring()`        | ` `                   |
| `toUpperCase()`      | ` toLowerCase()`      |
| `toLowerCase()`      | ` toUpperCase()`      |
| `toLocalLowerCase()` | `toLocalUpperCase()`  |
| `toLocalUpperCase()` | ` toLocalLowerCase()` |
| `sort()`             | ` `                   |
| `some()`             | `every()`             |
| `every()`            | `some()`              |
| `reverse()`          | ` `                   |
| `filter()`           | ` `                   |
| `slice()`            | ` `                   |
| `charAt()`           | ` `                   |
| `min()`              | `max()`               |
| `max()`              | `min()`               |

### Stryker.NET

| Original              | Mutated             |
| --------------------- | ------------------- |
| `Distinct()`          | ` `                 |
| `Reverse()`           | ` `                 |
| `OrderBy()`           | ` `                 |
| `OrderByDescending()` | ` `                 |
| `SingleOrDefault()`   | `FirstOrDefault()`  |
| `FirstOrDefault()`    | `SingleOrDefault()` |
| `First()`             | `Last()`            |
| `Last()`              | `First()`           |
| `All()`               | `Any()`             |
| `Any()`               | `All()`             |
| `Skip()`              | `Take()`            |
| `Take()`              | `Skip()`            |
| `SkipWhile()`         | `TakeWhile()`       |
| `TakeWhile()`         | `SkipWhile()`       |
| `Min()`               | `Max()`             |
| `Max()`               | `Min()`             |
| `Sum()`               | `Count()`           |
| `Count()`             | `Sum()`             |
| `MinBy()`             | `MaxBy()`           |
| `MaxBy()`             | `MinBy()`           |
| `SkipLast()`          | `TakeLast()`        |
| `TakeLast()`          | `SkipLast()`        |
| `Order()`             | `OrderDescending()` |
| `OrderDescending()`   | `Order()`           |
| `UnionBy()`           | `IntersectBy()`     |
| `IntersectBy()`       | `UnionBy()`         |

### Stryker4s

| Original           | Mutated            |
| ------------------ | ------------------ |
| `a.filter(b)`      | `a.filterNot(b)`   |
| `a.filterNot(b)`   | `a.filter(b)`      |
| `a.exists(b)`      | `a.forall(b)`      |
| `a.forall(b)`      | `a.exists(b)`      |
| `a.take(b)`        | `a.drop(b)`        |
| `a.drop(b)`        | `a.take(b)`        |
| `a.takeRight(b)`   | `a.dropRight(b)`   |
| `a.dropRight(b)`   | `a.takeRight(b)`   |
| `a.takeWhile(b)`   | `a.dropWhile(b)`   |
| `a.dropWhile(b)`   | `a.takeWhile(b)`   |
| `a.isEmpty`        | `a.nonEmpty`       |
| `a.nonEmpty`       | `a.isEmpty`        |
| `a.indexOf`        | `a.lastIndexOf(b)` |
| `a.lastIndexOf(b)` | `a.indexOf(b)`     |
| `a.max`            | `a.min`            |
| `a.min`            | `a.max`            |
| `a.maxBy(b)`       | `a.minBy(b)`       |
| `a.minBy(b)`       | `a.maxBy(b)`       |

[🔝 Back to Top](#)

## Object literal

| Original         | Mutated |
| ---------------- | ------- |
| `{ foo: 'bar' }` | `{ }`   |

[🔝 Back to Top](#)

## Optional chaining

| Original   | Mutated   |
| ---------- | --------- |
| `foo?.bar` | `foo.bar` |
| `foo?.[1]` | `foo[1]`  |
| `foo?.()`  | `foo()`   |

[🔝 Back to Top](#)

## Regex

Regular expressions are parsed and mutated separately. This is done by recognizing `new Regex("...")` call signatures in each language. Scala and JavaScript also have shorthand syntax, `/regex/` and `"regex".r` respectively, which are mutated as well.

StrykerJS and Stryker4s use the awesome [⚔ weapon-regex](https://github.com/stryker-mutator/weapon-regex#weapon-regex) to mutate their regular expressions. All Level 1 mutations are generated.

Strings and literals identified to a regex are mutated in the following way:

| Original    | Mutated       |
| ----------- | ------------- |
| `^abc`      | `abc`         |
| `abc$`      | `abc`         |
| `[abc]`     | `[^abc]`      |
| `[^abc]`    | `[abc]`       |
| `\d`        | `\D`          |
| `\D`        | `\d`          |
| `\s`        | `\S`          |
| `\S`        | `\s`          |
| `\w`        | `\W`          |
| `\W`        | `\w`          |
| `a?`        | `a`           |
| `a*`        | `a`           |
| `a+`        | `a`           |
| `a{1,3}`    | `a`           |
| `a*?`       | `a`           |
| `a+?`       | `a`           |
| `a{1,3}?`   | `a`           |
| `a?+`       | `a`           |
| `a*+`       | `a`           |
| `a++`       | `a`           |
| `a{1,3}+`   | `a`           |
| `(?=abc)`   | `(?!abc)`     |
| `(?!abc)`   | `(?=abc)`     |
| `(?<=abc)`  | `(?<!abc)`    |
| `(?<!abc)`  | `(?<=abc)`    |
| `\p{Alpha}` | `\P{Alpha}` ¹ |
| `\P{Alpha}` | `\p{Alpha}` ¹ |
| `\P{Alpha}` | `\p{Alpha}` ¹ |

¹ JVM only.

[🔝 Back to Top](#)

## String Literal

| Original                               | Mutated               |
| -------------------------------------- | --------------------- |
| `"foo"` (non-empty string)             | `""` (empty string)   |
| `""` (empty string)                    | `"Stryker was here!"` |
| `s"foo ${bar}"` (string interpolation) | `s""` ¹               |

¹ For Stryker4s, only works with string interpolation and not other types of interpolation (like [Scalameta quasiquotes](https://scalameta.org/docs/trees/guide.html#with-quasiquotes)) to avoid compile errors

[🔝 Back to Top](#)

## Unary Operator

| Original | Mutated |
| -------- | ------- |
| `+a`     | `-a`    |
| `-a`     | `+a`    |

[🔝 Back to Top](#)

## Update Operator

| Original | Mutated |
| -------- | ------- |
| `a++`    | `a--`   |
| `a--`    | `a++`   |
| `++a`    | `--a`   |
| `--a`    | `++a`   |

[🔝 Back to Top](#)

## Math Methods

> Currently only implemented for Stryker.NET. Future implementations for other languages can be implemented differently.

| Original                        | Mutated                         |
| ------------------------------- | ------------------------------- |
| `Math.Acos()`                   | `Math.Acosh()`                  |
| `Math.Acos()`                   | `Math.Asin()`                   |
| `Math.Acos()`                   | `Math.Atan()`                   |
| `Math.Acosh()`                  | `Math.Acos()`                   |
| `Math.Acosh()`                  | `Math.Asinh()`                  |
| `Math.Acosh()`                  | `Math.Atanh()`                  |
| `Math.Asin()`                   | `Math.Asinh()`                  |
| `Math.Asin()`                   | `Math.Acos()`                   |
| `Math.Asin()`                   | `Math.Atan()`                   |
| `Math.Asinh()`                  | `Math.Asin()`                   |
| `Math.Asinh()`                  | `Math.Acosh()`                  |
| `Math.Asinh()`                  | `Math.Atanh()`                  |
| `Math.Atan()`                   | `Math.Atanh()`                  |
| `Math.Atan()`                   | `Math.Acos()`                   |
| `Math.Atan()`                   | `Math.Asin()`                   |
| `Math.Atanh()`                  | `Math.Atan()`                   |
| `Math.Atanh()`                  | `Math.Acosh()`                  |
| `Math.Atanh()`                  | `Math.Asinh()`                  |
| `Math.BitDecrement()`           | `Math.BitIncrement()`           |
| `Math.BitIncrement()`           | `Math.BitDecrement()`           |
| `Math.Ceiling()`                | `Math.Floor()`                  |
| `Math.Cos()`                    | `Math.Cosh()`                   |
| `Math.Cos()`                    | `Math.Sin()`                    |
| `Math.Cos()`                    | `Math.Tan()`                    |
| `Math.Cosh()`                   | `Math.Cos()`                    |
| `Math.Cosh()`                   | `Math.Sinh()`                   |
| `Math.Cosh()`                   | `Math.Tanh()`                   |
| `Math.Exp()`                    | `Math.Log()`                    |
| `Math.Floor()`                  | `Math.Ceiling()`                |
| `Math.Log()`                    | `Math.Exp()`                    |
| `Math.Log()`                    | `Math.Pow()`                    |
| `Math.MaxMagnitude()`           | `Math.MinMagnitude()`           |
| `Math.MinMagnitude()`           | `Math.MaxMagnitude()`           |
| `Math.Pow()`                    | `Math.Log()`                    |
| `Math.ReciprocalEstimate()`     | `Math.ReciprocalSqrtEstimate()` |
| `Math.ReciprocalSqrtEstimate()` | `Math.ReciprocalEstimate()`     |
| `Math.ReciprocalSqrtEstimate()` | `Math.Sqrt()`                   |
| `Math.Sin()`                    | `Math.Sinh()`                   |
| `Math.Sin()`                    | `Math.Cos()`                    |
| `Math.Sin()`                    | `Math.Tan()`                    |
| `Math.Sinh()`                   | `Math.Sin()`                    |
| `Math.Sinh()`                   | `Math.Cosh()`                   |
| `Math.Sinh()`                   | `Math.Tanh()`                   |
| `Math.Tan()`                    | `Math.Tanh()`                   |
| `Math.Tan()`                    | `Math.Cos()`                    |
| `Math.Tan()`                    | `Math.Sin()`                    |
| `Math.Tanh()`                   | `Math.Tan()`                    |
| `Math.Tanh()`                   | `Math.Cosh()`                   |
| `Math.Tanh()`                   | `Math.Sinh()`                   |

[🔝 Back to Top](#)
