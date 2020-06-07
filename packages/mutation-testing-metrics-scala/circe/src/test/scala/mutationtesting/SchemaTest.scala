package mutationtesting

import java.nio.file.Paths
import org.leadpony.justify.api.JsonValidationService
import java.io.ByteArrayInputStream
import io.circe.parser.decode
import scala.io.Source

class SchemaTest extends munit.FunSuite {

  test("encoded json should be valid for mutation-testing-report-schema") {
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
    assertEquals(reader.readValue().toString, jsonString)
  }

  test("decoded json report is without errors") {
    import mutationtesting.MutationReportDecoder._
    val report =
      Source.fromFile("../mutation-testing-elements/testResources/scala-example/mutation-report.json").mkString

    decode[MutationTestReport](report) match {
      case Left(err) => fail(err.getMessage())
      case Right(report) =>
        assert(report.`$schema`.isEmpty)
        assertEquals(report.schemaVersion, "1")
        assertEquals(report.thresholds, Thresholds(80, 60))
        report.files.foreach({
          case (_, result) =>
            assertEquals(result.language, "scala")
            assert(result.mutants.nonEmpty)
        })
    }
  }

  def toJsonString(report: MutationTestReport) = {
    import mutationtesting.MutationReportEncoder._
    import io.circe.syntax._
    report.asJson.noSpaces
  }

  def createJsonReader(jsonString: String) = {
    val service = JsonValidationService.newInstance();
    val schema = service.readSchema(
      Paths.get("../mutation-testing-report-schema/src/mutation-testing-report-schema.json")
    )
    val byteStream = new ByteArrayInputStream(jsonString.getBytes())
    val handler    = service.createProblemPrinter(fail(_))
    service.createReader(byteStream, schema, handler)
  }
}
