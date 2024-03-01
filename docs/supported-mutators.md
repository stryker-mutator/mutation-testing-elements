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

| Mutant operator           | Original | Mutated |
| ------------------------- | -------- | ------- |
| AdditionNegation          | `a + b`  | `a - b` |
| SubtractionNegation       | `a - b`  | `a + b` |
| MultiplicationNegation    | `a * b`  | `a / b` |
| DivisionNegation          | `a / b`  | `a * b` |
| RemainderToMultiplication | `a % b`  | `a * b` |

[🔝 Back to Top](#)

## Array Declaration

| Mutant operator              | Original                | Mutated       |
| ---------------------------- | ----------------------- | ------------- |
| ArrayConstructorItemsRemoval | `new Array(1, 2, 3, 4)` | `new Array()` |
| ArrayLiteralItemsRemoval     | `[1, 2, 3, 4]`          | `[ ]`         |

[🔝 Back to Top](#)

## Assignment Expression

| Mutant operator                               | Original             | Mutated              |
| --------------------------------------------- | -------------------- | -------------------- |
| AdditionAssignmentNegation                    | `+=`                 | `-=`                 |
| SubtractionAssignmentNegation                 | `-=`                 | `+=`                 |
| MultiplicationAssignmentNegation              | `*=`                 | `/=`                 |
| DivisionAssignmentNegation                    | `/=`                 | `*=`                 |
| RemainderAssignmentToMultiplicationAssignment | `%=`                 | `*=`                 |
| LeftShiftAssignmentNegation                   | `<<=`                | `>>=`                |
| RightShiftAssignmentNegation                  | `>>=`                | `<<=`                |
| BitwiseAndAssignmentNegation                  | `&=`                 | <code>&#124;=</code> |
| BitwiseOrAssignmentNegation                   | <code>&#124;=</code> | `&=`                 |
| NullCoalescingAssignmentToAndAssignment       | `??=`                | `&&=`¹               |

- ¹: Only supported by Stryker-JS

[🔝 Back to Top](#)

## Block Statement

This group has one mutant operator, the `BlockRemoval` mutant operator. This mutant operator removes the content of every block statement. For example the code:

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

| Mutant operator | Original    | Mutated    |
| --------------- | ----------- | ---------- |
| TrueNegation    | `true`      | `false`    |
| FalseNegation   | `false`     | `true`     |
| NotRemoval      | `!(a == b)` | `a == b` ¹ |

- ¹: Not supported by Stryker4s

[🔝 Back to Top](#)

## Checked Statement

Stryker.NET _specific mutator_

| Mutant operator | Original         | Mutated |
| --------------- | ---------------- | ------- |
| CheckedRemoval  | `checked(2 + 4)` | `2 + 4` |

[🔝 Back to Top](#)

## Conditional Expression

| Mutant Operator    | Original                           | Mutated                             |
| ------------------ | ---------------------------------- | ----------------------------------- |
| LessThanToFalse    | `for (var i = 0; i < 10; i++) { }` | `for (var i = 0; false; i++) { }` ¹ |
| GreaterThanToFalse | `while (a > b) { }`                | `while (false) { }`                 |
| GreaterThanToFalse | `do { } while (a > b);`            | `do { } while (false);`             |
| GreaterThanToTrue  | `if (a > b) { }`                   | `if (true) { }`                     |
| GreaterThanToFalse | `if (a > b) { }`                   | `if (false) { }`                    |
| GreaterThanToTrue  | `var x = a > b ? 1 : 2;`           | `var x = true ? 1 : 2;` ¹           |
| GreaterThanToFalse | `var x = a > b ? 1 : 2;`           | `var x = false ? 1 : 2;` ¹          |

- ¹: Not supported by Stryker4s

[🔝 Back to Top](#)

## Equality Operator

| Mutant operator          | Original  | Mutated     |
| ------------------------ | --------- | ----------- |
| LessThanBoundary         | `a < b`   | `a <= b`    |
| LessThanNegation         | `a < b`   | `a >= b`    |
| LessThanEqualBoundary    | `a <= b`  | `a < b`     |
| LessThanEqualNegation    | `a <= b`  | `a > b`     |
| GreaterThanBoundary      | `a > b`   | `a >= b`    |
| GreaterThanNegation      | `a > b`   | `a <= b`    |
| GreaterThanEqualBoundary | `a >= b`  | `a > b`     |
| GreaterThanEqualNegation | `a >= b`  | `a < b`     |
| EqualityNegation         | `a == b`  | `a != b`    |
| InequalityNegation       | `a != b`  | `a == b`    |
| StrictEqualityNegation   | `a === b` | `a !== b` ¹ |
| StrictInequalityNegation | `a !== b` | `a === b` ¹ |

- ¹: Only supported on StrykerJS and Stryker4s

[🔝 Back to Top](#)

## Logical Operator

| Mutant operator     | Original                      | Mutated                       |
| ------------------- | ----------------------------- | ----------------------------- |
| AndNegation         | `a && b`                      | <code>a &vert;&vert; b</code> |
| OrNegation          | <code>a &vert;&vert; b</code> | `a && b`                      |
| NullCoalescingToAnd | `a ?? b`                      | `a && b`                      |

[🔝 Back to Top](#)

## Method Expression

Due to differences in language syntax, method expressions are implemented differently in each Stryker framework:

### StrykerJS

| Mutant operator                  | Original             | Mutated               |
| -------------------------------- | -------------------- | --------------------- |
| EndsWithToStartsWith             | `endsWith()`         | `startsWith()`        |
| StartsWithToEndsWith             | `startsWith()`       | `endsWith()`          |
| TrimToTrimEnd                    | `trim()`             | `trimEnd()`           |
| TrimToTrimStart                  | `trimEnd()`          | `trimStart()`         |
| TrimToTrimEnd                    | `trimStart()`        | `trimEnd()`           |
| SubstrRemoval                    | `substr()`           | ` `                   |
| SubstringRemoval                 | `substring()`        | ` `                   |
| ToUpperCaseToLowerCase           | `toUpperCase()`      | ` toLowerCase()`      |
| ToLowerCaseToUpperCase           | `toLowerCase()`      | ` toUpperCase()`      |
| ToLocalLowerCaseToLocalUpperCase | `toLocalLowerCase()` | `toLocalUpperCase()`  |
| ToLocalUpperCaseToLocalLowerCase | `toLocalUpperCase()` | ` toLocalLowerCase()` |
| SortRemoval                      | `sort()`             | ` `                   |
| SomeToEvery                      | `some()`             | `every()`             |
| EveryToSome                      | `every()`            | `some()`              |
| ReverseRemoval                   | `reverse()`          | ` `                   |
| FilterRemoval                    | `filter()`           | ` `                   |
| SliceRemoval                     | `slice()`            | ` `                   |
| CharAtRemoval                    | `charAt()`           | ` `                   |
| MinToMax                         | `min()`              | `max()`               |
| MaxToMin                         | `max()`              | `min()`               |

### Stryker.NET

| Mutant operator                 | Original              | Mutated             |
| ------------------------------- | --------------------- | ------------------- |
| DistinctRemoval                 | `Distinct()`          | ` `                 |
| ReverseRemoval                  | `Reverse()`           | ` `                 |
| OrderByRemoval                  | `OrderBy()`           | ` `                 |
| OrderByDescendingRemoval        | `OrderByDescending()` | ` `                 |
| SingleOrDefaultToFirstOrDefault | `SingleOrDefault()`   | `FirstOrDefault()`  |
| FirstOrDefaultToSingleOrDefault | `FirstOrDefault()`    | `SingleOrDefault()` |
| FirstToLast                     | `First()`             | `Last()`            |
| LastToFirst                     | `Last()`              | `First()`           |
| AllToAny                        | `All()`               | `Any()`             |
| AnyToAll                        | `Any()`               | `All()`             |
| SkipToTake                      | `Skip()`              | `Take()`            |
| TakeToSkip                      | `Take()`              | `Skip()`            |
| SkipWhileToTakeWhile            | `SkipWhile()`         | `TakeWhile()`       |
| TakeWhileToSkipWhile            | `TakeWhile()`         | `SkipWhile()`       |
| MinToMax                        | `Min()`               | `Max()`             |
| MaxToMin                        | `Max()`               | `Min()`             |
| SumToCount                      | `Sum()`               | `Count()`           |
| CountToSum                      | `Count()`             | `Sum()`             |

### Stryker4s

| Mutant operator      | Original           | Mutated            |
| -------------------- | ------------------ | ------------------ |
| FilterNegation       | `a.filter(b)`      | `a.filterNot(b)`   |
| FilterNotNegation    | `a.filterNot(b)`   | `a.filter(b)`      |
| ExistsToForAll       | `a.exists(b)`      | `a.forall(b)`      |
| ForAllToExists       | `a.forall(b)`      | `a.exists(b)`      |
| TakeToDrop           | `a.take(b)`        | `a.drop(b)`        |
| DropToTake           | `a.drop(b)`        | `a.take(b)`        |
| TakeRightNegation    | `a.takeRight(b)`   | `a.dropRight(b)`   |
| DropRightNegation    | `a.dropRight(b)`   | `a.takeRight(b)`   |
| TakeWhileToDropWile  | `a.takeWhile(b)`   | `a.dropWhile(b)`   |
| DropWhileToTakeWhile | `a.dropWhile(b)`   | `a.takeWhile(b)`   |
| IsEmptyNegation      | `a.isEmpty`        | `a.nonEmpty`       |
| IsNonEmptyNegation   | `a.nonEmpty`       | `a.isEmpty`        |
| IndexOfToLastIndexOf | `a.indexOf`        | `a.lastIndexOf(b)` |
| LastIndexOfToIndexOf | `a.lastIndexOf(b)` | `a.indexOf(b)`     |
| MaxToMin             | `a.max`            | `a.min`            |
| MinToMax             | `a.min`            | `a.max`            |
| MaxByToMinBy         | `a.maxBy(b)`       | `a.minBy(b)`       |
| MinByToMaxBy         | `a.minBy(b)`       | `a.maxBy(b)`       |

[🔝 Back to Top](#)

## Object literal

| Mutant operator         | Original         | Mutated |
| ----------------------- | ---------------- | ------- |
| ObjectPropertiesRemoval | `{ foo: 'bar' }` | `{ }`   |

[🔝 Back to Top](#)

## Optional chaining

| Mutant operator            | Original   | Mutated   |
| -------------------------- | ---------- | --------- |
| OptionalMemberToRequired   | `foo?.bar` | `foo.bar` |
| OptionalComputedToRequired | `foo?.[1]` | `foo[1]`  |
| OptionalCallToRequired     | `foo?.()`  | `foo()`   |

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

| Mutant operator                 | Original                               | Mutated               |
| ------------------------------- | -------------------------------------- | --------------------- |
| FilledStringToEmpty             | `"foo"` (filled string)                | `""` (empty string)   |
| EmptyStringToFilled             | `""` (empty string)                    | `"Stryker was here!"` |
| FilledInterpolatedStringToEmpty | `s"foo ${bar}"` (string interpolation) | `s""` ¹               |
| FilledInterpolatedStringToEmpty | `\`foo ${bar}\``                       | `\`\``                |

¹ For Stryker4s, only works with string interpolation and not other types of interpolation (like [Scalameta quasiquotes](https://scalameta.org/docs/trees/guide.html#with-quasiquotes)) to avoid compile errors

[🔝 Back to Top](#)

## Unary Operator

| Mutant operator | Original | Mutated |
| --------------- | -------- | ------- |
| PlusNegation    | `+a`     | `-a`    |
| MinNegation     | `-a`     | `+a`    |

[🔝 Back to Top](#)

## Update Operator

| Mutant operator          | Original | Mutated |
| ------------------------ | -------- | ------- |
| PostfixIncrementNegation | `a++`    | `a--`   |
| PostfixDecrementNegation | `a--`    | `a++`   |
| PrefixIncrementNegation  | `++a`    | `--a`   |
| PrefixDecrementNegation  | `--a`    | `++a`   |

[🔝 Back to Top](#)
