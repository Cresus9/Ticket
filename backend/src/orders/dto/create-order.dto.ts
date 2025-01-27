import { IsString, IsNumber, IsUUID, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderTicketDto {
  @ApiProperty()
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty({ type: [OrderTicketDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderTicketDto)
  tickets: OrderTicketDto[];

  @ApiProperty()
  @IsString()
  paymentMethod: string;
}