// For JVM: 2.12, 2.13, Dotty
// For JS: 2.12, 2.13
// For Native: 2.11
val Scala211 = "2.11.12"
val Scala212 = "2.12.10"
val Scala213 = "2.13.1"
val Scala3   = "0.19.0-RC1"

lazy val ScalaVersions = Seq(Scala213, Scala212)
scalaVersion := Scala213

// shadow sbt-scalajs' crossProject and CrossType from Scala.js 0.6.x
import sbtcrossproject.CrossPlugin.autoImport.{crossProject, CrossType}

lazy val metrics = crossProject(JVMPlatform, JSPlatform, NativePlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(CrossType.Pure)
  .in(file("metrics"))
  .jvmSettings(jvmSettings)
  .nativeSettings(nativeSettings)
  .settings(
    sharedSettings,
    name := "mutation-testing-metrics"
  )

lazy val circe = crossProject(JVMPlatform, JSPlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(CrossType.Pure)
  .in(file("circe"))
  .dependsOn(metrics)
  .jvmSettings(
    jvmSettings,
    libraryDependencies ++= Seq(
      "org.leadpony.justify" % "justify"      % "1.1.0" % Test,
      "org.glassfish"        % "jakarta.json" % "1.1.6" % Test
    )
  )
  .settings(
    sharedSettings,
    name := "mutation-testing-metrics-circe",
    libraryDependencies += ("io.circe" %%% "circe-core"   % "0.12.3").withDottyCompat(scalaVersion.value),
    libraryDependencies += ("io.circe" %%% "circe-parser" % "0.12.3").withDottyCompat(scalaVersion.value)
  )

lazy val docs = crossProject(JVMPlatform) // new documentation project
  .withoutSuffixFor(JVMPlatform)
  .in(file("metrics-docs")) // important: it must not be docs/
  .dependsOn(circe)
  .enablePlugins(MdocPlugin)

lazy val sharedSettings = Seq(
  libraryDependencies += "com.eed3si9n.verify" %%% "verify" % "0.2.0" % Test,
  testFrameworks += new TestFramework("verify.runner.Framework"),
  scalaVersion := Scala213,
  crossScalaVersions := ScalaVersions,
  skip in publish := false,
  publishTo := sonatypePublishToBundle.value,
  Compile / unmanagedSourceDirectories +=
    baseDirectory.value.getParentFile / "src" / "main" / (if (isDotty.value) "scala-3" else "scala-2")
)

lazy val jvmSettings = Seq(
  crossScalaVersions := ScalaVersions :+ Scala3
)

lazy val nativeSettings = Seq(
  scalaVersion := Scala211,
  crossScalaVersions := Seq(Scala211)
)
