namespace Mutation.Metrics.Core.Models
{
    public enum MutantStatus
    {
        Pending,
        Killed,
        Survived,
        Timeout,
        CompileError,
        RunTimeError,
        Ignored,
        NoCoverage
    }
}
