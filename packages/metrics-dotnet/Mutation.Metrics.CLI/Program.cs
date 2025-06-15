using Mutation.Metrics.Core;
using System.Text.Json;


for (int i = 0; i < args?.Length; i++)
{
	if (args[i] == "--reporter")
	{
        var report = Metrics.GenerateScore(args[i+1]);
        var json = JsonSerializer.Serialize(report);
        Console.WriteLine(json);
    }
}
