package mutationtesting

import verify._
import java.nio.file.Paths
import mutationtesting.MutantStatus.MutantStatus
import org.leadpony.justify.api.JsonValidationService
import java.io.ByteArrayInputStream

/** This test is in JVM as there is no pure Scala json schema validator at the moment, so we use a JVM one
  */
object SchemaTest extends BasicTestSuite {
  test("created json should be valid for mutation-testing-report-schema") {
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
      )
    )
    val jsonString = toJsonString(sut)
    val reader     = createJsonReader(jsonString)
    // Actually asserts that no exception is thrown
    assert(reader.readValue().toString == jsonString)
  }

  def toJsonString(report: MutationTestReport) = {
    import io.circe.Encoder
    import io.circe.generic.auto._
    import io.circe.syntax._
    implicit val encoder: Encoder[MutantStatus] = Encoder.encodeEnumeration(MutantStatus)
    report.asJson.noSpaces
  }

  def createJsonReader(jsonString: String) = {
    val service    = JsonValidationService.newInstance();
    val schema     = readSchema(service)
    val byteStream = new ByteArrayInputStream(jsonString.getBytes())
    val handler    = service.createProblemPrinter(fail)
    service.createReader(byteStream, schema, handler)
  }

  def readSchema(service: JsonValidationService) = service.readSchema(
    Paths.get("../mutation-testing-report-schema/src/mutation-testing-report-schema.json")
  )

}
