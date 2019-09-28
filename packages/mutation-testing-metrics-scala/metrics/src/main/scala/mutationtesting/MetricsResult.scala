package mutationtesting

import mutationtesting.MutantStatus.MutantStatus

sealed trait MetricsResult {

  /** At least one test failed while this mutant was active. The mutant is killed. This is what you want, good job!
    */
  def killed: Int

  /** All tests passed while this mutant was active. the mutant survived. You're missing a test for it.
    */
  def survived: Int

  /** The running of tests with this mutant active resulted in a timeout.
    * For example, the mutant resulted in an infinite loop in your code.
    * Don't spend too much attention to this mutant. It is counted as "detected".
    * The logic here is that if this mutant were to be injected in your code, your CI build would detect it, because the tests will never complete.
    */
  def timeout: Int

  /** No tests are executed to test this mutant, because the mutant is located in a part of the code that is not hit by any of your tests.
    * This means the mutant also survived and your missing a test case for it.
    */
  def noCoverage: Int

  /** The mutant resulted in a compiler error.
    * This can happen in compiled languages.
    * Don't spend too much attention looking at this mutant. It is not represented in your mutation score.
    */
  def compileErrors: Int

  /** The number of mutants detected by your tests.
    */
  lazy val totalDetected: Int = killed + timeout

  /** The number of mutants that are not detected by your tests.
    */
  lazy val totalUndetected: Int = survived + noCoverage

  /** The number of mutants that your tests produce code coverage for.
    */
  lazy val totalCovered: Int = totalDetected + survived

  /** The number of mutants that are valid.
    * They didn't result in a compile error or runtime error.
    */
  lazy val totalValid: Int = totalDetected + totalUndetected

  /** The number of mutants that are invalid.
    * They couldn't be tested because they produce either a compile error.
    */
  lazy val totalInvalid: Int = compileErrors

  /** All mutants.
    */
  lazy val totalMutants: Int = totalValid + totalInvalid

  /** The total percentage of mutants that were killed.
    */
  lazy val mutationScore: Double = percentage(totalDetected.toDouble, totalValid.toDouble)

  /** The total percentage of mutants that were killed based on the code coverage results.
    */
  lazy val mutationScoreBasedOnCoveredCode: Double = percentage(totalDetected.toDouble, totalCovered.toDouble)

  private def percentage(n: Double, divisor: Double): Double = divisor match {
    case 0 => 0
    case _ => (n / divisor) * 100
  }
}

sealed trait DirOps extends MetricsResult {
  val files: Iterable[MetricsResult]

  override lazy val killed: Int        = sumOfChildrenWith(_.killed)
  override lazy val timeout: Int       = sumOfChildrenWith(_.timeout)
  override lazy val survived: Int      = sumOfChildrenWith(_.survived)
  override lazy val noCoverage: Int    = sumOfChildrenWith(_.noCoverage)
  override lazy val compileErrors: Int = sumOfChildrenWith(_.compileErrors)

  private def sumOfChildrenWith[A](f: MetricsResult => A)(implicit num: Numeric[A]): A = files.map(f).sum
}

sealed trait FileOps extends MetricsResult {
  val mutants: Iterable[MetricMutant]

  override lazy val killed: Int        = countWhere(MutantStatus.Killed)
  override lazy val timeout: Int       = countWhere(MutantStatus.Timeout)
  override lazy val survived: Int      = countWhere(MutantStatus.Survived)
  override lazy val noCoverage: Int    = countWhere(MutantStatus.NoCoverage)
  override lazy val compileErrors: Int = countWhere(MutantStatus.CompileError)

  private def countWhere(mutantStatus: MutantStatus): Int = mutants.count(_.status == mutantStatus)
}

final case class MetricsResultRoot(files: Iterable[MetricsResult]) extends MetricsResult with DirOps

final case class Directory(dirName: String, files: Iterable[MetricsResult]) extends MetricsResult with DirOps

final case class File(fileName: String, mutants: Iterable[MetricMutant]) extends MetricsResult with FileOps

final case class MetricMutant(status: MutantStatus)
