import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { PlaywrightService } from './playwright.service';

@Module({
  controllers: [McpController],
  providers: [McpService, PlaywrightService],
})
export class McpModule {}
