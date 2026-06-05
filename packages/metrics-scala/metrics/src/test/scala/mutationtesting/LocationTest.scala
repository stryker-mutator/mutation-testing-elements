package mutationtesting

import munit.FunSuite

class LocationTest extends FunSuite {
  test("Location start must be <= end on different lines") {
    val _ = Location(Position(1, 0), Position(1, 0)) // should not throw
    interceptMessage[IllegalArgumentException]("requirement failed: Location end 0:0 must be >= start 1:0") {
      Location(Position(1, 0), Position(0, 0))
    }
  }

  test("Location start must be <= end on same line") {
    val _ = Location(Position(1, 0), Position(2, 0)) // should not throw
    interceptMessage[IllegalArgumentException]("requirement failed: Location end 1:0 must be >= start 1:1") {
      Location(Position(1, 1), Position(1, 0))
    }
  }

  test("Location show should be in the format [start, end)") {
    val location = Location(Position(1, 2), Position(3, 4))
    assertEquals(location.show, "[1:2, 3:4)")
  }

  test("OpenEndLocation show should be in the format [start, end)") {
    val location = OpenEndLocation(Position(1, 2), Some(Position(3, 4)))
    assertEquals(location.show, "[1:2, 3:4)")
  }

  test("OpenEndLocation show should be in the format [start, ?)") {
    val location = OpenEndLocation(Position(1, 2), None)
    assertEquals(location.show, "[1:2, ?)")
  }
}
