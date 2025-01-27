import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EventStatus } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
  }) {
    const { skip, take, where } = params;
    return this.prisma.event.findMany({
      skip,
      take,
      where,
      include: {
        ticketTypes: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(data: CreateEventDto) {
    const { ticketTypes, ...eventData } = data;

    return this.prisma.event.create({
      data: {
        ...eventData,
        ticketTypes: {
          create: ticketTypes.map(ticket => ({
            ...ticket,
            available: ticket.quantity
          }))
        }
      },
      include: {
        ticketTypes: true,
      },
    });
  }

  async update(id: string, data: UpdateEventDto) {
    const { ticketTypes, ...eventData } = data;

    // First, update the event
    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: eventData,
    });

    // If ticket types are provided, update them
    if (ticketTypes && ticketTypes.length > 0) {
      // Get existing ticket types
      const existingTicketTypes = await this.prisma.ticketType.findMany({
        where: { eventId: id }
      });

      // Create new ticket types and update existing ones
      for (const ticketType of ticketTypes) {
        const existing = existingTicketTypes.find(t => t.id === ticketType.id);
        if (existing) {
          await this.prisma.ticketType.update({
            where: { id: existing.id },
            data: {
              ...ticketType,
              available: ticketType.quantity
            }
          });
        } else {
          await this.prisma.ticketType.create({
            data: {
              ...ticketType,
              eventId: id,
              available: ticketType.quantity
            }
          });
        }
      }
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, status: EventStatus) {
    return this.prisma.event.update({
      where: { id },
      data: { status },
      include: {
        ticketTypes: true,
      },
    });
  }

  async delete(id: string) {
    // First delete all related ticket types
    await this.prisma.ticketType.deleteMany({
      where: { eventId: id }
    });

    // Then delete the event
    return this.prisma.event.delete({
      where: { id },
    });
  }
}