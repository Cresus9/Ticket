import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@Controller('api/bookings')  // Updated path to include 'api' prefix
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns user bookings' })
  async getUserBookings(@Request() req) {
    return this.bookingsService.getUserBookings(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking created successfully' })
  async createBooking(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.id, createBookingDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns booking details' })
  async getBooking(@Request() req, @Param('id') id: string) {
    return this.bookingsService.getBooking(req.user.id, id);
  }
}