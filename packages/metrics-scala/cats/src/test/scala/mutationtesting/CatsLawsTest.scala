package mutationtesting

import _root_.cats.kernel.laws.discipline.{CommutativeMonoidTests, OrderTests}
import munit.DisciplineSuite
import mutationtesting.arbitraries.*
import mutationtesting.cats.*

class CatsLawsTest extends DisciplineSuite {

  checkAll("Position.OrderTests", OrderTests[Position].order)
  checkAll("Position.MonoidTests", CommutativeMonoidTests[Position].commutativeMonoid)

  checkAll("Location.OrderTests", OrderTests[Location].order)
  checkAll("Location.MonoidTests", CommutativeMonoidTests[Location].commutativeMonoid)

  checkAll("OpenEndLocation.OrderTests", OrderTests[OpenEndLocation].order)
  checkAll("OpenEndLocation.MonoidTests", CommutativeMonoidTests[OpenEndLocation].commutativeMonoid)

}
