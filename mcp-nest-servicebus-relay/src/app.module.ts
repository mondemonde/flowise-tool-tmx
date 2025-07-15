import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceBusRelayService } from './servicebus-relay.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [],
  controllers: [AppController, McpController],
  providers: [AppService, ServiceBusRelayService],
})
export class AppModule {}
