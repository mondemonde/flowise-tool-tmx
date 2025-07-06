import { Injectable } from '@nestjs/common';
import { SendChatgptTmxMessageDto } from './dto/send-chatgpt-tmx-message.dto';
import { PlaywrightService } from './playwright.service';

@Injectable()
export class McpService {
  constructor(private readonly playwrightService: PlaywrightService) {}

  async sendChatgptTmxMessage(dto: SendChatgptTmxMessageDto) {
    // Call PlaywrightService to automate browser and get response
    const responseText = await this.playwrightService.sendMessageToChatGPT(dto);
    return {
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
    };
  }
}
