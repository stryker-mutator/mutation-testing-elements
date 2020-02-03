package mutationtesting

import mutationtesting.MutantStatus._

final case class MutationTestReport(
    `$schema`: Option[String] = Some(
      "https://raw.githubusercontent.com/stryker-mutator/mutation-testing-elements/master/packages/mutation-testing-report-schema/src/mutation-testing-report-schema.json"
    ),
    schemaVersion: String = "1",
    thresholds: Thresholds,
    files: Map[String, MutationTestResult]
)

final case class MutationTestResult(source: String, mutants: Seq[MutantResult], language: String = "scala")

final case class MutantResult(
    id: String,
    mutatorName: String,
    replacement: String,
    location: Location,
    status: MutantStatus
)

final case class Location(start: Position, end: Position)

final case class Position(line: Int, column: Int)

final case class Thresholds(high: Int, low: Int)
