val Scala212 = "2.12.10"
val Scala213 = "2.13.1"

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
      "io.circe"             %% "circe-core"   % "0.12.3",
      "io.circe"             %% "circe-parser" % "0.12.3",
      "org.leadpony.justify" % "justify"       % "2.0.0" % Test,
      "org.leadpony.joy"     % "joy"           % "1.3.0" % Test
    )
  )

lazy val docs = project
  .in(file("metrics-docs")) // important: it must not be docs/
  .settings(scalaVersion := Scala213, mdocOut := file("."))
  .dependsOn(circe)
  .enablePlugins(MdocPlugin)

lazy val sharedSettings = Seq(
  libraryDependencies += "com.eed3si9n.verify" %% "verify" % "0.2.0" % Test,
  testFrameworks := List(new TestFramework("verify.runner.Framework")),
  scalaVersion := Scala213,
  crossScalaVersions := Seq(Scala213, Scala212),
  skip in publish := false,
  publishTo := sonatypePublishToBundle.value
)
