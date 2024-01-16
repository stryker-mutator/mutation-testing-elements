package mutationtesting

object Metrics {

  def calculateMetrics(
      mutationTestReport: MutationTestResult[Any]
  ): MetricsResult =
    calculateMetrics(mutationTestReport.files)

  def calculateMetrics(
      mutationTestResults: FileResultDictionary
  ): MetricsResult =
    MetricsResultRoot(
      parseMutationTestResults(
        mutationTestResults
          .map { case (name, result) => (name.split("/").toSeq, result) }
      )
    )

  private def parseMutationTestResults(
      results: Map[Seq[String], FileResult]
  ): Seq[MetricsResult] = {
    val (rootFiles, directories) = results.partition(_._1.size == 1)

    directories
      .groupBy(_._1.head)
      .map(a => (a._1, a._2.map(b => (b._1.tail, b._2))))
      .map { case (name, result) =>
        MetricsDirectory(name, parseMutationTestResults(result))
      }
      .toSeq
      .sortBy(_.dirName) ++
      rootFiles.map { case (name, result) =>
        MetricsFile(name.head, result.mutants.map(m => MetricMutant(m.status)))
      }
  }
}
