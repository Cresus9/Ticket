import { IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty()
  @IsString()
  qrCode: string;

  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class ValidateTicketDto {
  @ApiProperty()
  @IsString()
  qrCode: string;
}