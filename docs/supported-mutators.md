---
title: Supported mutators
---

All Stryker versions support a variety of different mutators. We've aligned on a standard naming scheme so it is easy to switch and compare implementations. The difference in support is listed below.

## Support

| Mutator                                           | [Stryker](https://github.com/stryker-mutator/stryker) | [Stryker.NET](../stryker-net/Configuration.md) | [Stryker4s](../stryker4s/CONFIGURATION.md) |
| ------------------------------------------------- | :---------------------------------------------------: | :--------------------------------------------: | :----------------------------------------: |
| [Arithmetic Operator](#arithmetic-operator)       |                          ✅                           |                       ✅                       |                     ❌                     |
| [Array Declaration](#array-declaration)           |                          ✅                           |                       ✅                       |                     ❌                     |
| [Assignment Expression](#assignment-expression)   |                          ❌                           |                       ✅                       |                    n/a                     |
| [Block Statement](#block-statement)               |                          ✅                           |                       ❌                       |                     ❌                     |
| [Boolean Literal](#boolean-literal)               |                          ✅                           |                       ✅                       |                    ️✅                     |
| [Checked Statement](#checked-statement)           |                          n/a                          |                       ✅                       |                    n/a                     |
| [Conditional Expression](#conditional-expression) |                          ✅                           |                       ✅                       |                     ✅                     |
| [Equality Operator](#equality-operator)           |                          ✅                           |                       ✅                       |                     ✅                     |
| [Logical Operator](#logical-operator)             |                          ✅                           |                       ✅                       |                     ✅                     |
| [Method Expression](#method-expression)           |                          ❌                           |                       ✅                       |                     ✅                     |
| [String Literal](#string-literal)                 |                          ✅                           |                       ✅                       |                     ✅                     |
| [Unary Operator](#unary-operator)                 |                          ✅                           |                       ✅                       |                     ❌                     |
| [Update Operator](#update-operator)               |                          ✅                           |                       ✅                       |                    n/a                     |

## Arithmetic Operator

| Original | Mutated |
| -------- | ------- |
| `a + b`  | `a - b` |
| `a - b`  | `a + b` |
| `a * b`  | `a / b` |
| `a / b`  | `a * b` |
| `a % b`  | `a * b` |

[🔝 Back to Top](#supported-mutators)

## Array Declaration

| Original                | Mutated       |
| ----------------------- | ------------- |
| `new Array(1, 2, 3, 4)` | `new Array()` |
| `[1, 2, 3, 4]`          | `[ ]`         |

[🔝 Back to Top](#supported-mutators)

## Assignment Expression

| Original | Mutated |
| -------- | ------- |
| `+=`     | `-=`    |
| `-=`     | `+=`    |
| `*=`     | `/=`    |
| `/=`     | `*=`    |
| `%=`     | `*=`    |
| `<<=`    | `>>=`   |
| `>>=`    | `<<=`   |
| `&=`     | `\|=`   |
| `\|=`    | `&=`    |

[🔝 Back to Top](#supported-mutators)

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

[🔝 Back to Top](#supported-mutators)

## Boolean Literal

| Original    | Mutated    |
| ----------- | ---------- |
| `true`      | `false`    |
| `false`     | `true`     |
| `!(a == b)` | `a == b` ¹ |

- ¹: Not supported by Stryker4s

[🔝 Back to Top](#supported-mutators)

## Checked Statement

Stryker.NET _specific mutator_

| Original         | Mutated |
| ---------------- | ------- |
| `checked(2 + 4)` | `2 + 4` |

[🔝 Back to Top](#supported-mutators)

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

[🔝 Back to Top](#supported-mutators)

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

[🔝 Back to Top](#supported-mutators)

## Logical Operator

| Original   | Mutated    |
| ---------- | ---------- |
| `a && b`   | `a \|\| b` |
| `a \|\| b` | `a && b`   |

[🔝 Back to Top](#supported-mutators)

## Method Expression

Due to differences in language syntax, method expressions are implemented differently in each Stryker framework:

### Stryker.NET:

| Original              | Mutated             |
| --------------------- | ------------------- |
| `Distinct()`          | ``                  |
| `Reverse()`           | ``                  |
| `OrderBy()`           | ``                  |
| `OrderByDescending()` | ``                  |
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

### Stryker4s:

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

[🔝 Back to Top](#supported-mutators)

## String Literal

| Original                               | Mutated               |
| -------------------------------------- | --------------------- |
| `"foo"` (non-empty string)             | `""` (empty string)   |
| `""` (empty string)                    | `"Stryker was here!"` |
| `s"foo ${bar}"` (string interpolation) | `s""` ¹               |

¹ For Stryker4s, only works with string interpolation and not other types of interpolation (like [Scalameta quasiquotes](https://scalameta.org/docs/trees/guide.html#with-quasiquotes)) to avoid compile errors

[🔝 Back to Top](#supported-mutators)

## Unary Operator

| Original | Mutated |
| -------- | ------- |
| `+a`     | `-a`    |
| `-a`     | `+a`    |

[🔝 Back to Top](#supported-mutators)

## Update Operator

| Original | Mutated |
| -------- | ------- |
| `a++`    | `a--`   |
| `a--`    | `a++`   |
| `++a`    | `--a`   |
| `--a`    | `++a`   |

[🔝 Back to Top](#supported-mutators)
