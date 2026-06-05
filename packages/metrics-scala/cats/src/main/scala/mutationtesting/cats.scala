package mutationtesting

import _root_.cats.*
import _root_.cats.kernel.CommutativeMonoid
import mutationtesting.*

/** Cats type class instances for `mutationtesting` types.
  */
object cats {

  implicit lazy val showPosition: Show[Position]                = Show.show(_.show)
  implicit lazy val orderPosition: Order[Position]              = Order.by(p => (p.line, p.column))
  implicit lazy val monoidPosition: CommutativeMonoid[Position] =
    CommutativeMonoid.instance(
      Position(1, 1),
      // - 1 because position is 1-based, not 0-based
      (a, b) => Position(line = a.line + b.line - 1, column = a.column + b.column - 1)
    )

  implicit lazy val showLocation: Show[Location]                = Show.show(_.show)
  implicit lazy val orderLocation: Order[Location]              = Order.by(l => (l.start, l.end))
  implicit lazy val monoidLocation: CommutativeMonoid[Location] = CommutativeMonoid.instance[Location](
    Location(
      CommutativeMonoid[Position].empty,
      CommutativeMonoid[Position].empty
    ),
    (a, b) =>
      Location(CommutativeMonoid[Position].combine(a.start, b.start), CommutativeMonoid[Position].combine(a.end, b.end))
  )

  implicit lazy val showOpenEndLocation: Show[OpenEndLocation]                = Show.show(_.show)
  implicit lazy val orderOpenEndLocation: Order[OpenEndLocation]              = Order.by(l => (l.start, l.end))
  implicit lazy val monoidOpenEndLocation: CommutativeMonoid[OpenEndLocation] = CommutativeMonoid.instance(
    OpenEndLocation(CommutativeMonoid.empty[Position], CommutativeMonoid.empty[Option[Position]]),
    (a, b) =>
      OpenEndLocation(
        CommutativeMonoid[Position].combine(a.start, b.start),
        CommutativeMonoid[Option[Position]].combine(a.end, b.end)
      )
  )

}
