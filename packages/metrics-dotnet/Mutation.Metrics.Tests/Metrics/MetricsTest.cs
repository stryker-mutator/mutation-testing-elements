using FluentAssertions;

namespace Mutation.Metrics.Core
{
    public class MetricsTest
    {

        [Fact]
        public void Metrics_GenerateScore_Success()
        {
            var result = Metrics.GenerateScore("ReportSample//stryker-report.json");
            result.Covered.Should().Be(24);
        }
    }
}