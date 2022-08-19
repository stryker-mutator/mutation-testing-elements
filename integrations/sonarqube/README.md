# SonarQube integration

A [jq](https://stedolan.github.io/jq/) filter is provided in [mutation-report-to-sonar.jq](mutation-report-to-sonar.jq) to convert a JSON [mutation testing report](../../packages/report-schema/) to the [SonarQube generic issue import format](https://docs.sonarqube.org/latest/analysis/generic-issue/).

Usage:

```
jq -f mutation-report-to-sonar.jq mutation.json > mutation-sonar.json
```

After `mutation-sonar.json` is generated, you can import it into SonarQube using the analysis parameter `sonar.externalIssuesReportPaths`. See [Generic Issue Import Format](https://docs.sonarqube.org/latest/analysis/generic-issue/) for more details.

Please note that:

- Only mutants with a state of **Survived** or **No coverage** are imported.
- Mutants are imported as [issues](https://docs.sonarqube.org/latest/user-guide/issues/) of type **Code Smell**, a severity of **MAJOR**, and an effort of 10 minutes.
- If the mutation testing report includes the `projectRoot` property, absolute file paths are converted to relative file paths to avoid issues with the [SonarScanner](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/) locating the source files.
