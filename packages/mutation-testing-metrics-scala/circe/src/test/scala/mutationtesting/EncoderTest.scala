package mutationtesting

import io.circe.syntax._

class EncoderTest extends munit.FunSuite {
  test("encoded JSON should be valid") {
    import mutationtesting.MutationReportEncoder._
    val sut = MutationTestReport(
      thresholds = Thresholds(high = 80, low = 10),
      files = Map(
        "src/stryker4s/Stryker4s.scala" -> MutationTestResult(
          source = "case class Stryker4s(foo: String)",
          mutants = Seq(
            MutantResult(
              "1",
              "BinaryOperator",
              "-",
              Location(
                Position(1, 2),
                Position(2, 3)
              ),
              status = MutantStatus.Killed
            )
          )
        )
      ),
      projectRoot = Some("/src/stryker4s")
    )

    val result = sut.asJson.noSpaces

    val expectedJson =
      """{"$schema":"https://git.io/mutation-testing-report-schema","schemaVersion":"1","thresholds":{"high":80,"low":10},"files":{"src/stryker4s/Stryker4s.scala":{"source":"case class Stryker4s(foo: String)","mutants":[{"id":"1","mutatorName":"BinaryOperator","replacement":"-","location":{"start":{"line":1,"column":2},"end":{"line":2,"column":3}},"status":"Killed"}],"language":"scala"}}}"""
    assertEquals(result, expectedJson)
  }
}
