package mutationtesting

import io.circe._

@deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
object MutationReportEncoder {

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val mutantStatusEncoder: Encoder[MutantStatus] = MutationReportCodec.mutantStatusCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val positionEncoder: Encoder[Position] = MutationReportCodec.positionCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val thresholdsEncoder: Encoder[Thresholds] = MutationReportCodec.thresholdsCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val locationEncoder: Encoder[Location] = MutationReportCodec.locationCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val mutantResultEncoder: Encoder[MutantResult] = MutationReportCodec.mutantResultCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val fileResultEncoder: Encoder[FileResult] = MutationReportCodec.fileResultCodec

  @deprecated(message = "Use MutationReportCodec instead", since = "1.5.0")
  implicit lazy val mutationTestResultEncoder: Encoder[MutationTestResult] = MutationReportCodec.mutationTestResultCodec
    .mapJson(_.deepDropNullValues)
}
