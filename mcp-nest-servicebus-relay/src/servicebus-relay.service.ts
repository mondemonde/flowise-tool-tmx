import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver, ServiceBusReceivedMessage } from '@azure/service-bus';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ServiceBusRelayService {
  private readonly logger = new Logger(ServiceBusRelayService.name);

  // TODO: Replace with your actual Service Bus connection string and queue names
  private readonly connectionString = process.env.AZURE_SERVICEBUS_CONNECTION_STRING || '<SERVICE_BUS_CONNECTION_STRING>';
  private readonly requestQueue = process.env.AZURE_SERVICEBUS_REQUEST_QUEUE || '<REQUEST_QUEUE_NAME>';
  private readonly responseQueue = process.env.AZURE_SERVICEBUS_RESPONSE_QUEUE || '<RESPONSE_QUEUE_NAME>';

  private sbClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;

  constructor() {
    this.sbClient = new ServiceBusClient(this.connectionString);
    this.sender = this.sbClient.createSender(this.requestQueue);
    this.receiver = this.sbClient.createReceiver(this.responseQueue);
  }

  /**
   * Sends a message to the request queue and waits for a response with the same correlationId.
   * @param prompt The prompt/query text to relay.
   * @returns The response text from the service bus.
   */
  async relayPrompt(prompt: string, correlationId?: string, tmxProjectUrl?: string): Promise<{ response: string; usedCorrelationId: string }> {
    const usedCorrelationId = correlationId || uuidv4();

    // Send the request message
    await this.sender.sendMessages({
      body: { prompt, tmxProjectUrl },
      correlationId: usedCorrelationId,
      replyTo: this.responseQueue,
    });

    this.logger.log(`Sent prompt with correlationId: ${usedCorrelationId}${tmxProjectUrl ? ` and tmxProjectUrl: ${tmxProjectUrl}` : ''}`);

    // Wait for the response with the same correlationId
    const response = await this.waitForResponse(usedCorrelationId);

    return { response, usedCorrelationId };
  }

  /**
   * Waits for a message with the given correlationId on the response queue.
   * @param correlationId The correlation ID to match.
   * @returns The response text.
   */
  private async waitForResponse(correlationId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const subscription = this.receiver.subscribe({
        async processMessage(message: ServiceBusReceivedMessage) {
          if (message.correlationId === correlationId) {
            resolve(message.body?.response || message.body);
            // Close the subscription after receiving the response
            await subscription.close();
          }
        },
        async processError(args) {
          reject(args.error);
        },
      });

      // Timeout after 60 seconds
      setTimeout(async () => {
        await subscription.close();
        reject(new Error('Timeout waiting for response from Service Bus'));
      }, 60000);
    });
  }
}
