# Mutation testing metrics (Scala)

Zero-dependency library to calculate mutation testing metrics in Scala.

See [mutant states and metrics in the Stryker handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#readme) for more details about mutation testing metrics.

Cross-compiled for Scala 2.12, 2.13, [Dotty](https://dotty.epfl.ch/), [Scala.js 0.6.x](http://www.scala-js.org/) and [Scala Native 0.3.x](https://www.scala-native.org/).

## Usage example

Add the dependency to your project [![Maven Central](https://img.shields.io/maven-central/v/io.stryker-mutator/mutation-testing-metrics_2.13.svg?label=Maven%20Central&colorB=brightgreen)](https://search.maven.org/artifact/io.stryker-mutator/mutation-testing-metrics_2.13):

```scala
libraryDependencies += "io.stryker-mutator" %% "mutation-testing-metrics" % version
```

First create the mutation test report:

```scala mdoc
import mutationtesting._
val report = MutationTestReport(thresholds = ???, files = ???)
```

Then calculate and use metrics from that report:

```scala mdoc
import mutationtesting.{Metrics, MetricsResult}
val metrics: MetricsResult = Metrics.calculateMetrics(report)

val mutationScore: Double = metrics.mutationScore
val killed: Int = metrics.killed
val survived: Int = metrics.survived
```

The `MutationTestReport` case classes generate a JSON compliant with the mutation-testing JSON schema (as verified by [tests](metrics/.jvm/src/test/scala/mutationtesting/SchemaTest.scala)).

Example usage with Circe:

```scala mdoc
import io.circe.Encoder
import io.circe.syntax._
import mutationtesting.MutationReportEncoder._

val json = report.asJson
```

## API reference

### `MetricsResult`

A `MetricsResult` has the following properties, as described in [the handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md): 
 
* `killed`
* `survived`
* `timeout`
* `noCoverage`
* `compileErrors`
* `totalDetected`
* `totalUndetected`
* `totalCovered`
* `totalValid`
* `totalInvalid`
* `totalMutants`
* `mutationScore`
* `mutationScoreBasedOnCoveredCode`

A `MetricsResult` is a trait with three implementations:

- `MetricsResultRoot`: The root of a `MetricsResult`, contains zero or more `MetricsResult`'s
- `MetricsDirectory`: Representation of a directory. Has a directory name and zero or more `MetricsResult`'s
- `MetricsFile`: Representation of a file with mutated code. Has a filename and zero or more `MetricMutant`'s
- `MetricMutant`: Contains a [`MutantStatus`](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#mutant-states)

## Contributing

This project uses the [sbt-crossproject](https://github.com/portable-scala/sbt-crossproject) plugin for multiple build targets. You can compile code with `sbt compile` and run tests
with `sbt test`. Running `sbt +test` will compile and test all targets. 

In CI, JS and Native will only be compiled, while tests are run on the JVM project to provide faster CI builds. Publishing is done on all targets. For more information on
cross-compilation in sbt, see <https://www.scala-sbt.org/1.x/docs/Cross-Build.html>.
