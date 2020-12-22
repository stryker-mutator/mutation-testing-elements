package mutationtesting

class MutationTestResultTest extends munit.FunSuite {
  test("MutationTestResult should have correct default $schema and schemaVersion") {
    val sut = MutationTestResult(thresholds = Thresholds(80, 60), files = Map.empty)

    assertEquals(sut.`$schema`.get, "https://git.io/mutation-testing-report-schema")
    assertEquals(sut.schemaVersion, "1")
  }

  test("FileResult should have default language Scala") {
    val sut = FileResult("", Seq.empty)

    assertEquals(sut.language, "scala")
  }
}
