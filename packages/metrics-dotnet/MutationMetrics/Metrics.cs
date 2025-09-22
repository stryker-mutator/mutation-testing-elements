using Mutation.Metrics.Core.Models;
using System.Text.Json;

namespace Mutation.Metrics.Core
{
    public static class Metrics
    {
        public static MetricResult GenerateScore(string fullPath)
        {
            try
            {
                double killed = 0;
                double timeOut = 0;
                double survived = 0;
                double noCoverage = 0;
                double runtimeErrors = 0;
                double compileErrors = 0;
                double ignored = 0;
                double pending = 0;

                using StreamReader reader = new(fullPath);
                var reporterFile = reader.ReadToEnd();

                JsonReport report = JsonSerializer.Deserialize<JsonReport>(reporterFile, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                foreach (var files in (report.Files))
                {
                    foreach (var mutants in files.Value.Mutants)
                    {
                        var status = Enum.Parse<MutantStatus>(mutants.Status);
                        switch (status)
                        {
                            case MutantStatus.Killed:
                                killed++;
                                break;
                            case MutantStatus.Timeout:
                                timeOut++;
                                break;
                            case MutantStatus.Survived:
                                survived++;
                                break;
                            case MutantStatus.NoCoverage:
                                noCoverage++;
                                break;
                            case MutantStatus.CompileError:
                                compileErrors++;
                                break;                            
                            case MutantStatus.Ignored:
                                ignored++;
                                break;
                            case MutantStatus.Pending:
                                pending++;
                                break;
                            case MutantStatus.RunTimeError:
                                runtimeErrors++;
                                break;
                        }
                    }
                }
                return new MetricResult(killed, timeOut, survived, noCoverage, runtimeErrors, compileErrors, ignored, pending);
            }
            catch (IOException e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }
            return new MetricResult();
        }
    }
}
