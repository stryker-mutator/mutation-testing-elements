package mutationtesting

import io.circe._

@deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
object MutationReportDecoder {

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val mutantStatusDecoder: Decoder[MutantStatus] = MutationReportCodec.mutantStatusCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val positionDecoder: Decoder[Position] = MutationReportCodec.positionCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val thresholdsDecoder: Decoder[Thresholds] = MutationReportCodec.thresholdsCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val locationDecoder: Decoder[Location] = MutationReportCodec.locationCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val mutantResultDecoder: Decoder[MutantResult] = MutationReportCodec.mutantResultCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val fileResultDecoder: Decoder[FileResult] = MutationReportCodec.fileResultCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val mutationTestResultDecoder: Decoder[MutationTestResult] = MutationReportCodec.mutationTestResultCodec
}
