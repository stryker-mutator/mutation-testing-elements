package mutationtesting

/** Thresholds for the status of the reported application.
  *
  * Suggested method for creating a Thresholds object is by the 'smart' `create` constructor in the companion object
  *
  * @param high
  *   Higher bound threshold.
  * @param low
  *   Lower bound threshold.
  */
final case class Thresholds(high: Int, low: Int)

object Thresholds {

  /** Smart constructor to create a [[mutationtesting.Thresholds]]. Returns an Either of an error message if the values
    * are out of bounds, or the Thresholds object
    */
  def create(high: Int, low: Int): Either[String, Thresholds] =
    (high, low) match {
      case (high, _) if high > 100 => Left(s"thresholds.high should be <= 100")
      case (high, _) if high < 0   => Left(s"thresholds.high should be > 0")
      case (_, low) if low > 100   => Left(s"thresholds.low should be <= 100")
      case (_, low) if low < 0     => Left(s"thresholds.low should be > 0")
      case (high, low)             => Right(Thresholds(high, low))
    }
}
