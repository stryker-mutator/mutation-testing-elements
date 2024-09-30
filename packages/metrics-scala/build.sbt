val Scala212 = "2.12.20"
val Scala213 = "2.13.15"
val Scala3   = "3.3.4"

val CrossScalaVersions = Seq(Scala213, Scala212, Scala3)

scalaVersion := Scala213

// Separate session name to prevent conflicts during publishing
sonatypeSessionName := ((skipElementsPublish, skipSchemaPublish) match {
  case (false, true) => s"[sbt-sonatype] npm-elements-${name.value}-${version.value}" // Elements only
  case (true, false) => s"[sbt-sonatype] npm-schema-${name.value}-${version.value}"   // Schema only
  case _             => sonatypeSessionName.value                                     // Original
})

lazy val metrics = projectMatrix
  .in(file("metrics"))
  .settings(
    sharedSettings,
    name := "mutation-testing-metrics"
  )
  .jvmPlatform(scalaVersions = CrossScalaVersions)
  .jsPlatform(
    scalaVersions = CrossScalaVersions
  )

lazy val circe = projectMatrix
  .in(file("circe"))
  .dependsOn(metrics)
  .settings(
    sharedSettings,
    name := "mutation-testing-metrics-circe",
    libraryDependencies ++= Seq(
      "io.circe" %%% "circe-core"   % "0.14.10",
      "io.circe" %%% "circe-parser" % "0.14.10"
    )
  )
  .jvmPlatform(
    scalaVersions = CrossScalaVersions,
    settings = Seq(
      libraryDependencies ++= Seq(
        // This schema validator is JVM-only, so we can only run tests on the JVM and not Scala.js
        "org.leadpony.justify" % "justify"     % "3.1.0" % Test,
        "org.leadpony.joy"     % "joy-classic" % "2.1.0" % Test
      )
    )
  )
  .jsPlatform(
    scalaVersions = CrossScalaVersions
  )

lazy val docs = project
  .in(file("metrics-docs")) // important: it must not be docs/
  .settings(
    scalaVersion := Scala3,
    mdocOut      := file("."),
    mdocExtraArguments += "--no-link-hygiene"
  )
  .dependsOn(circe.jvm(Scala3))
  .enablePlugins(MdocPlugin)
  .disablePlugins(TpolecatPlugin)

lazy val elements = project
  .in(file("elements"))
  .settings(
    npmProjectSettings,
    version        := packageVersion(file("../elements")),
    name           := "mutation-testing-elements",
    description    := "A suite of web components for a mutation testing report.",
    publish / skip := skipElementsPublish
  )

lazy val schema = project
  .in(file("report-schema"))
  .settings(
    npmProjectSettings,
    version        := packageVersion(file("../report-schema")),
    name           := "mutation-testing-report-schema",
    description    := "The json schema for a mutation testing report.",
    publish / skip := skipSchemaPublish
  )

lazy val sharedSettings = Seq(
  libraryDependencies += "org.scalameta" %%% "munit" % "1.0.2" % Test,
  publish / skip                          := skipNormalProjectPublish,
  publishTo                               := sonatypePublishToBundle.value
)

lazy val npmProjectSettings = Seq(
  // These are not used, but prevent the project from being published twice
  scalaVersion       := Scala213,
  crossScalaVersions := Seq(Scala213),
  publishTo          := sonatypePublishToBundle.value,
  // Avoid conflicts with parallel publishing
  sonatypeSessionName := s"[sbt-sonatype] npm-${name.value}-${version.value}",
  // drop off Scala suffix from artifact names.
  crossPaths := false,
  // exclude scala-library from dependencies
  autoScalaLibrary := false
)

inThisBuild(
  Seq(
    // Don't publish root project
    publish / skip := true,
    version        := packageVersion(file(".")),
    organization   := "io.stryker-mutator",
    versionScheme  := Some("semver-spec"),
    homepage       := Some(url("https://stryker-mutator.io/")),
    licenses += "Apache-2.0" -> url(
      "https://www.apache.org/licenses/LICENSE-2.0"
    ),
    scmInfo := Some(
      ScmInfo(
        url("https://github.com/stryker-mutator/mutation-testing-elements"),
        "scm:git:https://github.com/stryker-mutator/mutation-testing-elements.git",
        "scm:git:git@github.com:stryker-mutator/mutation-testing-elements.git"
      )
    ),
    developers := List(
      Developer(
        "hugo-vrijswijk",
        "Hugo van Rijswijk",
        "hugo.v.rijswijk@gmail.com",
        url("https://github.com/hugo-vrijswijk")
      )
    )
  )
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
  scala.util
    .Try(
      Process(panderToWindows, packageJsonDir).!!.linesIterator.toIterable.last
    )
    .getOrElse("0.0.0-NO-NODE-SNAPSHOT")
}
