package mutationtesting

import mutationtesting.MutantStatus._
import io.circe._

object MutationReportEncoder {

  implicit val mutantStatusEncoder: Encoder[MutantStatus] = Encoder.encodeEnumeration(MutantStatus)

  implicit val positionEncoder: Encoder[Position] = Encoder.forProduct2("line", "column")(p => (p.line, p.column))

  implicit val thresholdsEncoder: Encoder[Thresholds] = Encoder.forProduct2("high", "low")(t => (t.high, t.low))

  implicit val locationEncoder: Encoder[Location] = Encoder.forProduct2("start", "end")(l => (l.start, l.end))

  implicit val mutantResultEncoder: Encoder[MutantResult] =
    Encoder
      .forProduct6("id", "mutatorName", "replacement", "location", "status", "description")((m: MutantResult) =>
        (m.id, m.mutatorName, m.replacement, m.location, m.status, m.description)
      )

  implicit val mutationTestResultEncoder: Encoder[MutationTestResult] =
    Encoder.forProduct3("source", "mutants", "language")(m => (m.source, m.mutants, m.language))

  implicit val mutationTestReportEncoder: Encoder[MutationTestReport] =
    Encoder
      .forProduct5("$schema", "schemaVersion", "thresholds", "projectRoot", "files")((m: MutationTestReport) =>
        (m.`$schema`, m.schemaVersion, m.thresholds, m.projectRoot, m.files)
      )
      .mapJson(_.deepDropNullValues)
}
