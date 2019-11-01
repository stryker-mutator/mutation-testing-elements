package mutationtesting

import mutationtesting.MutantStatus._
import io.circe._, io.circe.syntax._

protected object MutantStatusDecoder {
  val msDecoder: Decoder[MutantStatus] = Decoder.decodeEnumeration(MutantStatus)
}
