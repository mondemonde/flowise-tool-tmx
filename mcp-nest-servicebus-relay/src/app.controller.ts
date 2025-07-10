import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ServiceBusRelayService } from './servicebus-relay.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly serviceBusRelayService: ServiceBusRelayService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('relay')
  async relayPrompt(@Body('prompt') prompt: string): Promise<{ response: string }> {
    const response = await this.serviceBusRelayService.relayPrompt(prompt);
    return { response };
  }
}
