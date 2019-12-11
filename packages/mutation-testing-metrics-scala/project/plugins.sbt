addSbtPlugin("ch.epfl.lamp"       % "sbt-dotty"                     % "0.3.4")
addSbtPlugin("org.scala-js"       % "sbt-scalajs"                   % "0.6.29")
addSbtPlugin("org.scala-native"   % "sbt-scala-native"              % "0.3.9")
addSbtPlugin("org.portable-scala" % "sbt-scalajs-crossproject"      % "0.6.1")
addSbtPlugin("org.portable-scala" % "sbt-scala-native-crossproject" % "0.6.1")

addSbtPlugin("org.xerial.sbt"   % "sbt-sonatype" % "3.8")
addSbtPlugin("com.jsuereth"     % "sbt-pgp"      % "2.0.0")
addSbtPlugin("com.typesafe.sbt" % "sbt-git"      % "1.0.0")

addSbtPlugin("org.scalameta" % "sbt-mdoc" % "2.0.0")

addSbtPlugin("io.stryker-mutator" % "sbt-stryker4s" % stryker4sVersion)