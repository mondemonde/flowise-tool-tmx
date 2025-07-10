import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { PlaywrightService } from './playwright.service';
import { ServiceBusListenerService } from './servicebus-listener.service';

@Module({
  controllers: [McpController],
  providers: [McpService, PlaywrightService, ServiceBusListenerService],
})
export class McpModule {}
