import { IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketTypeDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

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
  @Max(10)
  maxPerOrder: number;
}

export class UpdateTicketTypeDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @Max(10)
  maxPerOrder?: number;
}