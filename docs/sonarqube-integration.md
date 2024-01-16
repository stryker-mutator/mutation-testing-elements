---
title: SonarQube integration
custom_edit_url: https://github.com/stryker-mutator/mutation-testing-elements/edit/master/docs/sonarqube-integration.md
---

A [jq](https://stedolan.github.io/jq/) filter can be downloaded from [mutation-report-to-sonar.jq](https://github.com/stryker-mutator/mutation-testing-elements/blob/master/integrations/mutation-report-to-sonar.jq) to convert a [JSON mutation testing report](https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/report-schema) to the [SonarQube generic issue import format](https://docs.sonarqube.org/latest/analysis/generic-issue/).

Usage:

```
jq -f mutation-report-to-sonar.jq mutation.json > mutation-sonar.json
```

After `mutation-sonar.json` is generated, you can import the file into SonarQube using the analysis parameter `sonar.externalIssuesReportPaths`. The mutation testing results will be imported as [external issues](https://docs.sonarqube.org/latest/analysis/generic-issue/). There are a couple of limitations with importing external issues:

- You can't manage them within SonarQube; for instance, there is no ability to mark them False Positive.
- You can't manage the activation of the rules that raise these issues within SonarQube. External rules aren't visible on the Rules page or reflected in Quality Profiles.

External issues and the rules that raise them must be managed in the configuration of Stryker.

When importing mutation testing results using this method:

- Only mutants with a state of **Survived** or **No coverage** are imported.
- Mutants are imported as [issues](https://docs.sonarqube.org/latest/user-guide/issues/) of type **Code Smell** with a severity of **MAJOR** and an effort of 10 minutes.
- If the mutation testing report includes the `projectRoot` property, absolute file paths are converted to relative file paths to avoid issues with the [SonarScanner](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/) locating the source files.
