package mutationtesting

import mutationtesting.MutantStatus._
import io.circe._, io.circe.syntax._
import cats.syntax.either._

protected object MutantStatusDecoder {
  val msDecoder: Decoder[MutantStatus] = Decoder.decodeString.emap { str =>
    import scala.language.implicitConversions
    Either.catchNonFatal(MutantStatus.valueOf(str)).leftMap(t => "status")
  }
}
