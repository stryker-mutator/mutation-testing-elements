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

## Arithmetic Operator

| Mutant operator                              | Original | Mutated |
| -------------------------------------------- | -------- | ------- |
| AdditionOperatorNegation                     | `a + b`  | `a - b` |
| SubtractionOperatorNegation                  | `a - b`  | `a + b` |
| MultiplicationOperatorNegation               | `a * b`  | `a / b` |
| DivisionOperatorNegation                     | `a / b`  | `a * b` |
| RemainderOperatorToMultiplicationReplacement | `a % b`  | `a * b` |

[🔝 Back to Top](#)

## Array Declaration

| Mutant operator              | Original                | Mutated       |
| ---------------------------- | ----------------------- | ------------- |
| ArrayConstructorItemsRemoval | `new Array(1, 2, 3, 4)` | `new Array()` |
| ArrayLiteralItemsRemoval     | `[1, 2, 3, 4]`          | `[ ]`         |

[🔝 Back to Top](#)

## Assignment Expression

| Mutant operator                                 | Original              | Mutated              |
| ------------------------- |---------------------| --------------------- | -------------------- |
| AdditionAssignmentNegation                      | `+=`                  | `-=`                 |
| SubtractionAssignmentNegation                   | `-=`                  | `+=`                 |
| MultiplicationAssignmentNegation                | `*=`                  | `/=`                 |
| DivisionAssignmentNegation                      | `/=`                  | `*=`                 |
| RemainderAssignmentToMultiplicationReplacement  | `%=`                  | `*=`                 |
| LeftShiftAssignmentNegation                     | `<<=`                 | `>>=`                |
| RightShiftAssignmentNegation                    | `>>=`                 | `<<=`                |
| BitwiseAndAssignmentNegation                    | `&=`                  | <code>&#124;=</code> |
| BitwiseOrAssignmentNegation                     | <code>&#124;=</code>  | `&=`                 |
| NullishCoalescingOperatorToLogicalAndAssignment | `??=`                 | `&&=`¹               |

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

| Mutant operator      | Original    | Mutated    |
| -------------------- | ----------- | ---------- |
| TrueLiteralNegation  | `true`      | `false`    |
| FalseLiteralNegation | `false`     | `true`     |
| LogicalNotRemoval    | `!(a == b)` | `a == b` ¹ |

- ¹: Not supported by Stryker4s

[🔝 Back to Top](#)

## Checked Statement

Stryker.NET _specific mutator_

| Mutant operator          | Original         | Mutated |
| ------------------------ | ---------------- | ------- |
| CheckedExpressionRemoval | `checked(2 + 4)` | `2 + 4` |

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

| Mutant operator                  | Original  | Mutated     |
| -------------------------------- | --------- | ----------- |
| LessThanOperatorBoundary         | `a < b`   | `a <= b`    |
| LessThanOperatorNegation         | `a < b`   | `a >= b`    |
| LessThanEqualOperatorBoundary    | `a <= b`  | `a < b`     |
| LessThanEqualOperatorNegation    | `a <= b`  | `a > b`     |
| GreaterThanOperatorBoundary      | `a > b`   | `a >= b`    |
| GreaterThanOperatorNegation      | `a > b`   | `a <= b`    |
| GreaterThanEqualOperatorBoundary | `a >= b`  | `a > b`     |
| GreaterThanEqualOperatorNegation | `a >= b`  | `a < b`     |
| EqualityOperatorNegation         | `a == b`  | `a != b`    |
| InequalityOperatorNegation       | `a != b`  | `a == b`    |
| StrictEqualityOperatorNegation   | `a === b` | `a !== b` ¹ |
| StrictInequalityOperatorNegation | `a !== b` | `a === b` ¹ |

- ¹: Only supported on StrykerJS and Stryker4s

[🔝 Back to Top](#)

## Logical Operator

| Mutant operator                                  | Original                      | Mutated                       |
| ------------------------------------------------ | ----------------------------- | ----------------------------- |
| LogicalAndOperatorNegation                       | `a && b`                      | <code>a &vert;&vert; b</code> |
| LogicalOrOperatorNegation                        | <code>a &vert;&vert; b</code> | `a && b`                      |
| NullishCoalescingOperatorToLogicalAndReplacement | `a ?? b`                      | `a && b`                      |

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

| Mutant operator                                      | Original              | Mutated             |
| ---------------------------------------------------- | --------------------- | ------------------- |
| DistinctMethodCallRemoval                            | `Distinct()`          | ` `                 |
| ReverseMethodCallRemoval                             | `Reverse()`           | ` `                 |
| OrderByMethodCallRemoval                             | `OrderBy()`           | ` `                 |
| OrderByDescendingMethodCallRemoval                   | `OrderByDescending()` | ` `                 |
| SingleOrDefaultMethodCallToFirstOrDefaultReplacement | `SingleOrDefault()`   | `FirstOrDefault()`  |
| FirstOrDefaultMethodCallToSingleOrDefaultReplacement | `FirstOrDefault()`    | `SingleOrDefault()` |
| FirstMethodCallNegation                              | `First()`             | `Last()`            |
| LastMethodCallNegation                               | `Last()`              | `First()`           |
| AllMethodCallNegation                                | `All()`               | `Any()`             |
| AnyMethodCallNegation                                | `Any()`               | `All()`             |
| SkipMethodCallToTakeReplacement                      | `Skip()`              | `Take()`            |
| TakeMethodCallToSkipReplacement                      | `Take()`              | `Skip()`            |
| SkipWhileMethodCallToTakeWhileReplacement            | `SkipWhile()`         | `TakeWhile()`       |
| TakeWhileMethodCallToSkipWhileReplacement            | `TakeWhile()`         | `SkipWhile()`       |
| MinMethodCallNegation                                | `Min()`               | `Max()`             |
| MaxMethodCallNegation                                | `Max()`               | `Min()`             |
| SumMethodCallToCountReplacement                      | `Sum()`               | `Count()`           |
| CountMethodCallToSumReplacement                      | `Count()`             | `Sum()`             |

### Stryker4s

| Mutant operator                           | Original           | Mutated            |
| ----------------------------------------- | ------------------ | ------------------ |
| FilterMethodCallNegation                  | `a.filter(b)`      | `a.filterNot(b)`   |
| FilterNotMethodCallNegation               | `a.filterNot(b)`   | `a.filter(b)`      |
| ExistsMethodCallNegation                  | `a.exists(b)`      | `a.forall(b)`      |
| ForAllMethodCallNegation                  | `a.forall(b)`      | `a.exists(b)`      |
| TakeMethodCallNegation                    | `a.take(b)`        | `a.drop(b)`        |
| DropMethodCallNegation                    | `a.drop(b)`        | `a.take(b)`        |
| TakeRightMethodCallNegation               | `a.takeRight(b)`   | `a.dropRight(b)`   |
| DropRightMethodCallNegation               | `a.dropRight(b)`   | `a.takeRight(b)`   |
| TakeWhileMethodCallNegation               | `a.takeWhile(b)`   | `a.dropWhile(b)`   |
| DropWhileMethodCallNegation               | `a.dropWhile(b)`   | `a.takeWhile(b)`   |
| IsEmptyMethodCallNegation                 | `a.isEmpty`        | `a.nonEmpty`       |
| IsNonEmptyMethodCallNegation              | `a.nonEmpty`       | `a.isEmpty`        |
| IndexOfMethodCallToLastIndexOfReplacement | `a.indexOf`        | `a.lastIndexOf(b)` |
| LastIndexOfMethodCallToIndexOfReplacement | `a.lastIndexOf(b)` | `a.indexOf(b)`     |
| MaxMethodCallNegation                     | `a.max`            | `a.min`            |
| MinMethodCallNegation                     | `a.min`            | `a.max`            |
| MaxByMethodCallNegation                   | `a.maxBy(b)`       | `a.minBy(b)`       |
| MinByMethodCallNegation                   | `a.minBy(b)`       | `a.maxBy(b)`       |

[🔝 Back to Top](#)

## Object literal

| Mutant operator                | Original         | Mutated |
| ------------------------------ | ---------------- | ------- |
| ObjectLiteralPropertiesRemoval | `{ foo: 'bar' }` | `{ }`   |

[🔝 Back to Top](#)

## Optional chaining

| Mutant operator                                 | Original   | Mutated   |
| ----------------------------------------------- | ---------- | --------- |
| OptionalMemberExpressionOptionalRemoval         | `foo?.bar` | `foo.bar` |
| OptionalComputedMemberExpressionOptionalRemoval | `foo?.[1]` | `foo[1]`  |
| OptionalCallExpressionOptionalRemoval           | `foo?.()`  | `foo()`   |

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

| Mutant operator                            | Original                               | Mutated               |
| ------------------------------------------ | -------------------------------------- | --------------------- |
| FilledStringLiteralToEmptyReplacement      | `"foo"` (filled string)                | `""` (empty string)   |
| EmptyStringLiteralToFilledReplacement      | `""` (empty string)                    | `"Stryker was here!"` |
| FilledInterpolatedStringToEmptyReplacement | `s"foo ${bar}"` (string interpolation) | `s""` ¹               |
| FilledInterpolatedStringToEmptyReplacement | `\`foo ${bar}\``                       | `\`\``                |

¹ For Stryker4s, only works with string interpolation and not other types of interpolation (like [Scalameta quasiquotes](https://scalameta.org/docs/trees/guide.html#with-quasiquotes)) to avoid compile errors

[🔝 Back to Top](#)

## Unary Operator

| Mutant operator           | Original | Mutated |
| ------------------------- | -------- | ------- |
| UnaryPlusOperatorNegation | `+a`     | `-a`    |
| UnaryMinOperatorNegation  | `-a`     | `+a`    |

[🔝 Back to Top](#)

## Update Operator

| Mutant operator                  | Original | Mutated |
| -------------------------------- | -------- | ------- |
| PostfixIncrementOperatorNegation | `a++`    | `a--`   |
| PostfixDecrementOperatorNegation | `a--`    | `a++`   |
| PrefixIncrementOperatorNegation  | `++a`    | `--a`   |
| PostfixDecrementOperatorNegation | `--a`    | `++a`   |

[🔝 Back to Top](#)
