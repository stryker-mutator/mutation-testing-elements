package mutationtesting

import verify._
import mutationtesting.MutantStatus._

object MetricsTest extends BasicTestSuite {
  test("MutationTestResult is split into tree structure") {
    val mtr = Map(
      "dir/foo.scala" -> MutationTestResult("dirFoo", Nil),
      "dir/bar.scala" -> MutationTestResult("dirBar", Nil),
      "foo.scala"     -> MutationTestResult("foo", Nil)
    )
    val result = Metrics.calculateMetrics(mtr)
    assert(
      result == MetricsResultRoot(
        Seq(
          MetricsDirectory("dir", Seq(MetricsFile("foo.scala", Nil), MetricsFile("bar.scala", Nil))),
          MetricsFile("foo.scala", Nil)
        )
      )
    )
  }

  test("MutationTestResult split into more complex tree structure") {
    val iter = Iterator.from(0)
    def rndMutation: MutantResult = {
      val id     = iter.next()
      val isEven = id % 2 == 0
      MutantResult(
        id.toString(),
        "==",
        "!=",
        Location(Position(0, 0), Position(0, 1)),
        if (isEven) Killed else Survived
      )
    }
    def rndMutants(count: Int) = Seq.fill(count)(rndMutation)

    val mtr = Map(
      "foo.scala"             -> MutationTestResult("foo", rndMutants(0)),
      "dir/foo/bar.scala"     -> MutationTestResult("dirFoo", rndMutants(1)),
      "foo/foo/foo/bar.scala" -> MutationTestResult("dirFoo", rndMutants(2)),
      "dir/bar/foo.scala"     -> MutationTestResult("dirFoo", rndMutants(2)),
      "dir/baz/bar.scala"     -> MutationTestResult("dirBar", rndMutants(1)),
      "dir/baz.scala"         -> MutationTestResult("dirBar", rndMutants(0))
    )
    val result = Metrics.calculateMetrics(mtr)
    assert(
      result == MetricsResultRoot(
        List(
          MetricsDirectory(
            "dir",
            List(
              MetricsDirectory(
                "bar",
                List(MetricsFile("foo.scala", List(MetricMutant(Survived), MetricMutant(Killed))))
              ),
              MetricsDirectory("baz", List(MetricsFile("bar.scala", List(MetricMutant(Survived))))),
              MetricsDirectory("foo", List(MetricsFile("bar.scala", List(MetricMutant(Killed))))),
              MetricsFile("baz.scala", List())
            )
          ),
          MetricsDirectory(
            "foo",
            List(
              MetricsDirectory(
                "foo",
                List(
                  MetricsDirectory(
                    "foo",
                    List(MetricsFile("bar.scala", List(MetricMutant(Survived), MetricMutant(Killed))))
                  )
                )
              )
            )
          ),
          MetricsFile("foo.scala", List())
        )
      )
    )
    assert(result.mutationScore == 50)
  }
}
