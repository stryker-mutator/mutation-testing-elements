package mutationtesting

import mutationtesting.MutantStatus._
import io.circe._, io.circe.syntax._

protected object MutantStatusEncoder {
  val msEncoder: Encoder[MutantStatus] = Encoder.encodeString.contramap[MutantStatus](_.toString)
}
