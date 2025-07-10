import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusSender,
  ServiceBusReceiver,
  ProcessErrorArgs,
} from '@azure/service-bus';

@Injectable()
export class ServiceBusListenerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ServiceBusListenerService.name);

  private readonly connectionString =
    process.env.AZURE_SERVICEBUS_CONNECTION_STRING ||
    '<SERVICE_BUS_CONNECTION_STRING>';
  private readonly requestQueue =
    process.env.AZURE_SERVICEBUS_REQUEST_QUEUE || '<REQUEST_QUEUE_NAME>';
  private readonly responseQueue =
    process.env.AZURE_SERVICEBUS_RESPONSE_QUEUE || '<RESPONSE_QUEUE_NAME>';

  private sbClient: ServiceBusClient;
  private receiver: ServiceBusReceiver;
  private sender: ServiceBusSender;
  private subscription: ReturnType<ServiceBusReceiver['subscribe']> | null =
    null;

  async onModuleInit() {
    this.sbClient = new ServiceBusClient(this.connectionString);
    this.receiver = this.sbClient.createReceiver(this.requestQueue);
    this.sender = this.sbClient.createSender(this.responseQueue);

    this.logger.log(`Listening for messages on queue: ${this.requestQueue}`);

    this.subscription = this.receiver.subscribe({
      processMessage: async (message: ServiceBusReceivedMessage) => {
        try {
          const prompt = message.body?.prompt || message.body;
          const correlationId = message.correlationId;
          this.logger.log(
            `Received prompt: ${prompt} (correlationId: ${correlationId})`,
          );

          // Process the prompt (for now, just echo it back)
          const responseText = `Echo: ${prompt}`;

          // Send response to response queue
          await this.sender.sendMessages({
            body: { response: responseText },
            correlationId,
          });

          this.logger.log(`Sent response for correlationId: ${correlationId}`);
        } catch (err) {
          this.logger.error('Error processing message', err);
        }
      },
      processError: async (args: ProcessErrorArgs) => {
        this.logger.error('Service Bus error', args.error);
      },
    });
  }

  async onModuleDestroy() {
    if (this.subscription) {
      await this.subscription.close();
    }
    if (this.receiver) {
      await this.receiver.close();
    }
    if (this.sender) {
      await this.sender.close();
    }
    if (this.sbClient) {
      await this.sbClient.close();
    }
  }
}
