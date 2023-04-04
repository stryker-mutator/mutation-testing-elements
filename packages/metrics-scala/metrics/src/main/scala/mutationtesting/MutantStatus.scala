package mutationtesting

/** Result of the mutation. */
sealed trait MutantStatus extends Product with Serializable

object MutantStatus {

  case object Killed       extends MutantStatus
  case object Survived     extends MutantStatus
  case object NoCoverage   extends MutantStatus
  case object Timeout      extends MutantStatus
  case object CompileError extends MutantStatus
  case object RuntimeError extends MutantStatus
  case object Ignored      extends MutantStatus
  case object Pending      extends MutantStatus

}
