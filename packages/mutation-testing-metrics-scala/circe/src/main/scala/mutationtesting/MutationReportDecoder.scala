package mutationtesting

import io.circe._

@deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
object MutationReportDecoder {

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val mutantStatusDecoder: Decoder[MutantStatus] = circe.mutantStatusCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val positionDecoder: Decoder[Position] = circe.positionCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val thresholdsDecoder: Decoder[Thresholds] = circe.thresholdsCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val locationDecoder: Decoder[Location] = circe.locationCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val mutantResultDecoder: Decoder[MutantResult] = circe.mutantResultCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val fileResultDecoder: Decoder[FileResult] = circe.fileResultCodec

  @deprecated(message = "Use mutationtesting.circe instead", since = "1.5.0")
  implicit lazy val mutationTestResultDecoder: Decoder[MutationTestResult] = circe.mutationTestResultCodec
}
