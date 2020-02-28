# NPM projects & publishing

There are two npm projects in this repository that are useful to be published to Sonatype for use in Java/Scala/etc projects:

- `mutation-testing-report-schema`
- `mutation-testing-elements`

To add the projects to your depedencies (replace `mutation-testing-elements` with `mutation-testing-report-schema` if you need the JSON schema):

## Maven:

```xml
<dependency>
    <groupId>io.stryker-mutator</groupId>
    <artifactId>mutation-testing-elements</artifactId>
    <version>${mutation-testing-elements.version}</version> <!-- Version defined elsewhere -->
</dependency>
```

## Sbt:

```scala
libraryDependencies += "io.stryker-mutator" % "mutation-testing-elements" % elementsVersion // Version defined elsewhere
```

## Usage

The projects are empty, save for resources from the dist folder of the npm projects. The resources are under the project name folder. For example, to get the html report js file:

```java
this.getClass().getClassLoader().getResourceAsStream("mutation-testing-elements/mutation-test-elements.js")
```

## Publishing

To work with the npm projects, two empty sbt projects are added. When nothing is configured, they'll have `skip in publish := true` set by sbt. This way they won't be published along with the rest of the projects.

When, for example, `mutation-testing-elements` is published there is a postPublish step that calls a [script](./npmProjPublish.sh) with the environment variable `PUBLISH_ELEMENTS=true`. The script copies over the `dist` files from the npm project to the resources folder of the sbt project and calls `sbt publish`. When the `PUBLISH_ELEMENTS` variable is true, only the elements project will be published (`skip in publish := false` for that project), and all the other projects will be skipped (`skip in publish := true`). The schema project is published the same way, but the the `PUBLISH_SCHEMA` environment variable.
