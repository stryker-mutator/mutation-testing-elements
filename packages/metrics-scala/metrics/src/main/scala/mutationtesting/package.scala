package object mutationtesting {

  /** All mutated files, with the relative path of the file as the key
    */
  type FileResultDictionary = Map[String, FileResult]

  /** Test file definitions by file path OR class name.
    */
  type TestFileDefinitionDictionary = Map[String, TestFile]

  /** Dependencies used by the framework. Key-value pair of dependencies and their versions.
    */
  type Dependencies = Map[String, String]
}
