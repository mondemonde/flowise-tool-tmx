import { Controller, Get, Post, Body, Sse, MessageEvent } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { ServiceBusRelayService } from './servicebus-relay.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly serviceBusRelayService: ServiceBusRelayService) {}

  @Get('tools')
  getTools() {
    return [
      {
        name: 'relay_prompt',
        description: 'Relay a prompt/query to Azure Service Bus and wait for a response.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Prompt or query to relay', minLength: 1 },
            correlationId: { type: 'string', description: 'Correlation ID for tracking', minLength: 1 },
            tmxProjectUrl: { type: 'string', description: 'TMX project URL', minLength: 1 }
          },
          required: ['prompt', 'correlationId', 'tmxProjectUrl'],
          additionalProperties: false
        }
      }
    ];
  }

  @Post('tool/relay_prompt')
  async invokeRelayPrompt(
    @Body('prompt') prompt: string,
    @Body('correlationId') correlationId: string,
    @Body('tmxProjectUrl') tmxProjectUrl: string,
  ): Promise<{ response: string; correlationId: string }> {
    const { response, usedCorrelationId } = await this.serviceBusRelayService.relayPrompt(prompt, correlationId, tmxProjectUrl);
    return { response, correlationId: usedCorrelationId };
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return of({ data: 'SSE not implemented yet' });
  }
}
