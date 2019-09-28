inThisBuild(
  Seq(
    // Don't publish root project
    skip in publish := true,
    version := {
      import scala.sys.process._

      val command = Seq("npm", "run", "get-version")
      val os      = sys.props("os.name").toLowerCase
      val panderToWindows = os match {
        case n if n contains "windows" => Seq("cmd", "/C") ++ command
        case _                         => command
      }
      panderToWindows.!!.linesIterator.toIterable.last
    },
    publishMavenStyle := true,
    organization := "io.stryker-mutator",
    homepage := Some(url("https://stryker-mutator.io/")),
    licenses += "Apache-2.0" -> url("https://www.apache.org/licenses/LICENSE-2.0"),
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
