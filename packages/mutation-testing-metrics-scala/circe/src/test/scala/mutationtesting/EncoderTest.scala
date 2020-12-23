package mutationtesting

import io.circe.syntax._

class EncoderTest extends munit.FunSuite {
  import mutationtesting.MutationReportCodec._
  test("encoded JSON should be valid") {
    val sut = testReport

    val result = sut.asJson.noSpaces

    val expectedJson =
      """{"$schema":"https://git.io/mutation-testing-report-schema","schemaVersion":"1","thresholds":{"high":80,"low":10},"projectRoot":"/src/stryker4s","files":{"src/stryker4s/Stryker4s.scala":{"source":"case class Stryker4s(foo: String)","mutants":[{"id":"1","mutatorName":"BinaryOperator","replacement":"-","location":{"start":{"line":1,"column":2},"end":{"line":2,"column":3}},"status":"Killed"}],"language":"scala"}}}"""
    assertNoDiff(result, expectedJson)
  }

  test("should not include null values") {
    val sut = testReport.copy(projectRoot = None)

    val result = sut.asJson.noSpaces

    val expectedJson =
      """{"$schema":"https://git.io/mutation-testing-report-schema","schemaVersion":"1","thresholds":{"high":80,"low":10},"files":{"src/stryker4s/Stryker4s.scala":{"source":"case class Stryker4s(foo: String)","mutants":[{"id":"1","mutatorName":"BinaryOperator","replacement":"-","location":{"start":{"line":1,"column":2},"end":{"line":2,"column":3}},"status":"Killed"}],"language":"scala"}}}"""
    assertNoDiff(result, expectedJson)
  }

  def testReport =
    MutationTestResult(
      thresholds = Thresholds(high = 80, low = 10),
      files = Map(
        "src/stryker4s/Stryker4s.scala" -> FileResult(
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
}
