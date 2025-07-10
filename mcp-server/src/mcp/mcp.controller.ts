import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { McpService } from './mcp.service';
import { SendChatgptTmxMessageDto } from './dto/send-chatgpt-tmx-message.dto';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post('send-chatgpt-tmx-message')
  async sendChatgptTmxMessage(@Body() dto: SendChatgptTmxMessageDto) {
    try {
      return await this.mcpService.sendChatgptTmxMessage(dto);
    } catch (error) {
      throw new HttpException(
        {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
