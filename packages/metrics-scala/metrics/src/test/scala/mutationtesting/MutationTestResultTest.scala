package mutationtesting

class MutationTestResultTest extends munit.FunSuite {
  test(
    "MutationTestResult should have correct default $schema and schemaVersion"
  ) {
    val sut =
      MutationTestResult(thresholds = Thresholds(80, 60), files = Map.empty)

    assertEquals(sut.`$schema`.get, "https://git.io/mutation-testing-schema")
    assertEquals(sut.schemaVersion, "2")
  }

  test("FileResult should have default language Scala") {
    val sut = FileResult("", Seq.empty)

    assertEquals(sut.language, "scala")
  }

  val validThresholds = List(
    (0, 0),
    (1, 0),
    (0, 1),
    (99, 0),
    (0, 99),
    (100, 0),
    (0, 100),
    (100, 100)
  )

  validThresholds.foreach { case (high, low) =>
    test(s"Threshold should be valid for high $high low $low") {
      Thresholds.create(high, low) match {
        case Left(value) => fail(s"Expected valid threshold, got error $value")
        case Right(value) =>
          assertEquals(value, Thresholds(high = high, low = low))
      }
    }
  }

  val invalidThresholds = List(
    (101, 0, "thresholds.high should be <= 100"),
    (-1, 0, "thresholds.high should be > 0"),
    (0, 101, "thresholds.low should be <= 100"),
    (0, -1, "thresholds.low should be > 0")
  )

  invalidThresholds.foreach { case (high, low, expectedErrorMessage) =>
    test(s"Threshold should be invalid for high $high low $low") {
      Thresholds.create(high, low) match {
        case Left(value)  => assertEquals(value, expectedErrorMessage)
        case Right(value) => fail(s"Expected Left error, got Right $value")
      }
    }
  }

}
