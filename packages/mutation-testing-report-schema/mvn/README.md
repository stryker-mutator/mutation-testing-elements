# Maven artifacts

This is the base for the deployment of the packages to Sonatype, so they can be used in any Java/Scala/etc project. 

There are no classes or source files in the project. Instead, only the resources are included in the project. The used resources are the `dist/` folder for each project, with the packaged resources in `$project-name/` for the corresponding project. It should only be built after the npm project is built.

There is no version defined in the project. Instead, the version is read in the `package.json` of the npm project, and set in the release script (`mvnPublish.sh`).

The artifacts can be added as follows (replace `mutation-testing-elements` with `mutation-testing-report-schema` if you need the report):

Maven:

```xml
<dependency>
    <groupId>io.stryker-mutator</groupId>
    <artifactId>mutation-testing-elements</artifactId>
    <version>${mutation-testing-elements.version}</version> <!-- Version defined elsewhere -->
</dependency>
```

Sbt:

```scala
libraryDependencies += "io.stryker-mutator" % "mutation-testing-elements" % elementsVersion // Version defined elsewhere
```

Replace `mutation-testing-elements` with `mutation-testing-report-schema` if you need the report.
