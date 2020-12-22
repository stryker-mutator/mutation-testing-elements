package mutationtesting

import mutationtesting.MutantStatus._

/** Schema for a mutation testing report
  *
  * @param `$schema` URL to the JSON schema.
  * @param schemaVersion Major version of this report. Used for compatibility.
  * @param thresholds Thresholds for the status of the reported application.
  * @param projectRoot The optional location of the project root.
  * @param files All mutated files.
  */
final case class MutationTestResult(
    `$schema`: Option[String] = Some(
      "https://git.io/mutation-testing-report-schema"
    ),
    schemaVersion: String = "1",
    thresholds: Thresholds,
    projectRoot: Option[String] = None,
    files: FileResultDictionary
)

/** Mutated file
  *
  * @param source Full source code of the mutated file, this is used for highlighting.
  * @param mutants All mutants in this file.
  * @param language Programming language that is used. Used for code highlighting, see https://prismjs.com/#examples.
  */
final case class FileResult(source: String, mutants: Seq[MutantResult], language: String = "scala")

/** Single mutation.
  *
  * @param id Unique id, can be used to correlate this mutant with other reports.
  * @param mutatorName Category of the mutation.
  * @param replacement Actual mutation that has been applied.
  * @param location A location with start and end. Start is inclusive, end is exclusive.
  * @param status Result of the mutation.
  * @param description Description of the applied mutation.
  */
final case class MutantResult(
    id: String,
    mutatorName: String,
    replacement: String,
    location: Location,
    status: MutantStatus,
    description: Option[String] = None
)

/** A location with start and end. Start is inclusive, end is exclusive.
  *
  * @param start Starting location (inclusive).
  * @param end End location (exclusive).
  */
final case class Location(start: Position, end: Position)

/** Position of a mutation. Both line and column start at one.
  */
final case class Position(line: Int, column: Int)

/** Thresholds for the status of the reported application.
  *
  * @param high Higher bound threshold.
  * @param low Lower bound threshold.
  */
final case class Thresholds(high: Int, low: Int)
