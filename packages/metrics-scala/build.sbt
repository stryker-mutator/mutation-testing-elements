import org.typelevel.scalacoptions.{ScalaVersion, ScalacOptions}

val Scala212 = "2.12.21"
val Scala213 = "2.13.18"
val Scala3   = "3.8.4"

val CrossScalaVersions = Seq(Scala213, Scala212, Scala3)

scalaVersion := Scala213

// Separate session name to prevent conflicts during publishing
sonaDeploymentName := ((skipElementsPublish, skipSchemaPublish) match {
  case (false, true) => sonaDeploymentName.value + "npm-elements" // Elements only
  case (true, false) => sonaDeploymentName.value + "npm-schema"   // Schema only
  case _             => sonaDeploymentName.value                  // Original
})

lazy val metrics = projectMatrix
  .in(file("metrics"))
  .settings(
    sharedSettings,
    name        := "mutation-testing-metrics",
    description := "Core data structures and utilities for mutation testing metrics."
  )
  .jvmPlatform(scalaVersions = CrossScalaVersions)
  .jsPlatform(scalaVersions = CrossScalaVersions)

lazy val circe = projectMatrix
  .in(file("circe"))
  .dependsOn(metrics)
  .settings(
    sharedSettings,
    name        := "mutation-testing-metrics-circe",
    description := "Circe encoders and decoders for mutation testing metrics.",
    libraryDependencies ++= Seq(
      "io.circe" %% "circe-core"   % "0.14.16",
      "io.circe" %% "circe-parser" % "0.14.16"
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
  .jsPlatform(scalaVersions = CrossScalaVersions)

lazy val cats = projectMatrix
  .in(file("cats"))
  .dependsOn(metrics)
  .settings(
    sharedSettings,
    name        := "mutation-testing-metrics-cats",
    description := "Cats type class instances for mutation testing metrics.",
    libraryDependencies ++= Seq(
      "org.typelevel" %% "cats-core"        % "2.13.0",
      "org.typelevel" %% "cats-laws"        % "2.13.0" % Test,
      "org.typelevel" %% "discipline-munit" % "2.0.0"  % Test
    )
  )
  .jvmPlatform(scalaVersions = CrossScalaVersions)
  .jsPlatform(scalaVersions = CrossScalaVersions)

lazy val docs = project
  .in(file("metrics-docs")) // important: it must not be docs/
  .settings(
    scalaVersion := Scala3,
    mdocOut      := file("."),
    mdocExtraArguments += "--no-link-hygiene",
    Compile / run / baseDirectory := (LocalRootProject / baseDirectory).value
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
  tpolecatScalacOptions ++= Set(
    ScalacOptions.source("3", version => version.isBetween(ScalaVersion.V2_12_0, ScalaVersion.V2_13_0)),
    ScalacOptions.source("3-cross", version => version.isBetween(ScalaVersion.V2_13_0, ScalaVersion.V3_0_0))
  ),
  libraryDependencies += "org.scalameta" %% "munit" % "1.3.3" % Test,
  publish / skip                         := skipNormalProjectPublish,
  publishTo                              := sonatypeCentralPublishToBundle.value
)

lazy val npmProjectSettings = Seq(
  // These are not used, but prevent the project from being published twice
  scalaVersion       := Scala213,
  crossScalaVersions := Seq(Scala213),
  publishTo          := sonatypeCentralPublishToBundle.value,
  // Avoid conflicts with parallel publishing
  sonaDeploymentName := sonaDeploymentName.value + "-npm",
  // drop off Scala suffix from artifact names.
  crossPaths := false,
  // exclude scala-library from dependencies
  autoScalaLibrary := false
)

// Don't publish root project; subprojects override via sharedSettings/npmProjectSettings
publish / skip           := true
version                  := packageVersion(file("."))
organization             := "io.stryker-mutator"
versionScheme            := Some("semver-spec")
homepage                 := Some(url("https://stryker-mutator.io/"))
licenses += "Apache-2.0" -> url(
  "https://www.apache.org/licenses/LICENSE-2.0"
)
scmInfo := Some(
  ScmInfo(
    url("https://github.com/stryker-mutator/mutation-testing-elements"),
    "scm:git:https://github.com/stryker-mutator/mutation-testing-elements.git",
    "scm:git:git@github.com:stryker-mutator/mutation-testing-elements.git"
  )
)
developers := List(
  Developer("hugo-vrijswijk", "Hugo", "", url("https://github.com/hugo-vrijswijk"))
)
credentials ++= {
  val env = sys.env.get(_)
  (for {
    username <- env("SONATYPE_USERNAME")
    password <- env("SONATYPE_PASSWORD")
  } yield Credentials(
    "Sonatype Central",
    "central.sonatype.com",
    username,
    password
  )).toSeq
}

lazy val sonatypeCentralPublishToBundle = Def.setting {
  val centralSnapshots = "https://central.sonatype.com/repository/maven-snapshots/"
  if (isSnapshot.value) Some("central-snapshots" at centralSnapshots)
  else localStaging.value
}

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

  val command         = Seq("node", "-p", "require('./package.json').version")
  val os              = sys.props("os.name").toLowerCase
  val panderToWindows = os match {
    case n if n.contains("windows") => Seq("cmd", "/C") ++ command
    case _                          => command
  }
  scala.util
    .Try(
      Process(panderToWindows, packageJsonDir).!!.linesIterator.toSeq.last
    )
    .getOrElse("0.0.0-NO-NODE-SNAPSHOT")
}
