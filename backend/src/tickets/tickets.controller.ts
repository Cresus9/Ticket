import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ValidateTicketsDto } from './dto/validate-tickets.dto';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':eventId/validate')
  @ApiOperation({ summary: 'Validate tickets availability' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tickets validated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Event not found' })
  async validateTickets(
    @Param('eventId') eventId: string,
    @Body() validateTicketsDto: ValidateTicketsDto
  ) {
    return this.ticketsService.validateTickets(eventId, validateTicketsDto.tickets);
  }
}