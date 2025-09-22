namespace Mutation.Metrics.Core.Models
{
    public struct MetricResult
    {
        public double Detected { get; private set; }
        public double Undetected { get; private set; }
        public double Covered { get; private set; }
        public double Valid { get; private set; }
        public double Invalid { get; private set; }
        public double TotalMutants { get; private set; }
        public double MutatioScore { get; private set; }
        public double MutatioScoreBasedOnCoveredCode { get; private set; }


        public MetricResult(double killed, double timeOut, double survived, double noCoverage, double runtimeErrors, double compileErrors, double ignored, double pending)
        {
            Detected = killed + timeOut;
            Undetected = survived + noCoverage;
            Covered = Detected + survived;
            Valid = Detected+ Undetected;
            Invalid = runtimeErrors + compileErrors;
            TotalMutants = Valid + Invalid + ignored + pending;
            MutatioScore = (Detected / Valid) * 100;
            MutatioScoreBasedOnCoveredCode = (Detected / Covered) * 100;
        }
    }
}
