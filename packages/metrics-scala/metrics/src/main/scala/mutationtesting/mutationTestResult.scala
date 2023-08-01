package mutationtesting

/** Schema for a mutation testing report
  *
  * @param \$schema
  *   URL to the JSON schema.
  * @param schemaVersion
  *   Major version of this report. Used for compatibility.
  * @param thresholds
  *   Thresholds for the status of the reported application.
  * @param projectRoot
  *   The optional location of the project root.
  * @param files
  *   All mutated files.
  * @param testFiles
  *   Test file definitions by file path OR class name.
  * @param performance
  *   The performance statistics per phase. Total time should be roughly equal to the sum of all these.
  * @param framework
  *   Extra information about the framework used.
  * @param system
  *   Information about the system that performed mutation testing.
  * @param config
  *   Free-format object that represents the configuration used to run mutation testing.
  *
  * @tparam C
  *   type of the config object
  */
final case class MutationTestResult[+C](
    `$schema`: Option[String] = Some(
      "https://git.io/mutation-testing-schema"
    ),
    schemaVersion: String = "2",
    thresholds: Thresholds,
    projectRoot: Option[String] = None,
    files: FileResultDictionary,
    testFiles: Option[TestFileDefinitionDictionary] = None,
    performance: Option[PerformanceStatistics] = None,
    framework: Option[FrameworkInformation] = None,
    system: Option[SystemInformation] = None,
    config: Option[C] = None
)

/** Mutated file
  *
  * @param source
  *   Full source code of the mutated file, this is used for highlighting.
  * @param mutants
  *   All mutants in this file.
  * @param language
  *   Programming language that is used. Used for code highlighting, see https://prismjs.com/#examples.
  */
final case class FileResult(
    source: String,
    mutants: Seq[MutantResult],
    language: String = "scala"
)

/** A file containing one or more tests
  * @param source
  *   Full source code of the test file. This can be used to display in the report.
  * @param tests
  *   The tests contained in this test file.
  */
final case class TestFile(
    tests: Seq[TestDefinition],
    source: Option[String] = None
)

/** A test in your test file.
  *
  * @param id
  *   Unique id of the test, used to correlate what test killed a mutant.
  * @param name
  *   Name of the test, used to display the test.
  * @param location
  *   A [[mutationtesting.Location]] where `end` is not required
  */
final case class TestDefinition(
    id: String,
    name: String,
    location: Option[OpenEndLocation]
)

/** Single mutation.
  *
  * @param id
  *   Unique id, can be used to correlate this mutant with other reports.
  * @param mutatorName
  *   Category of the mutation.
  * @param replacement
  *   Actual mutation that has been applied.
  * @param location
  *   A location with start and end. Start is inclusive, end is exclusive.
  * @param status
  *   Result of the mutation.
  * @param statusReason
  *   The reason that this mutant has this status. In the case of a killed mutant, this should be filled with the
  *   failure message(s) of the failing tests. In case of an error mutant, this should be filled with the error message.
  * @param description
  *   Description of the applied mutation.
  * @param coveredBy
  *   The test ids that covered this mutant. If a mutation testing framework doesn't measure this information, it can
  *   simply be left out.
  * @param killedBy
  *   The test ids that killed this mutant. It is a best practice to "bail" on first failing test, in which case you can
  *   fill this array with that one test.
  * @param testsCompleted
  *   The number of tests actually completed in order to test this mutant. Can differ from `coveredBy` because of
  *   bailing a mutant test run after first failing test.
  * @param static
  *   A static mutant means that it was loaded once at during initialization, this makes it slow or even impossible to
  *   test, depending on the mutation testing framework.
  */
final case class MutantResult(
    id: String,
    mutatorName: String,
    replacement: String,
    location: Location,
    status: MutantStatus,
    statusReason: Option[String] = None,
    description: Option[String] = None,
    coveredBy: Option[Seq[String]] = None,
    killedBy: Option[Seq[String]] = None,
    testsCompleted: Option[Int] = None,
    static: Option[Boolean] = None
)

/** A location with start and end. Start is inclusive, end is exclusive.
  *
  * @param start
  *   Starting location (inclusive).
  * @param end
  *   End location (exclusive).
  */
final case class Location(start: Position, end: Position)

/** A [[mutationtesting.Location]] where `end` is not required. Start is inclusive, end is exclusive.
  *
  * @param start
  *   Starting location (inclusive).
  * @param end
  *   End location (exclusive).
  */
final case class OpenEndLocation(start: Position, end: Option[Position] = None)

/** Position of a mutation. Both line and column start at one.
  */
final case class Position(line: Int, column: Int)

/** The performance statistics per phase. Total time should be roughly equal to the sum of all these.
  *
  * @param setup
  *   Time it took to run the setup phase in milliseconds.
  * @param initialRun
  *   Time it took to run the initial test phase (dry-run) in milliseconds.
  * @param mutation
  *   Time it took to run the mutation test phase in milliseconds.
  */
final case class PerformanceStatistics(
    setup: Long,
    initialRun: Long,
    mutation: Long
)

/** Extra information about the framework used
  *
  * @param name
  *   Name of the framework used.
  * @param version
  *   Version of the framework used.
  * @param branding
  *   Extra branding information about the framework used.
  * @param dependencies
  *   Dependencies used by the framework. Key-value pair of dependencies and their versions.
  */
final case class FrameworkInformation(
    name: String,
    version: Option[String] = None,
    branding: Option[BrandingInformation] = None,
    dependencies: Option[Dependencies] = None
)

/** Extra branding information about the framework used.
  *
  * @param homepageUrl
  *   URL to the homepage of the framework.
  * @param imageUrl
  *   URL to an image for the framework, can be a data URL.
  */
final case class BrandingInformation(
    homepageUrl: String,
    imageUrl: Option[String] = None
)

/** Information about the system that performed mutation testing
  *
  * @param ci
  *   Did mutation testing run in a Continuous Integration environment (pipeline)? Note that there is no way of knowing
  *   this for sure. It's done on a best-effort basis.
  * @param os
  * @param cpu
  * @param ram
  */
final case class SystemInformation(
    ci: Boolean,
    os: Option[OSInformation] = None,
    cpu: Option[CpuInformation] = None,
    ram: Option[RamInformation] = None
)

/** @param platform
  *   Platform identifier
  * @param description
  *   Human-readable description of the OS
  * @param version
  *   Version of the OS or distribution
  */
final case class OSInformation(
    platform: String,
    description: Option[String] = None,
    version: Option[String] = None
)

/** @param logicalCores
  * @param baseClock
  *   Clock speed in MHz
  * @param model
  */
final case class CpuInformation(
    logicalCores: Int,
    baseClock: Option[Long] = None,
    model: Option[String] = None
)

/** @param total
  *   The total RAM of the system that performed mutation testing in MB. On the JVM, this can be the amount of memory
  *   available to the JVM instead of the system memory.
  */
final case class RamInformation(total: Long)
