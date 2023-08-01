package mutationtesting

import io.circe.parser.decode
import io.circe.syntax._
import io.circe.{Codec, Encoder, JsonObject}
import mutationtesting.circe._

class EncoderTest extends munit.FunSuite {
  test("encoded JSON should be valid") {
    val sut = testReport

    val result = sut.asJson.noSpaces

    val expectedJson =
      """{"$schema":"https://git.io/mutation-testing-schema","schemaVersion":"2","thresholds":{"high":80,"low":10},"projectRoot":"/src/stryker4s","files":{"src/stryker4s/Stryker4s.scala":{"source":"case class Stryker4s(foo: String)","mutants":[{"id":"1","mutatorName":"BinaryOperator","replacement":"-","location":{"start":{"line":1,"column":2},"end":{"line":2,"column":3}},"status":"Killed"}],"language":"scala"}}}"""
    assertNoDiff(result, expectedJson)
  }

  test("should not include null values") {
    val sut = testReport.copy(projectRoot = None)

    val result = sut.asJson.noSpaces

    val expectedJson =
      """{"$schema":"https://git.io/mutation-testing-schema","schemaVersion":"2","thresholds":{"high":80,"low":10},"files":{"src/stryker4s/Stryker4s.scala":{"source":"case class Stryker4s(foo: String)","mutants":[{"id":"1","mutatorName":"BinaryOperator","replacement":"-","location":{"start":{"line":1,"column":2},"end":{"line":2,"column":3}},"status":"Killed"}],"language":"scala"}}}"""
    assertNoDiff(result, expectedJson)
  }

  test("config encoder is used") {
    implicit val reportEncoder: Encoder[MutationTestResult[CustomConfig]] =
      mutationTestResultEncoder[CustomConfig]

    val customConfig = CustomConfig("foovalue", 42)
    val sut: MutationTestResult[CustomConfig] =
      MutationTestResult(
        thresholds = Thresholds(80, 60),
        files = Map.empty,
        config = Some(customConfig)
      )

    val result = sut.asJson

    assertEquals(
      result.\\("config").head.noSpaces,
      """{"foo":"foovalue","bar":42}"""
    )
  }

  test("config decoder is used") {
    val report =
      """{"thresholds":{"high":80,"low":10},"files":{},"schemaVersion":"2","config":{"foo":"foovalue","bar":42}}"""
    decode[MutationTestResult[CustomConfig]](report) match {
      case Left(value) => fail(s"Expected valid decoding, got: $value")
      case Right(value) =>
        assertEquals(value.config.get, CustomConfig("foovalue", 42))
    }
  }

  def testReport =
    MutationTestResult[JsonObject](
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

  implicit private def customconfigCodec: Codec[CustomConfig] =
    Codec.forProduct2("foo", "bar")(CustomConfig.apply)(c => (c.foo, c.bar))

  private case class CustomConfig(foo: String, bar: Int)

}
