package mutationtesting

object Metrics {

  def calculateMetrics(mutationTestReport: MutationTestReport): MetricsResult =
    calculateMetrics(mutationTestReport.files)

  def calculateMetrics(mutationTestResults: Map[String, MutationTestResult]): MetricsResult =
    MetricsResultRoot(
      parseMutationTestResults(
        mutationTestResults
          .map({ case (name, result) => (name.split("/").toIterable, result) })
      )
    )

  private def parseMutationTestResults(results: Map[Iterable[String], MutationTestResult]): Iterable[MetricsResult] = {
    val (rootFiles, directories) = results.partition(_._1.size == 1)

    directories
      .groupBy(_._1.head)
      .map(a => (a._1, a._2.map(b => (b._1.tail, b._2))))
      .map({
        case (name, result) => Directory(name, parseMutationTestResults(result))
      })
      .toSeq
      .sortBy(_.dirName) ++
      rootFiles.map({
        case (name, result) => File(name.head, result.mutants.map(m => MetricMutant(m.status)))
      })
  }
}
