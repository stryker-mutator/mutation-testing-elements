package mutationtesting

class MutationTestResultTest extends munit.FunSuite {
  test("MutationTestReport should have correct default $schema and schemaVersion") {
    val sut = MutationTestReport(thresholds = Thresholds(80, 60), files = Map.empty)

    assertEquals(sut.`$schema`.get, "https://git.io/mutation-testing-report-schema")
    assertEquals(sut.schemaVersion, "1")
  }

  test("MutationTestResult should have default language Scala") {
    val sut = MutationTestResult("", Seq.empty)

    assertEquals(sut.language, "scala")
  }
}
