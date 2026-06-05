package mutationtesting

import _root_.cats.kernel.laws.discipline.OrderTests
import munit.DisciplineSuite
import mutationtesting.arbitraries.*
import mutationtesting.cats.*

class CatsLawsTest extends DisciplineSuite {

  checkAll("Location.OrderTests", OrderTests[Location].order)

  checkAll("Position.OrderTests", OrderTests[Position].order)

  checkAll("OpenEndLocation.OrderTests", OrderTests[OpenEndLocation].order)

}
