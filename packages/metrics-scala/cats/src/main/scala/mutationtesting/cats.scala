package mutationtesting

import _root_.cats.*
import mutationtesting.*

/** Cats type class instances for `mutationtesting` types.
  */
object cats {

  implicit lazy val showPosition: Show[Position]   = Show.show(_.show)
  implicit lazy val orderPosition: Order[Position] = Order.by(p => (p.line, p.column))

  implicit lazy val showLocation: Show[Location]   = Show.show(_.show)
  implicit lazy val orderLocation: Order[Location] = Order.by(l => (l.start, l.end))

  implicit lazy val showOpenEndLocation: Show[OpenEndLocation]   = Show.show(_.show)
  implicit lazy val orderOpenEndLocation: Order[OpenEndLocation] = Order.by(l => (l.start, l.end))

}
