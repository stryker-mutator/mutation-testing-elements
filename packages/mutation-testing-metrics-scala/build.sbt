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

lazy val root = crossProject(JVMPlatform, JSPlatform, NativePlatform)
  .withoutSuffixFor(JVMPlatform)
  .crossType(CrossType.Pure)
  .in(file("metrics"))
  .settings(sharedSettings)
  .jvmSettings(jvmSettings)
  .nativeSettings(nativeSettings)

lazy val sharedSettings = Seq(
  name := "mutation-testing-metrics",
  libraryDependencies += "com.eed3si9n.verify" %%% "verify" % "0.2.0" % Test,
  testFrameworks += new TestFramework("verify.runner.Framework"),
  scalaVersion := Scala213,
  crossScalaVersions := ScalaVersions,
  skip in publish := false,
  publishTo := sonatypePublishToBundle.value
)

lazy val jvmSettings = Seq(
  crossScalaVersions := ScalaVersions :+ Scala3,
  libraryDependencies ++= Seq(
    "org.leadpony.justify" % "justify"        % "1.1.0",
    "org.glassfish"        % "jakarta.json"   % "1.1.6",
    "io.circe"             %% "circe-core"    % "0.12.1",
    "io.circe"             %% "circe-generic" % "0.12.1"
  ).map(_ % Test)
)

lazy val nativeSettings = Seq(
  scalaVersion := Scala211,
  crossScalaVersions := Seq(Scala211)
)
