import { IsBoolean, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiProperty({ type: [String], enum: NotificationType, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  types?: NotificationType[];
}