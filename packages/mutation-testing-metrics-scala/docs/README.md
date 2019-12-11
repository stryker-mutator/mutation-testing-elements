# Mutation testing metrics (Scala)

Zero-dependency library to calculate mutation testing metrics in Scala.

See [mutant states and metrics in the Stryker handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#readme) for more details about mutation testing metrics.

Cross-compiled for Scala 2.12, 2.13, [Dotty](https://dotty.epfl.ch/), [Scala.js 0.6.x](http://www.scala-js.org/) and [Scala Native 0.3.x](https://www.scala-native.org/).

## Usage example

Add the dependency to your project [![Maven Central](https://img.shields.io/maven-central/v/io.stryker-mutator/mutation-testing-metrics_2.13.svg?label=Maven%20Central&colorB=brightgreen)](https://search.maven.org/artifact/io.stryker-mutator/mutation-testing-metrics_2.13):

```scala
libraryDependencies += "io.stryker-mutator" %% "mutation-testing-metrics" % version
```

If you use Scala.js or Scala Native, use `%%%` instead after the groupId.

First create the mutation test report:

```scala mdoc:silent
import mutationtesting._
val report = MutationTestReport(thresholds = Thresholds(high = 80, low = 10),
  files = Map(
    "src/stryker4s/Stryker4s.scala" -> MutationTestResult(
      source = "case class Stryker4s(foo: String)",
      mutants = Seq(
        MutantResult("1", "BinaryOperator", "-", Location(Position(1, 2), Position(2, 3)), status = MutantStatus.Killed)
      )
    )
  )
)
```

The `MutationTestReport` case classes generate a JSON compliant with the [mutation-testing JSON schema](https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/mutation-testing-report-schema/src/mutation-testing-report-schema.json).

```scala mdoc:reset:invisible
// Read actual json for more interesting metrics
import scala.io.Source
import io.circe.parser.decode
import mutationtesting._
import mutationtesting.MutationReportDecoder._
val json = Source.fromFile("../mutation-testing-elements/testResources/scala-example/mutation-report.json").mkString

val report = decode[MutationTestReport](json) match {
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

### Encoding

Import the encoder:

```scala mdoc:silent
import io.circe.syntax._
import mutationtesting.MutationReportEncoder._

val encoded = report.asJson
```

### Decoding

Import the decoder:

```scala mdoc:silent
import io.circe.parser.decode
import mutationtesting.MutationReportDecoder._

val decoded = decode[MutationTestReport](json)
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

- `MetricsResult` is a trait with three implementations:
  - `MetricsResultRoot`: The root of a `MetricsResult`, contains zero or more `MetricsResult`'s
  - `MetricsDirectory`: Representation of a directory. Has a directory name and zero or more `MetricsResult`'s
  - `MetricsFile`: Representation of a file with mutated code. Has a filename and zero or more `MetricMutant`'s
- `MetricMutant`: Contains a [`MutantStatus`](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#mutant-states)

## Contributing

To use this project, you will need sbt. The recommended way on macOS/Linux is with [sbt-extras](https://github.com/paulp/sbt-extras). On Windows, you can install sbt using the [official .msi](https://www.scala-sbt.org/download.html).

This project uses the [sbt-crossproject](https://github.com/portable-scala/sbt-crossproject) plugin for multiple build targets. You can compile code with `sbt compile` and run tests
with `sbt test`. Running `sbt +test` will compile and test all targets. 

In CI, JS and Native will only be compiled, while tests are run on the JVM project to provide faster CI builds. Publishing is done on all targets. For more information on
cross-compilation in sbt, see <https://www.scala-sbt.org/1.x/docs/Cross-Build.html>.

This readme uses [mdoc](https://scalameta.org/mdoc/). To edit it, please edit the readme in docs and call `sbt docs/mdoc` to compile the readme in the root of the project.
