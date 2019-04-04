# Maven project

This Maven project is used to deploy the `mutation-testing-elements` to Sonatype. This way, the project can be easily added in a Java/Scala/etc project.

There are no classes or source files in the project. Instead, only the resources are included in the project. The resources folder is `../dist/` (relative to this folder), so should only be built after the npm project is built.

There is no version defined in the project. Instead, the version is read in the `package.json` of the npm project, and set in the release script (`mvnPublish.sh`).
