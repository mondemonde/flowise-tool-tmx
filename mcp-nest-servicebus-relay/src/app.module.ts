import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceBusRelayService } from './servicebus-relay.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ServiceBusRelayService],
})
export class AppModule {}
