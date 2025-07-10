import { Injectable } from '@nestjs/common';
const { nodeClass: ChatGptTmxNode } = require('../../../src/ChatGptTmxNode.js');
import { SendChatgptTmxMessageDto } from './dto/send-chatgpt-tmx-message.dto';

@Injectable()
export class PlaywrightService {
  async sendMessageToChatGPT(dto: SendChatgptTmxMessageDto): Promise<string> {
    // Use the new Patchright-based ChatGptTmxNode logic
    const node = new ChatGptTmxNode();
    const result = await node.init({
      inputs: {
        message: dto.message,
        timeout: dto.timeout ?? 30,
        headless: dto.headless ?? true,
      },
    });
    return result.response;
  }
}
