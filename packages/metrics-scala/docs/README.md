[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fmutation-testing-elements%2Fmaster%3Fmodule%3Dmetrics-scala)](https://badge-api.stryker-mutator.io/github.com/stryker-mutator/mutation-testing-elements/master?module=metrics-scala)
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing metrics (Scala)

Zero-dependency library to calculate mutation testing metrics in Scala.

See [mutant states and metrics in the Stryker handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#readme) for more details about mutation testing metrics.

Cross-compiled for Scala 2.12, 2.13 and 3.1 on JVM and Scala.js. If you want to use this library but require another target or platform (such as [Scala Native](https://www.scala-native.org/)) feel free to [create an issue](https://github.com/stryker-mutator/mutation-testing-elements/issues/new)!

## Usage example

Add the dependency to your project [![Maven Central](https://img.shields.io/maven-central/v/io.stryker-mutator/mutation-testing-metrics_2.13.svg?label=Maven%20Central&colorB=brightgreen)](https://search.maven.org/artifact/io.stryker-mutator/mutation-testing-metrics_2.13):

```scala
libraryDependencies += "io.stryker-mutator" %% "mutation-testing-metrics" % version
```

Or for Scala.js:

```scala
libraryDependencies += "io.stryker-mutator" %%% "mutation-testing-metrics" % version
```

The `mutation-testing-elements` and `mutation-testing-report-schema` projects are also published, see [NPM_PROJECTS_PUBLISHING](./NPM_PROJECTS_PUBLISHING.md) for more information.

First create the mutation test report:

```scala mdoc:silent
import mutationtesting._
import io.circe.JsonObject

val report = MutationTestResult[JsonObject](thresholds = Thresholds(high = 80, low = 10),
  files = Map(
    "src/stryker4s/Stryker4s.scala" -> FileResult(
      source = "case class Stryker4s(foo: String)",
      mutants = Seq(
        MutantResult("1", "BinaryOperator", "-", Location(Position(1, 2), Position(2, 3)), status = MutantStatus.Killed)
      )
    )
  )
)
```

The `MutationTestResult` case classes generate a JSON compliant with the [mutation-testing JSON schema](https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/report-schema/src/mutation-testing-report-schema.json). It has a type parameter `[C]` for the type of the used configuration, which can be any JSON object.

```scala mdoc:reset:invisible
// Read actual json for more interesting metrics
import scala.io.Source
import io.circe.parser.decode
import io.circe.JsonObject
import mutationtesting._
import mutationtesting.circe.mutationTestResultDecoder

val json = Source.fromFile("../elements/testResources/scala-example/mutation-report.json").mkString

val report = decode[MutationTestResult[JsonObject]](json) match {
  case Left(err)  => throw err
  case Right(rep) => rep
}
```

Then calculate and use metrics from that report:

```scala mdoc:silent
val metrics: MetricsResult = Metrics.calculateMetrics(report)
```

That report will have all the metrics you need:

```scala mdoc
val mutationScore = metrics.mutationScore
val killed = metrics.killed
val survived = metrics.survived
```

## mutation-testing-metrics-circe

Circe transcodings are provided by the `mutation-testing-metrics-circe` library to work with JSON if you don't want the extra dependency on `circe-generic`. It has two dependencies: `circe-core` and `circe-parser`.

```scala
libraryDependencies += "io.stryker-mutator" %% "mutation-testing-metrics-circe" % version
```

### Encoding & decoding

Import the codec:

```scala mdoc:silent
import io.circe.syntax._
import mutationtesting.circe._

val encoded: io.circe.Json = report.asJson

val decoded: Either[io.circe.Error, MutationTestResult[JsonObject]] = decode[MutationTestResult[JsonObject]](encoded.toString)
```

## API reference

### `MetricsResult`

A `MetricsResult` has the following properties, as described in [the handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md):

```scala mdoc
metrics.killed
metrics.survived
metrics.timeout
metrics.noCoverage
metrics.compileErrors
metrics.runtimeErrors
metrics.ignored
metrics.totalDetected
metrics.totalUndetected
metrics.totalCovered
metrics.totalValid
metrics.totalInvalid
metrics.totalMutants
metrics.mutationScore
metrics.mutationScoreBasedOnCoveredCode
```

- `MetricsResult` is a sealed trait with three implementations:
  - `MetricsResultRoot`: The root of a `MetricsResult`, contains zero or more `MetricsResult`'s
  - `MetricsDirectory`: Representation of a directory. Has a directory name and zero or more `MetricsResult`'s
  - `MetricsFile`: Representation of a file with mutated code. Has a filename and zero or more `MetricMutant`'s
- `MetricMutant`: Contains a [`MutantStatus`](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#mutant-states)

## Contributing

To use this project, you will need a [JDK](https://adoptium.net/) and sbt. The recommended way to install sbt is with with [Coursier](https://get-coursier.io/). Alternatively, on macOS/Linux [sbt-extras](https://github.com/dwijnand/sbt-extras), or on Windows using the [official .msi](https://www.scala-sbt.org/download.html) are also options.

This is a normal sbt project, you can compile code with `sbt compile` and run tests
with `sbt test`. Running `sbt +test` will compile and test all targets. For more information on cross-compilation in sbt, see <https://www.scala-sbt.org/1.x/docs/Cross-Build.html>.

This readme uses [mdoc](https://scalameta.org/mdoc/). To edit it, please edit the readme in the `docs/` folder and call `sbt docs/mdoc` to compile the readme in the root of the project.
