package mutationtesting

class MetricsResultTest extends munit.FunSuite {
  test("all should be 0 on empty root") {
    val sut = MetricsResultRoot(Nil)

    assertEquals(sut.pending, 0)
    assertEquals(sut.killed, 0)
    assertEquals(sut.survived, 0)
    assertEquals(sut.timeout, 0)
    assertEquals(sut.noCoverage, 0)
    assertEquals(sut.compileErrors, 0)
    assertEquals(sut.ignored, 0)
    assertEquals(sut.totalDetected, 0)
    assertEquals(sut.totalUndetected, 0)
    assertEquals(sut.totalCovered, 0)
    assertEquals(sut.totalValid, 0)
    assertEquals(sut.totalInvalid, 0)
    assertEquals(sut.totalMutants, 0)
    assert(sut.mutationScore.isNaN)
    assert(sut.mutationScoreBasedOnCoveredCode.isNaN)
  }

  expectedSet.foreach { case (name, actualFunc, expected) =>
    test(s"$name should be $expected on testset") {
      assertEquals(
        actualFunc(testSet),
        expected,
        s"Unexpected value ${actualFunc(testSet)} for $name, expected $expected"
      )
    }
  }

  private lazy val expectedSet: List[(String, MetricsResult => Number, Number)] = List(
    ("pending", _.pending, 1),
    ("killed", _.killed, 2),
    ("survived", _.survived, 2),
    ("timeout", _.timeout, 2),
    ("noCoverage", _.noCoverage, 3),
    ("compileErrors", _.compileErrors, 1),
    ("ignored", _.ignored, 1),
    ("runtimeErrors", _.runtimeErrors, 1),
    ("totalDetected", _.totalDetected, 4),
    ("totalUndetected", _.totalUndetected, 5),
    ("totalCovered", _.totalCovered, 6),
    ("totalValid", _.totalValid, 9),
    ("totalInvalid", _.totalInvalid, 2),
    ("totalMutants", _.totalMutants, 13),
    ("mutationScore", _.mutationScore, (4d / 9d) * 100),
    (
      "mutationScoreBasedOnCoveredCode",
      _.mutationScoreBasedOnCoveredCode,
      (4d / 6d) * 100
    )
  )

  private lazy val testSet = MetricsResultRoot(
    List(
      MetricsDirectory(
        "foo",
        List(
          MetricsFile(
            "bar.scala",
            List(
              MetricMutant(MutantStatus.Pending),
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
              MetricMutant(MutantStatus.Ignored),
              MetricMutant(MutantStatus.RuntimeError)
            )
          ),
          MetricsFile("baz.scala", Nil)
        )
      )
    )
  )

}
