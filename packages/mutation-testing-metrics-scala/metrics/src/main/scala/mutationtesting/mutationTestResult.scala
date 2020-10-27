package mutationtesting

import mutationtesting.MutantStatus._

final case class MutationTestReport(
    `$schema`: Option[String] = Some(
      "https://git.io/mutation-testing-report-schema"
    ),
    schemaVersion: String = "1",
    thresholds: Thresholds,
    projectRoot: String,
    files: Map[String, MutationTestResult]
)

final case class MutationTestResult(source: String, mutants: Seq[MutantResult], language: String = "scala")

final case class MutantResult(
    id: String,
    mutatorName: String,
    replacement: String,
    location: Location,
    status: MutantStatus,
    description: Option[String] = None
)

final case class Location(start: Position, end: Position)

final case class Position(line: Int, column: Int)

final case class Thresholds(high: Int, low: Int)
