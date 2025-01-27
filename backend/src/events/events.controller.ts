import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-status.dto';
import { EventStatus } from '@prisma/client';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all events' })
  async findAll(
    @Query('featured') featured?: boolean,
    @Query('category') category?: string,
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.findAll({
      where: {
        ...(featured !== undefined && { featured }),
        ...(category && { categories: { has: category } }),
        ...(status && { status }),
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the event' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Event created successfully' })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Event updated successfully' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Event status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateEventStatusDto
  ) {
    return this.eventsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Event deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}