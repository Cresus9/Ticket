import { IsString, IsNumber, IsDateString, IsArray, IsEnum, IsOptional, Min, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';
import { CreateTicketTypeDto } from './create-event.dto';

export class UpdateEventDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiProperty({ enum: EventStatus, required: false })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ type: [CreateTicketTypeDto], required: false })
  @IsOptional()
  @IsArray()
  ticketTypes?: CreateTicketTypeDto[];
}