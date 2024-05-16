namespace Mutation.Metrics.Core.Models
{
    public struct JsonReport
    {
        public string SchemaVersion { get; set; }
        public IDictionary<string, int> Thresholds { get; set; } 
        public IDictionary<string, SourceFile> Files { get; set; }
    }

    public struct SourceFile
    {
        public ISet<JsonMutant> Mutants { get; set; }
    }

    public struct JsonMutant
    {
        public string Status { get; set; }
    }
}
