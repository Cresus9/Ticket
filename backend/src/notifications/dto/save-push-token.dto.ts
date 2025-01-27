import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SavePushTokenDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device?: string;
}