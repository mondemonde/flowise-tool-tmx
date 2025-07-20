import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceBusRelayService } from './servicebus-relay.service';
import { ServiceBusRelayTool } from './servicebus-relay.tool';
import { ToolsController } from './tools.controller';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'mcp-nest-servicebus-relay',
      version: '0.0.4',
      streamableHttp: {
        statelessMode: true,
      },
    }),
  ],
  controllers: [AppController, ToolsController],
  providers: [AppService, ServiceBusRelayService, ServiceBusRelayTool],
})
export class AppModule {}
