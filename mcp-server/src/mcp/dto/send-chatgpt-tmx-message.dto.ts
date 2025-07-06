import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SendChatgptTmxMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsNumber()
  timeout?: number;

  @IsOptional()
  @IsBoolean()
  headless?: boolean;
}
