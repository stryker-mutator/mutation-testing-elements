package mutationtesting

import mutationtesting.MutantStatus._
import io.circe._

object MutationReportDecoder {

  implicit val mutantStatusDecoder: Decoder[MutantStatus] = Decoder.decodeEnumeration(MutantStatus)

  implicit val positionDecoder: Decoder[Position] = Decoder.forProduct2("line", "column")(Position.apply)

  implicit val thresholdsDecoder: Decoder[Thresholds] = Decoder.forProduct2("high", "low")(Thresholds.apply)

  implicit val locationDecoder: Decoder[Location] = Decoder.forProduct2("start", "end")(Location.apply)

  implicit val mutantResultDecoder: Decoder[MutantResult] =
    Decoder.forProduct6("id", "mutatorName", "replacement", "location", "status", "description")(MutantResult.apply)

  implicit val mutationTestResultDecoder: Decoder[MutationTestResult] =
    Decoder.forProduct3("source", "mutants", "language")(MutationTestResult.apply)

  implicit val mutationTestReportDecoder: Decoder[MutationTestReport] =
    Decoder.forProduct4("$schema", "schemaVersion", "thresholds", "files")(MutationTestReport.apply)
}
