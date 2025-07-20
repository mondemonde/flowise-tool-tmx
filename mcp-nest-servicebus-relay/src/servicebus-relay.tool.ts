import { Injectable } from '@nestjs/common';
import { Tool, Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { ServiceBusRelayService } from './servicebus-relay.service';

@Injectable()
export class ServiceBusRelayTool {
  constructor(private readonly relayService: ServiceBusRelayService) {}

  @Tool({
    name: 'relay-prompt',
    description: 'Relays a prompt to Azure Service Bus and waits for a response. Optionally accepts a correlationId and tmxProjectUrl.',
    parameters: z.object({
      prompt: z.string().min(1, 'Prompt is required'),
      correlationId: z.string().optional(),
      tmxProjectUrl: z.string().optional(),
    }),
  })
  async relayPromptTool(
    { prompt, correlationId, tmxProjectUrl }: { prompt: string; correlationId?: string; tmxProjectUrl?: string },
    context: Context
  ) {
    const { response, usedCorrelationId } = await this.relayService.relayPrompt(prompt, correlationId, tmxProjectUrl);
    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
      correlationId: usedCorrelationId,
    };
  }
}
