import { IsString, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TicketSelectionDto {
  @ApiProperty()
  @IsString()
  ticketTypeId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty({ type: [TicketSelectionDto] })
  @ValidateNested({ each: true })
  @Type(() => TicketSelectionDto)
  tickets: TicketSelectionDto[];

  @ApiProperty()
  @IsString()
  paymentMethod: string;
}