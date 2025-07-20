import { Controller, Get } from '@nestjs/common';

@Controller('mcp/tools')
export class ToolsController {
  @Get()
  getTools() {
    // Dynamically import version from package.json
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { version } = require('../package.json');
    return [
      {
        name: 'relay-prompt',
        version,
        description: 'Relays a prompt to Azure Service Bus and waits for a response. Optionally accepts a correlationId and tmxProjectUrl.',
        parameters: {
          prompt: { type: 'string', required: true, description: 'Prompt to relay' },
          correlationId: { type: 'string', required: false, description: 'Optional correlation ID' },
          tmxProjectUrl: { type: 'string', required: false, description: 'Optional TMX project URL' },
        },
      },
    ];
  }
}
