using AzureTranslator.Services;

using Core;
using Core.AzureTranslator.Services;
using Core.HubSpot.Services;
using Core.KenticoKontent.Services;

using Functions;

using HubSpot.Services;

using KenticoKontent.Services;

using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Functions
{
    /// <summary>
    /// Runs when the Azure Functions host starts.
    /// </summary>
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder functionsHostBuilder)
        {
            var configuration = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .Build();

            var settings = new Settings();

            ConfigurationBinder.Bind(configuration, settings);

            functionsHostBuilder.Services
                .AddSingleton(_ => settings);

            functionsHostBuilder.Services
                .AddSingleton<ITextAnalyzer, TextAnalyzer>()
                .AddHttpClient<ITranslationService, TranslationService>();

            functionsHostBuilder.Services
                .AddSingleton<IHubSpotApiCache, HubSpotApiCache>()
                .AddHttpClient<IHubSpotRepository, HubSpotRepository>();

            functionsHostBuilder.Services
                .AddTransient<IWebhookValidator, WebhookValidator>()
                .AddSingleton<IKontentApiTracker, KontentApiTracker>()
                .AddSingleton<IKontentRateLimiter, KontentRateLimiter>()
                .AddHttpClient<IKontentRepository, KontentRepository>();
        }
    }
}