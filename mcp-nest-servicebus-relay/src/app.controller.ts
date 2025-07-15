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
  async relayPrompt(
    @Body('prompt') prompt: string,
    @Body('correlationId') correlationId?: string,
    @Body('tmxProjectUrl') tmxProjectUrl?: string,
  ): Promise<{ response: string; correlationId: string }> {
    const { response, usedCorrelationId } = await this.serviceBusRelayService.relayPrompt(prompt, correlationId, tmxProjectUrl);
    return { response, correlationId: usedCorrelationId };
  }
}
