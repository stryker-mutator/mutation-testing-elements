package mutationtesting

object MutantStatus extends Enumeration {
  type MutantStatus = Value

  val Killed, Survived, NoCoverage, Timeout, CompileError, Ignored = Value
}
