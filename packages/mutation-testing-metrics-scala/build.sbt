val Scala212 = "2.12.11"
val Scala213 = "2.13.3"

scalaVersion := Scala213

lazy val metrics = project
  .in(file("metrics"))
  .settings(
    sharedSettings,
    name := "mutation-testing-metrics"
  )

lazy val circe = project
  .in(file("circe"))
  .dependsOn(metrics)
  .settings(
    sharedSettings,
    name := "mutation-testing-metrics-circe",
    libraryDependencies ++= Seq(
      "io.circe"            %% "circe-core"   % "0.13.0",
      "io.circe"            %% "circe-parser" % "0.13.0",
      "org.leadpony.justify" % "justify"      % "2.1.0" % Test,
      "org.leadpony.joy"     % "joy"          % "1.3.0" % Test
    )
  )

lazy val docs = project
  .in(file("metrics-docs")) // important: it must not be docs/
  .settings(scalaVersion := Scala213, mdocOut := file("."))
  .dependsOn(circe)
  .enablePlugins(MdocPlugin)

lazy val elements = project
  .in(file("mutation-testing-elements"))
  .settings(
    npmProjectSettings,
    version := packageVersion(file("../mutation-testing-elements")),
    name := "mutation-testing-elements",
    description := "A suite of web components for a mutation testing report.",
    skip in publish := skipElementsPublish
  )

lazy val schema = project
  .in(file("mutation-testing-report-schema"))
  .settings(
    npmProjectSettings,
    version := packageVersion(file("../mutation-testing-report-schema")),
    name := "mutation-testing-report-schema",
    description := "The json schema for a mutation testing report.",
    skip in publish := skipSchemaPublish
  )

lazy val sharedSettings = Seq(
  libraryDependencies += "org.scalameta" %% "munit" % "0.7.14" % Test,
  testFrameworks := List(new TestFramework("munit.Framework")),
  scalaVersion := Scala213,
  crossScalaVersions := Seq(Scala213, Scala212),
  skip in publish := skipNormalProjectPublish,
  publishTo := sonatypePublishToBundle.value,
  version := packageVersion(file("."))
)

lazy val npmProjectSettings = Seq(
  // These are not used, but prevent the project from being published twice
  scalaVersion := Scala213,
  crossScalaVersions := Seq(Scala213),
  publishTo := sonatypePublishToBundle.value,
  // Avoid conflicts with parallel publishing
  sonatypeSessionName := s"[sbt-sonatype] npm-${name.value}-${version.value}",
  // drop off Scala suffix from artifact names.
  crossPaths := false,
  // exclude scala-library from dependencies
  autoScalaLibrary := false
)

def envVarIsTrue(envVar: String): Boolean =
  sys.env
    .get(envVar)
    .map(_.toLowerCase == "true")
    .isDefined

// Only publish if PUBLISH_ELEMENTS env var is true
lazy val skipElementsPublish = !envVarIsTrue("PUBLISH_ELEMENTS")
// Only publish if PUBLISH_SCHEMA env var is true
lazy val skipSchemaPublish = !envVarIsTrue("PUBLISH_SCHEMA")
// Default, publish except if PUBLISH_ELEMENTS or PUBLISH_SCHEMA is true
// See NPM_PROJECTS_PUBLISHING.md for more info
lazy val skipNormalProjectPublish = !skipElementsPublish || !skipSchemaPublish

def packageVersion(packageJsonDir: File): String = {
  import scala.sys.process._

  val command = Seq("node", "-p", "require('./package.json').version")
  val os      = sys.props("os.name").toLowerCase
  val panderToWindows = os match {
    case n if n contains "windows" => Seq("cmd", "/C") ++ command
    case _                         => command
  }
  Process(panderToWindows, packageJsonDir).!!.linesIterator.toIterable.last
}
