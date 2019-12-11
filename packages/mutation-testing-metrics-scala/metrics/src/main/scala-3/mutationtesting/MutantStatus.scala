package mutationtesting

enum MutantStatus {
  case Killed, Survived, NoCoverage, Timeout, CompileError, Ignored
}
