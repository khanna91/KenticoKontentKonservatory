using System;
using System.Threading.Tasks;

using Azure.Storage.Queues;

using Core.Gatsby.Models;
using Core.Gatsby.Services;

using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

namespace Functions.Timers
{
    public class ProcessGatsbyQueue : BaseFunction
    {
        private readonly QueueClient queueClient;
        private readonly IGatsbyProxy gatsbyProxy;

        public ProcessGatsbyQueue(
            ILogger<ProcessGatsbyQueue> logger,
            QueueClient queueClient,
            IGatsbyProxy gatsbyProxy
            ) : base(logger)
        {
            this.queueClient = queueClient;
            this.gatsbyProxy = gatsbyProxy;
        }

        [FunctionName(nameof(ProcessGatsbyQueue))]
        public async Task Run(
            [TimerTrigger(
                "%Gatsby:QueueSchedule%",
                UseMonitor = false
            )]TimerInfo timer
            )
        {
            try
            {
                var message = queueClient.PeekMessage();

                var queueItem = JsonConvert.DeserializeObject<QueueItem>(message.Value.Body.ToString());

                queueClient.ClearMessages();

                await gatsbyProxy.ForwardWebhook(queueItem.Webhook, queueItem.GatsbyWebhook);
            }
            catch (Exception ex)
            {
                LogException(ex);
            }
        }
    }
}