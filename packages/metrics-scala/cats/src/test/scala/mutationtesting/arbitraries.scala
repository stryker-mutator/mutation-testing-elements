package mutationtesting

import org.scalacheck.*

/** Instances for Scalacheck property testing. Used in tests to generate random values
  */
object arbitraries {
  implicit def arbPosition: Arbitrary[Position] = Arbitrary {
    for {
      line   <- Gen.posNum[Int]
      column <- Gen.posNum[Int]
    } yield Position(line, column)
  }

  implicit def arbLocation: Arbitrary[Location] = Arbitrary {
    for {
      startPosition <- arbPosition.arbitrary
      endLine       <- Gen.choose(startPosition.line, startPosition.line + 10)
      endColumn     <-
        if (endLine > startPosition.line) Gen.posNum[Int]
        else Gen.choose(startPosition.column, startPosition.column + 10)
      endPosition = Position(endLine, endColumn)
    } yield Location(startPosition, endPosition)
  }

  implicit def arbOpenEndLocation: Arbitrary[OpenEndLocation] = Arbitrary {
    for {
      baseLocation <- arbLocation.arbitrary
      hasEnd       <- Gen.oneOf(true, false)
      endLocation = if (hasEnd) Some(baseLocation.end) else None
    } yield OpenEndLocation(baseLocation.start, endLocation)
  }

  implicit def cogenPosition: Cogen[Position] = Cogen[(Int, Int)].contramap(p => (p.line, p.column))

  implicit def cogenLocation: Cogen[Location] = Cogen[(Position, Position)].contramap(l => (l.start, l.end))

  implicit def cogenOpenEndLocation: Cogen[OpenEndLocation] =
    Cogen[(Position, Option[Position])].contramap(l => (l.start, l.end))
}
