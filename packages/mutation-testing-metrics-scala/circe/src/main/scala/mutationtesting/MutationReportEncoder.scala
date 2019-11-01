package mutationtesting

import mutationtesting.MutantStatus._
import io.circe._, io.circe.syntax._

object MutationReportEncoder {
  import mutationtesting.MutantStatusEncoder._

  implicit val mutantStatusEncoder: Encoder[MutantStatus] = msEncoder

  implicit val positionEncoder: Encoder[Position] = Encoder.forProduct2("line", "column")(p => (p.line, p.column))

  implicit val thresholdsEncoder: Encoder[Thresholds] = Encoder.forProduct2("high", "low")(t => (t.high, t.low))

  implicit val locationEncoder: Encoder[Location] = Encoder.forProduct2("start", "end")(l => (l.start, l.end))

  implicit val mutantResultEncoder: Encoder[MutantResult] =
    Encoder.forProduct5("id", "mutatorName", "replacement", "location", "status")(
      m => (m.id, m.mutatorName, m.replacement, m.location, m.status)
    )

  implicit val mutationTestResultEncoder: Encoder[MutationTestResult] =
    Encoder.forProduct3("source", "mutants", "language")(m => (m.source, m.mutants, m.language))

  implicit val mutationTestReportEncoder: Encoder[MutationTestReport] =
    Encoder.forProduct4("$schema", "schemaVersion", "thresholds", "files")(
      m => (m.`$schema`, m.schemaVersion, m.thresholds, m.files)
    )
}
