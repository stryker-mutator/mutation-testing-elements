inThisBuild(
  Seq(
    // Don't publish root project
    skip in publish := true,
    publishMavenStyle := true,
    organization := "io.stryker-mutator",
    homepage := Some(url("https://stryker-mutator.io/")),
    licenses += "Apache-2.0" -> url("https://www.apache.org/licenses/LICENSE-2.0"),
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
