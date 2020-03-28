package mutationtesting

import verify._
object MetricsResultTest extends BasicTestSuite {
  test("all should be 0 on empty root") {
    val sut = MetricsResultRoot(Nil)

    assert(sut.killed == 0)
    assert(sut.survived == 0)
    assert(sut.timeout == 0)
    assert(sut.noCoverage == 0)
    assert(sut.compileErrors == 0)
    assert(sut.ignored == 0)
    assert(sut.totalDetected == 0)
    assert(sut.totalUndetected == 0)
    assert(sut.totalCovered == 0)
    assert(sut.totalValid == 0)
    assert(sut.totalInvalid == 0)
    assert(sut.totalMutants == 0)
    assert(sut.mutationScore.isNaN)
    assert(sut.mutationScoreBasedOnCoveredCode.isNaN)
  }

  expectedSet.foreach({
    case (name, actualFunc, expected) =>
      test(s"$name should be $expected on testset") {
        assert(
          actualFunc(testSet) == expected,
          s"Unexpected value ${actualFunc(testSet)} for $name, expected $expected"
        )
      }
  })

  private lazy val expectedSet: List[(String, MetricsResult => Number, Number)] = List(
    ("killed", _.killed, 2),
    ("survived", _.survived, 2),
    ("timeout", _.timeout, 2),
    ("noCoverage", _.noCoverage, 3),
    ("compileErrors", _.compileErrors, 1),
    ("ignored", _.ignored, 1),
    ("totalDetected", _.totalDetected, 4),
    ("totalUndetected", _.totalUndetected, 5),
    ("totalCovered", _.totalCovered, 6),
    ("totalValid", _.totalValid, 9),
    ("totalInvalid", _.totalInvalid, 1),
    ("totalMutants", _.totalMutants, 11),
    ("mutationScore", _.mutationScore, (4d / 9d) * 100),
    ("mutationScoreBasedOnCoveredCode", _.mutationScoreBasedOnCoveredCode, (4d / 6d) * 100)
  )

  private lazy val testSet = MetricsResultRoot(
    List(
      MetricsDirectory(
        "foo",
        List(
          MetricsFile(
            "bar.scala",
            List(
              MetricMutant(MutantStatus.Killed),
              MetricMutant(MutantStatus.Killed),
              MetricMutant(MutantStatus.Survived),
              MetricMutant(MutantStatus.Survived),
              MetricMutant(MutantStatus.Timeout),
              MetricMutant(MutantStatus.Timeout),
              MetricMutant(MutantStatus.NoCoverage),
              MetricMutant(MutantStatus.NoCoverage),
              MetricMutant(MutantStatus.NoCoverage),
              MetricMutant(MutantStatus.CompileError),
              MetricMutant(MutantStatus.Ignored)
            )
          ),
          MetricsFile("baz.scala", Nil)
        )
      )
    )
  )

}
