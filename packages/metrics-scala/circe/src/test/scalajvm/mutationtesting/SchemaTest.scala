package mutationtesting

import java.io.ByteArrayInputStream
import java.nio.file.Paths

import scala.io.Source

import io.circe.JsonObject
import io.circe.parser.decode
import mutationtesting.circe._
import org.leadpony.justify.api.JsonValidationService

class SchemaTest extends munit.FunSuite {

  test("encoded json should be valid for mutation-testing-report-schema") {
    val sut = MutationTestResult[JsonObject](
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
    val jsonString = toJsonString(sut)
    val reader     = createJsonReader(jsonString)
    // Actually asserts that no exception is thrown
    assertEquals(reader.readValue().toString, jsonString)
  }

  test("decoded json report is without errors") {
    val report =
      Source
        .fromFile(
          "../elements/testResources/scala-example/mutation-report.json"
        )
        .mkString

    decode[JsonConfigMutationTestResult](report) match {
      case Left(err) => throw err
      case Right(report) =>
        assert(report.`$schema`.isEmpty)
        assertEquals(report.schemaVersion, "1")
        assertEquals(report.thresholds, Thresholds(80, 60))
        assertEquals(report.projectRoot, Some("src/main/scala/stryker4s"))
        report.files.foreach { case (_, result) =>
          assertEquals(result.language, "scala")
          assert(result.mutants.nonEmpty)
        }
    }
  }

  val validJsons = List(
    "strict-report-v1",
    "strict-report-v2",
    "additional-properties-report",
    "missing-test-files",
    "missing-end-location",
    "data-url"
  )

  validJsons.foreach { fileName =>
    test(s"json $fileName should be valid according to schema") {
      decodeReport(fileName) match {
        case Left(value) => throw value
        case Right(report) =>
          val jsonString = toJsonString(report)
          val reader     = createJsonReader(jsonString)
          // Actually asserts that no exception is thrown
          assertEquals(reader.readValue().toString, jsonString)
      }
    }
  }

  val invalidJsons = Map(
    "thresholds/threshold-too-high-report" -> "thresholds.high should be <= 100",
    "thresholds/threshold-too-low-report"  -> "thresholds.low should be > 0",
    "missing-mutant-location-report"       -> "end",
    "missing-test-name"                    -> "name",
    "missing-framework-name"               -> "name",
    "missing-tests"                        -> "tests",
    "missing-system-ci"                    -> "ci",
    "missing-system-cpu-logical-cores"     -> "logicalCores",
    "missing-system-os-platform"           -> "platform",
    "missing-system-ram-total"             -> "total",
    "missing-performance-fields"           -> "setup"
  )

  invalidJsons.foreach { case (fileName, expectedErrorMessage) =>
    test(s"json $fileName should be valid according to schema") {
      decodeReport(fileName) match {
        case Left(value) =>
          assert(
            value.getMessage().contains(expectedErrorMessage),
            s"Error '${value.getMessage()}' did not contain '$expectedErrorMessage'"
          )
        case Right(value) =>
          fail(s"Expected decoding error, but got a value '$value'")
      }
    }
  }

  def decodeReport(
      fileName: String
  ): Either[io.circe.Error, JsonConfigMutationTestResult] = {
    val reportString =
      Source.fromFile(s"../report-schema/testResources/$fileName.json").mkString

    decode[JsonConfigMutationTestResult](reportString)
  }

  def toJsonString(report: JsonConfigMutationTestResult) = {
    import io.circe.syntax._
    report.asJson.noSpaces
  }

  def createJsonReader(jsonString: String) = {
    val service = JsonValidationService.newInstance();
    val schema = service.readSchema(
      Paths.get("../report-schema/src/mutation-testing-report-schema.json")
    )
    val byteStream = new ByteArrayInputStream(jsonString.getBytes())
    val handler    = service.createProblemPrinter(fail(_))
    service.createReader(byteStream, schema, handler)
  }
}
