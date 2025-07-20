import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ServiceBusRelayService } from './servicebus-relay.service';
import * as fs from 'fs';
import * as path from 'path';

function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

@Controller('mcp')
export class McpController {
  constructor(private readonly serviceBusRelayService: ServiceBusRelayService) {}

  @Get('tools')
  getTools() {
    return [
      {
        name: 'relay_prompt',
        description: 'Relay a prompt/query to Azure Service Bus and wait for a response.',
        version: getVersion(),
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

  /**
   * Dummy SSE endpoint for MCP compatibility.
   * Streams a single dummy event and keeps the connection open for a short time.
   */
  @Get('stream')
  dummySse(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send a dummy event
    res.write(`data: {"event":"dummy","message":"SSE endpoint active"}\n\n`);

    // Optionally keep the connection open for a while, then close
    setTimeout(() => {
      res.write(`data: {"event":"close","message":"Closing dummy SSE"}\n\n`);
      res.end();
    }, 5000);
  }
}
