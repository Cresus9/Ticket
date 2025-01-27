import { IsObject, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateTicketsDto {
  @ApiProperty({
    description: 'Object with ticket type IDs as keys and quantities as values',
    example: { 'ticket-type-1': 2, 'ticket-type-2': 1 }
  })
  @IsObject()
  tickets: { [key: string]: number };
}