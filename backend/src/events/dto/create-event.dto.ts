import { IsString, IsNumber, IsDateString, IsArray, IsEnum, IsOptional, Min, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';

export class CreateTicketTypeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  maxPerOrder: number;
}

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  time: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsUrl()
  imageUrl: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ enum: EventStatus, default: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus = EventStatus.DRAFT;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ type: [CreateTicketTypeDto] })
  @IsArray()
  ticketTypes: CreateTicketTypeDto[];
}