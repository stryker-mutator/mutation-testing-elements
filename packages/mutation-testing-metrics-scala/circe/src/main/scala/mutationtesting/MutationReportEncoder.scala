package mutationtesting

import io.circe._

@deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
object MutationReportEncoder {

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val mutantStatusEncoder: Encoder[MutantStatus] = circe.mutantStatusCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val positionEncoder: Encoder[Position] = circe.positionCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val thresholdsEncoder: Encoder[Thresholds] = circe.thresholdsCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val locationEncoder: Encoder[Location] = circe.locationCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val mutantResultEncoder: Encoder[MutantResult] = circe.mutantResultCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val fileResultEncoder: Encoder[FileResult] = circe.fileResultCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val mutationTestResultEncoder: Encoder[MutationTestResult] = circe.mutationTestResultCodec
    .mapJson(_.deepDropNullValues)
}
